'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/storage-utils';
import { Video, Trash2, Upload, Loader2, Play } from 'lucide-react';

interface DemoVideo {
  id: string;
  section_name: string;
  video_url: string;
  created_at: string;
}

const SECTIONS = [
  { id: 'ai_chatbot', label: 'AI Chatbot Setup Demo' },
  { id: 'homepage_showcase', label: 'Homepage Showcase' },
];

export default function DemoVideosPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const supabase = createClient();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/demo-videos');
      const { data } = await res.json();
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section_name: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    setUploadingSection(section_name);
    
    try {
      // 1. Upload to Supabase Storage
      const result = await uploadFile(supabase, file, {
        bucket: 'platform-assets',
        path: `demo_videos/${section_name}_${Date.now()}`
      });

      if (result.error || !result.url) {
        throw new Error(result.error || 'Failed to upload video');
      }

      // 2. Save to database
      const res = await fetch('/api/admin/demo-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_name,
          video_url: result.url
        })
      });

      if (!res.ok) throw new Error('Failed to save to database');
      
      await fetchVideos();
    } catch (err: any) {
      alert(err.message || 'Error uploading video');
    } finally {
      setUploadingSection(null);
      if (fileInputRefs.current[section_name]) {
        fileInputRefs.current[section_name]!.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const res = await fetch(`/api/admin/demo-videos?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete video');
      await fetchVideos();
    } catch (err: any) {
      alert(err.message || 'Error deleting video');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <Video className="text-blue-500 w-10 h-10" />
          Demo Videos Manager
        </h2>
        <p className="text-slate-400 mt-1 font-medium">
          Manage the demonstration videos that appear across the platform and main website.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {SECTIONS.map((section) => {
          const video = videos.find(v => v.section_name === section.id);
          const isUploading = uploadingSection === section.id;

          return (
            <div key={section.id} className="bg-[#0A1628] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">{section.label}</h3>
                {video && (
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
                {video ? (
                  <video
                    src={video.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center">
                    <Play className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm font-medium">No video uploaded yet</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  ref={el => { fileInputRefs.current[section.id] = el }}
                  onChange={(e) => handleFileUpload(e, section.id)}
                />
                <button
                  onClick={() => fileInputRefs.current[section.id]?.click()}
                  disabled={isUploading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {video ? 'Replace Video' : 'Upload Video'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
