'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { uploadFile } from '@/lib/storage-utils';
import { Video, Trash2, Upload, Loader2, Play, CheckCircle2, Film, AlertCircle, X, Clock } from 'lucide-react';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

interface DemoVideo {
  id: string;
  section_name: string;
  video_url: string;
  created_at: string;
}

const SECTIONS = [
  { id: 'ai_chatbot', label: 'AI Chatbot Setup', description: 'Shows clients how the sales chatbot works.' },
  { id: 'homepage_showcase', label: 'Main Website Showcase', description: 'Hero section background or feature video.' },
];

export default function DemoVideosPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const supabase = createClient();

  useEffect(() => { fetchVideos(); }, []);

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
    if (!file.type.startsWith('video/')) { alert('Invalid file type. Video only.'); return; }

    setUploadingSection(section_name);
    try {
      const result = await uploadFile(supabase, file, { bucket: 'platform-assets', path: `demo_videos/${section_name}_${Date.now()}` });
      if (result.error || !result.url) throw new Error(result.error || 'Upload failed');

      const res = await fetch('/api/admin/demo-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_name, video_url: result.url })
      });
      if (!res.ok) throw new Error('Database sync failed');
      await fetchVideos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingSection(null);
      if (fileInputRefs.current[section_name]) fileInputRefs.current[section_name]!.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this demo video?')) return;
    try {
      const res = await fetch(`/api/admin/demo-videos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchVideos();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-2xl">
              <Film className="text-blue-500 w-8 h-8" />
            </div>
            Demo Assets Manager
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Configure high-fidelity video demonstrations for platform modules.</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] border border-slate-800 rounded-2xl shadow-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Pipeline Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SECTIONS.map((section) => {
          const video = videos.find(v => v.section_name === section.id);
          const isUploading = uploadingSection === section.id;

          return (
            <div key={section.id} className="group relative bg-[#0A1628] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-slate-600">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{section.label}</h3>
                  <p className="text-xs text-slate-500 font-medium">{section.description}</p>
                </div>
                {video && (
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="aspect-video bg-[#07101F] rounded-[2rem] overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-inner group-hover:shadow-blue-900/10 transition-all">
                {video ? (
                  <>
                    <video
                      src={video.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md">
                      Live Asset
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-700">
                    <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-slate-800/50">
                      <Play className="w-10 h-10 opacity-20 ml-1" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Media Ingest</span>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <div className="text-center">
                      <p className="text-sm font-black text-white uppercase tracking-widest">Uploading Asset</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Streaming to secure storage...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
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
                  className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    video 
                    ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800' 
                    : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500'
                  }`}
                >
                  {isUploading ? (
                    'Processing Pipeline...'
                  ) : (
                    <>
                      <Upload size={18} />
                      {video ? 'Replace Demo Video' : 'Deploy Demo Video'}
                    </>
                  )}
                </button>
              </div>
              
              {video && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  <Clock size={12} /> Last Updated: {new Date(video.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-3xl p-8 flex items-center gap-6">
        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Media Management Policy</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            All uploaded videos are served via high-speed global CDNs. 
            We now support high-fidelity assets up to 2GB for premium demonstrations. 
            Use MP4/H.264 compression for the best balance of quality and speed.
          </p>
        </div>
      </div>
    </div>
  );
}
