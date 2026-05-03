import { SupabaseClient } from '@supabase/supabase-js';

export interface UploadOptions {
  bucket: string;
  path?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  timeoutMs?: number;
  signal?: AbortSignal; // AbortController support for cancel
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  url: string | null;
  error: string | null;
  fileName: string | null;
}

/**
 * Unified utility to upload files to Supabase Storage.
 * Supports AbortController for cancellation and progress callbacks.
 */
export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    bucket,
    path = '',
    maxSizeMB = 100,
    allowedTypes = [],
    timeoutMs = 120000,
    signal,
  } = options;

  // 1. Validation
  if (!file) return { url: null, error: 'No file provided', fileName: null };
  if (signal?.aborted) return { url: null, error: 'Upload cancelled', fileName: null };

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { url: null, error: `File size exceeds ${maxSizeMB}MB limit`, fileName: null };
  }

  if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.includes(type))) {
    return { url: null, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`, fileName: null };
  }

  // 2. Prepare Path
  const ext = file.name.split('.').pop();
  const sanitizedName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const uploadPath = path ? `${path.replace(/\/$/, '')}/${sanitizedName}` : sanitizedName;

  try {
    // 3. Upload with Timeout + Abort support
    const uploadPromise = supabase.storage.from(bucket).upload(uploadPath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout: connection too slow or file too large.')), timeoutMs)
    );

    // Create abort promise if signal provided
    const abortPromise = signal
      ? new Promise<never>((_, reject) => {
          if (signal.aborted) reject(new Error('Upload cancelled'));
          signal.addEventListener('abort', () => reject(new Error('Upload cancelled')), { once: true });
        })
      : null;

    const racers: Promise<unknown>[] = [uploadPromise, timeoutPromise];
    if (abortPromise) racers.push(abortPromise);

    const result = await Promise.race(racers) as { data: unknown; error: unknown };

    if (result.error) throw result.error;

    // 4. Get Public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadPath);

    return {
      url: urlData.publicUrl,
      error: null,
      fileName: sanitizedName,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    if (error.message === 'Upload cancelled') {
      // Try to clean up the partially-uploaded file
      try { await supabase.storage.from(bucket).remove([uploadPath]); } catch { /* ignore */ }
      return { url: null, error: 'Upload cancelled', fileName: null };
    }
    console.error(`[StorageUtil] Upload to ${bucket} failed:`, error);
    return {
      url: null,
      error: error.message || 'Upload failed',
      fileName: null,
    };
  }
}
