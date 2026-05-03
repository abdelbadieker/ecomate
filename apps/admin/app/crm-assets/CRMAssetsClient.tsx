'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  Plus, 
  Link as LinkIcon, 
  File as FileIcon, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Download, 
  Trash2, 
  Edit, 
  X, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileArchive,
  ChevronRight,
  User
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { uploadFile } from '@/lib/storage-utils';

function createClient() { 
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); 
}

type Merchant = { id: string; full_name: string; email: string };
type Asset = {
  id: string;
  client_id: string;
  type: 'file' | 'link';
  title: string;
  file_url: string | null;
  external_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
};

export default function CRMAssetsClient({ initialMerchants = [] }: { initialMerchants?: Merchant[] }) {
  const supabase = createClient();
  const [merchants] = useState<Merchant[]>(initialMerchants);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Form State
  const [formType, setFormType] = useState<'file' | 'link'>('link');
  const [formTitle, setFormTitle] = useState('');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (selectedMerchant) {
      fetchAssets();
    } else {
      setAssets([]);
    }
  }, [selectedMerchant]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/assets?client_id=${selectedMerchant}`);
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data = await res.json();
      setAssets(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant || !formTitle) return;

    setIsProcessing(true);
    try {
      let fileData = { url: null as string | null, name: null as string | null, type: null as string | null };

      if (formType === 'file' && uploadingFile) {
        const res = await uploadFile(supabase, uploadingFile, {
          bucket: 'platform-assets',
          path: `crm/${selectedMerchant}`,
          onProgress: (p) => setUploadProgress(p),
        });
        if (res.error) throw new Error(res.error);
        fileData = { url: res.url, name: uploadingFile.name, type: uploadingFile.type };
      }

      const res = await fetch('/api/admin/crm/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedMerchant,
          type: formType,
          title: formTitle,
          external_url: formType === 'link' ? formExternalUrl : null,
          file_url: fileData.url,
          file_name: fileData.name,
          mime_type: fileData.type,
        }),
      });

      if (!res.ok) throw new Error('Failed to save asset');
      
      await fetchAssets();
      closeModals();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset || !formTitle) return;

    setIsProcessing(true);
    try {
      let fileData = { 
        url: currentAsset.file_url, 
        name: currentAsset.file_name, 
        type: currentAsset.mime_type 
      };

      if (formType === 'file' && uploadingFile) {
        const res = await uploadFile(supabase, uploadingFile, {
          bucket: 'platform-assets',
          path: `crm/${selectedMerchant}`,
          onProgress: (p) => setUploadProgress(p),
        });
        if (res.error) throw new Error(res.error);
        fileData = { url: res.url, name: uploadingFile.name, type: uploadingFile.type };
      }

      const res = await fetch('/api/admin/crm/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentAsset.id,
          type: formType,
          title: formTitle,
          external_url: formType === 'link' ? formExternalUrl : null,
          file_url: fileData.url,
          file_name: fileData.name,
          mime_type: fileData.type,
        }),
      });

      if (!res.ok) throw new Error('Failed to update asset');
      
      await fetchAssets();
      closeModals();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      const res = await fetch(`/api/admin/crm/assets?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setAssets(assets.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (asset: Asset) => {
    setCurrentAsset(asset);
    setFormType(asset.type);
    setFormTitle(asset.title);
    setFormExternalUrl(asset.external_url || '');
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentAsset(null);
    setFormTitle('');
    setFormExternalUrl('');
    setUploadingFile(null);
    setUploadProgress(0);
    setFormType('link');
  };

  const filteredAssets = assets.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.file_name && a.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFileIcon = (mime: string | null) => {
    if (!mime) return <FileIcon className="text-slate-400" />;
    if (mime.includes('pdf')) return <FileText className="text-red-400" />;
    if (mime.includes('word') || mime.includes('officedocument')) return <FileText className="text-blue-400" />;
    if (mime.includes('excel') || mime.includes('sheet')) return <FileSpreadsheet className="text-emerald-400" />;
    if (mime.includes('image')) return <ImageIcon className="text-amber-400" />;
    if (mime.includes('zip') || mime.includes('archive')) return <FileArchive className="text-purple-400" />;
    return <FileIcon className="text-slate-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-2xl">
              <Folder className="text-blue-500 w-8 h-8" />
            </div>
            Asset Manager
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Manage CRM links and secure documents for your clients.</p>
        </div>
        
        {selectedMerchant && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Asset
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Merchant Selector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-28">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Merchant Context</h3>
            <div className="space-y-2">
              <select
                value={selectedMerchant}
                onChange={e => setSelectedMerchant(e.target.value)}
                className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner mb-4"
              >
                <option value="">Select a Merchant...</option>
                {merchants.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </select>

              {selectedMerchant && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                    {merchants.find(m => m.id === selectedMerchant)?.full_name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">{merchants.find(m => m.id === selectedMerchant)?.full_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{merchants.find(m => m.id === selectedMerchant)?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assets List Area */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedMerchant ? (
            <div className="bg-[#0A1628] border border-slate-800 rounded-[2rem] py-24 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800">
                <User size={40} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Merchant Selected</h3>
              <p className="text-slate-500 mt-2 max-w-sm font-medium">Select a merchant from the sidebar to manage their links and files.</p>
            </div>
          ) : (
            <>
              {/* Search & Filter Bar */}
              <div className="bg-[#0A1628] border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                <Search className="text-slate-500 ml-2" size={20} />
                <input 
                  type="text" 
                  placeholder="Search assets by title or filename..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white w-full text-sm font-medium"
                />
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-full py-20 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Accessing Vault...</span>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="col-span-full py-20 bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center text-slate-600">
                    <Folder size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest opacity-40">No assets found</p>
                  </div>
                ) : (
                  filteredAssets.map(asset => (
                    <div key={asset.id} className="group relative bg-[#0A1628] border border-slate-800 p-6 rounded-3xl hover:border-slate-600 transition-all shadow-xl hover:shadow-2xl overflow-hidden">
                      {/* Glow Effect */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-[#07101F] rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
                          {asset.type === 'link' ? <LinkIcon className="text-blue-400" /> : getFileIcon(asset.mime_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${asset.type === 'link' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                              {asset.type}
                            </span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase">
                              {new Date(asset.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-white truncate group-hover:text-blue-400 transition-colors leading-tight">
                            {asset.title}
                          </h4>
                          <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">
                            {asset.type === 'link' ? asset.external_url : asset.file_name}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-6">
                            {asset.type === 'link' ? (
                              <a 
                                href={asset.external_url || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-widest"
                              >
                                <ExternalLink size={14} /> Open
                              </a>
                            ) : (
                              <a 
                                href={asset.file_url || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 hover:text-white transition-colors uppercase tracking-widest"
                              >
                                <Download size={14} /> Download
                              </a>
                            )}
                            
                            <div className="flex items-center gap-3 ml-auto">
                              <button 
                                onClick={() => openEditModal(asset)}
                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-[#0A1628] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  {showAddModal ? 'New CRM Asset' : 'Edit Asset'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {showAddModal ? 'Add a new link or document for this client.' : 'Update asset information.'}
                </p>
              </div>
              <button onClick={closeModals} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddAsset : handleEditAsset} className="p-8 space-y-6">
              {/* Type Switcher */}
              <div className="flex gap-2 p-1.5 bg-[#07101F] rounded-2xl border border-slate-800">
                <button 
                  type="button"
                  onClick={() => setFormType('link')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formType === 'link' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <LinkIcon size={14} /> CRM Link
                </button>
                <button 
                  type="button"
                  onClick={() => setFormType('file')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formType === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <FileIcon size={14} /> Document
                </button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Asset Title</label>
                <input 
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Project Specs, Monthly Report..."
                  className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold"
                />
              </div>

              {/* Conditional Content */}
              {formType === 'link' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">External URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      required
                      type="url"
                      value={formExternalUrl}
                      onChange={e => setFormExternalUrl(e.target.value)}
                      placeholder="https://google.com/drive/..."
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Upload Document</label>
                  <label className={`w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${uploadingFile ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/50'}`}>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={e => setUploadingFile(e.target.files?.[0] || null)}
                      disabled={isProcessing}
                    />
                    {uploadingFile ? (
                      <div className="text-center">
                        <p className="text-sm font-black text-white">{uploadingFile.name}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">{(uploadingFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Upload size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Select PDF, DOCX, XLSX, etc.</span>
                      </div>
                    )}
                  </label>
                  {isProcessing && uploadProgress > 0 && (
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={isProcessing || !formTitle || (formType === 'link' ? !formExternalUrl : (showAddModal && !uploadingFile))}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    {showAddModal ? <CheckCircle2 size={20} /> : <Edit size={20} />}
                    {showAddModal ? 'Deploy Asset' : 'Save Changes'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
