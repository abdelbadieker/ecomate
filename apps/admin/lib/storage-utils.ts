import { SupabaseClient } from '@supabase/supabase-js';

const UPLOAD_ENDPOINT = '/api/admin/uploads';

export interface UploadOptions {
  bucket: string;
  path?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  timeoutMs?: number;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  url: string | null;
  error: string | null;
  fileName: string | null;
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException && error.name === 'AbortError'
  ) || (
    error instanceof Error && error.name === 'AbortError'
  );
}

export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    bucket,
    path = '',
    maxSizeMB = 2048,
    allowedTypes = [],
    timeoutMs = 1800000,
    signal,
  } = options;

  if (!file) return { url: null, error: 'No file provided', fileName: null };
  if (signal?.aborted) return { url: null, error: 'Upload cancelled', fileName: null };

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { url: null, error: `File size exceeds ${maxSizeMB}MB limit`, fileName: null };
  }

  if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.includes(type))) {
    return { url: null, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`, fileName: null };
  }

  const requestController = new AbortController();
  const cancelRequest = () => requestController.abort();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, timeoutMs);

  signal?.addEventListener('abort', cancelRequest, { once: true });

  try {
    options.onProgress?.(0);

    // 1. Get signed URL from our API
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bucket,
        path,
        fileName: file.name,
      }),
      signal: requestController.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.signedUrl) {
      throw new Error(payload?.error || `Failed to get upload URL (status ${response.status})`);
    }

    options.onProgress?.(20);

    // 2. Upload file directly to Supabase Storage using the signed URL
    const uploadResponse = await fetch(payload.signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      signal: requestController.signal,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => '');
      throw new Error(`Upload to storage failed (${uploadResponse.status}): ${errorText}`);
    }

    options.onProgress?.(100);

    return {
      url: payload.url || null,
      error: null,
      fileName: payload.fileName || file.name,
    };
  } catch (err: unknown) {
    if (signal?.aborted || isAbortError(err)) {
      return {
        url: null,
        error: timedOut ? 'Upload timeout: connection too slow or file too large.' : 'Upload cancelled',
        fileName: null,
      };
    }

    const error = err as { message?: string };
    console.error(`[StorageUtil] Upload to ${bucket} failed:`, error);
    return {
      url: null,
      error: error.message || 'Upload failed',
      fileName: null,
    };
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', cancelRequest);
  }
}
