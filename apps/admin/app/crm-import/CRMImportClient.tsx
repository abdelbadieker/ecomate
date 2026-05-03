'use client';
import { useRef, useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon, FileSpreadsheet, X, Folder, Trash2, ExternalLink, FileDown, Image as ImageIcon, FileArchive } from 'lucide-react';
import { uploadFile } from '@/lib/storage-utils';
import { createBrowserClient } from '@supabase/ssr';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type Merchant = { id: string; full_name: string; email: string };
type CrmAsset = { id: string; client_id: string; type: 'file' | 'link'; title: string; file_url: string | null; external_url: string | null; file_name: string | null; mime_type: string | null; file_size?: number; created_at: string };

const IMPORT_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const FILE_EXTENSIONS = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.jpg', '.jpeg', '.png', '.zip'];

function getFileExtension(filename: string): string {
  return ('.' + filename.split('.').pop()?.toLowerCase()) || '';
}

/**
 * Robustly detect column index based on common header variations
 */
function detectCol(headers: string[], variations: string[]): number {
  return headers.findIndex(h => {
    const header = h.toLowerCase().trim();
    return variations.some(v => header.includes(v.toLowerCase()) || header === v.toLowerCase());
  });
}

function processRows(rows: any[][], headers: string[]): { valid: any[], invalidCount: number, detectedHeaders: any } {
  const nameIdx = detectCol(headers, ['name', 'nom', 'client', 'customer', 'full name', 'username', 'n', 'c']);
  const emailIdx = detectCol(headers, ['email', 'mail', 'e-mail']);
  const phoneIdx = detectCol(headers, ['phone', 'tel', 'mobile', 'telephone', 'portable', 'fixe', 'num']);
  const cityIdx = detectCol(headers, ['city', 'wilaya', 'ville', 'location', 'place', 'address', 'adresse', 'adr']);
  const noteIdx = detectCol(headers, ['note', 'obs', 'remarque', 'desc', 'comment', 'detail']);
  const ordersIdx = detectCol(headers, ['order', 'commande', 'total orders', 'qty', 'quantite']);
  const spentIdx = detectCol(headers, ['spent', 'total spent', 'da', 'price', 'total', 'montant', 'prix']);

  const valid: any[] = [];
  let invalidCount = 0;

  rows.forEach(row => {
    // Skip empty rows or rows with only empty cells
    if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === '')) return;

    const name = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
    
    if (!name || name.toLowerCase() === 'name' || name.toLowerCase() === 'nom') {
      invalidCount++;
      return;
    }

    valid.push({
      name,
      email: emailIdx !== -1 ? String(row[emailIdx] || '').trim() : null,
      phone: phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : null,
      city: cityIdx !== -1 ? String(row[cityIdx] || '').trim() : null,
      notes: noteIdx !== -1 ? String(row[noteIdx] || '').trim() : null,
      total_orders: ordersIdx !== -1 ? parseInt(String(row[ordersIdx]).replace(/[^0-9]/g, '')) || 0 : 0,
      total_spent: spentIdx !== -1 ? parseFloat(String(row[spentIdx]).replace(/[^0-9.]/g, '')) || 0 : 0,
    });
  });

  return { 
    valid, 
    invalidCount, 
    detectedHeaders: { 
      name: nameIdx !== -1, 
      email: emailIdx !== -1, 
      phone: phoneIdx !== -1,
      city: cityIdx !== -1 
    } 
  };
}

export default function CRMImportClient({ initialMerchants = [] }: { initialMerchants?: Merchant[] }) {
  const [merchants] = useState<Merchant[]>(initialMerchants);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'import' | 'files'>('import');

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'file' | 'sheets'>('file');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // Assets State
  const supabase = createClient();
  const [assets, setAssets] = useState<CrmAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileLoadError, setFileLoadError] = useState<string | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selectedMerchant && activeTab === 'files') {
      loadFiles();
    }
  }, [selectedMerchant, activeTab]);

  const loadFiles = async () => {
    try {
      setFileLoadError(null);
      const res = await fetch(`/api/admin/crm/assets?client_id=${selectedMerchant}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load assets');
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFileLoadError(err.message);
      setAssets([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !selectedMerchant) return;

    const ext = getFileExtension(f.name);
    if (!FILE_EXTENSIONS.includes(ext)) {
      alert(`Unsupported file type. Allowed: ${FILE_EXTENSIONS.join(', ')}`);
      return;
    }

    setIsUploading(true);
    try {
      const controller = new AbortController();
      uploadAbortRef.current = controller;

      const uploadRes = await uploadFile(supabase, f, {
        bucket: 'platform-assets',
        path: `crm-files/${selectedMerchant}`,
        signal: controller.signal,
      });

      if (uploadRes.error || !uploadRes.url) throw new Error(uploadRes.error || 'Upload failed');

      const saveRes = await fetch('/api/admin/crm/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedMerchant,
          type: 'file',
          title: f.name,
          file_url: uploadRes.url,
          file_name: f.name,
          mime_type: f.type || ext.replace('.', ''),
          file_size: f.size,
        }),
      });

      if (!saveRes.ok) throw new Error('Failed to save file metadata');

      loadFiles();
      setUploadingFile(null);
    } catch (err: any) {
      if (err.name !== 'AbortError') alert(err.message);
    } finally {
      setIsUploading(false);
      uploadAbortRef.current = null;
    }
  };

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this asset? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/crm/assets?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadFiles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = getFileExtension(f.name);
    if (IMPORT_EXTENSIONS.includes(ext)) {
      setImportFile(f);
      setImportError(null);
    } else {
      setImportError(`Invalid format. Use ${IMPORT_EXTENSIONS.join(', ')} for customer import.`);
      setImportFile(null);
    }
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!selectedMerchant) return;
    if (importMode === 'file' && !importFile) return;
    if (importMode === 'sheets' && !googleSheetsUrl) return;

    setImporting(true);
    setImportError(null);
    setImportResults(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let dataRows: any[] = [];
      let invalidCount = 0;

      if (importMode === 'file') {
        const ext = getFileExtension(importFile!.name);
        if (ext === '.csv') {
          const text = await importFile!.text();
          const csvRows = text.split('\n').filter(l => l.trim()).map(line => line.split(',').map(v => v.trim()));
          if (csvRows.length < 2) throw new Error('File is empty or missing headers');
          const res = processRows(csvRows.slice(1), csvRows[0]);
          dataRows = res.valid;
          invalidCount = res.invalidCount;
          if (!res.detectedHeaders.name) throw new Error('Could not find a "Customer Name" column in your CSV. Please check your headers.');
        } else {
          const XLSX = await import('xlsx');
          const buffer = await importFile!.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          if (jsonData.length < 2) throw new Error('File is empty or missing headers');
          const res = processRows(jsonData.slice(1), jsonData[0] as string[]);
          dataRows = res.valid;
          invalidCount = res.invalidCount;
          if (!res.detectedHeaders.name) throw new Error('Could not find a "Customer Name" column in your Excel file. Please check your headers.');
        }
      } else {
        // Google Sheets
        let csvUrl = googleSheetsUrl;
        const match = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
        
        const response = await fetch(csvUrl, { signal: controller.signal });
        if (!response.ok) throw new Error('Could not fetch Google Sheet data.');
        const text = await response.text();
        const csvRows = text.split('\n').filter(l => l.trim()).map(line => line.split(',').map(v => v.trim()));
        const res = processRows(csvRows.slice(1), csvRows[0]);
        dataRows = res.valid;
        invalidCount = res.invalidCount;
        if (!res.detectedHeaders.name) throw new Error('Could not find a "Customer Name" column in your Google Sheet.');
      }

      if (dataRows.length === 0) {
        throw new Error(`All records were invalid. Missing 'name' column or empty data.`);
      }

      const res = await fetch('/api/admin/crm/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: selectedMerchant, customers: dataRows }),
        signal: controller.signal,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Import failed');

      setImportResults({
        total: dataRows.length + invalidCount,
        success: json.count || dataRows.length,
        failed: invalidCount
      });
      setImportFile(null);
      setGoogleSheetsUrl('');
    } catch (err: any) {
      if (err.name !== 'AbortError') setImportError(err.message);
    } finally {
      setImporting(false);
      abortRef.current = null;
    }
  };

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return <FileText className="text-red-400" />;
    if (t.includes('word') || t.includes('docx')) return <FileText className="text-blue-400" />;
    if (t.includes('excel') || t.includes('sheet') || t.includes('xls')) return <FileSpreadsheet className="text-emerald-400" />;
    if (t.includes('image') || t.includes('png') || t.includes('jpg')) return <ImageIcon className="text-amber-400" />;
    if (t.includes('zip') || t.includes('archive')) return <FileArchive className="text-purple-400" />;
    return <Folder className="text-slate-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Upload className="text-blue-500 w-10 h-10" />
            CRM Hub
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Advanced customer import and document management system.</p>
        </div>
      </div>

      {/* Target Merchant */}
      <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-xs">1</div>
          <h3 className="font-black text-white uppercase tracking-widest text-xs">Select Merchant Context</h3>
        </div>
        <select
          value={selectedMerchant}
          onChange={e => setSelectedMerchant(e.target.value)}
          className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
        >
          <option value="">Choose Merchant...</option>
          {merchants.map(m => (
            <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          className={`pb-3 px-8 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'import' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          onClick={() => setActiveTab('import')}
        >
          Customer Import
        </button>
        <button
          className={`pb-3 px-8 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'files' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          onClick={() => setActiveTab('files')}
        >
          Asset Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {!selectedMerchant ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-[#0A1628] border border-slate-800 rounded-3xl">
             <AlertCircle size={48} className="text-slate-700" />
             <h4 className="text-xl font-black text-slate-500 uppercase tracking-tight">Merchant Context Required</h4>
             <p className="text-slate-600 text-sm max-w-xs mx-auto">Please select a merchant organization to activate the CRM modules.</p>
          </div>
        ) : (
          <>
            {activeTab === 'import' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* Source Toggle */}
                <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 max-w-sm">
                  <button onClick={() => setImportMode('file')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${importMode === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Excel/CSV File</button>
                  <button onClick={() => setImportMode('sheets')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${importMode === 'sheets' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Google Sheets</button>
                </div>

                <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
                  {importMode === 'file' ? (
                    <label className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${importFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
                      <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleImportFileChange} />
                      {importFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-2">
                             <FileSpreadsheet size={28} />
                          </div>
                          <span className="text-sm font-black text-white">{importFile.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{(importFile.size / 1024).toFixed(1)} KB READY</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                          <Upload size={32} />
                          <span className="text-xs font-black uppercase tracking-widest">Drop Customer Database (XLSX/CSV)</span>
                        </div>
                      )}
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Public Google Sheet Link</label>
                      <input
                        value={googleSheetsUrl}
                        onChange={e => setGoogleSheetsUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-6 py-5 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold"
                      />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={handleImport}
                      disabled={importing || (importMode === 'file' ? !importFile : !googleSheetsUrl)}
                      className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                    >
                      {importing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                      {importing ? 'Analyzing and Ingesting Data...' : 'Begin Import Sequence'}
                    </button>
                    {importing && (
                       <button onClick={() => abortRef.current?.abort()} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Cancel Pipeline</button>
                    )}
                  </div>
                </div>

                {importError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start gap-4 text-red-400 animate-in slide-in-from-top-4">
                    <AlertCircle className="mt-0.5 shrink-0" size={18} />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-wider">Analysis Failed</p>
                      <p className="text-xs font-medium opacity-80">{importError}</p>
                    </div>
                  </div>
                )}

                {importResults && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl space-y-8 animate-in zoom-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black text-white flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-400" />
                        Import Report
                      </h4>
                      <button onClick={() => setImportResults(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Rows</div>
                        <div className="text-3xl font-black text-white">{importResults.total}</div>
                      </div>
                      <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 text-center">
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Successful</div>
                        <div className="text-3xl font-black text-emerald-400">{importResults.success}</div>
                      </div>
                      <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10 text-center">
                        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Invalid/Skip</div>
                        <div className="text-3xl font-black text-red-400">{importResults.failed}</div>
                      </div>
                    </div>

                    <p className="text-[10px] text-center text-slate-500 font-bold leading-relaxed">
                      All valid rows have been synchronized with the master customer database.<br/>Rows missing names were automatically filtered to prevent data corruption.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* Upload Zone */}
                <div className="bg-[#0A1628] border border-slate-800 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Client Asset Vault</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Manage documents and external links for this client.</p>
                    </div>
                    <div className="flex gap-3">
                      <label className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${isUploading ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'}`}>
                        <Upload size={14} />
                        {isUploading ? 'Processing...' : 'Upload File'}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="py-4 border-t border-slate-800 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-emerald-400" size={18} />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Encrypting and Storing Data...</span>
                      </div>
                      <button onClick={() => uploadAbortRef.current?.abort()} className="text-red-400 text-[10px] font-black uppercase">Cancel</button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {assets.length === 0 && !isUploading ? (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-700 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <Folder size={48} className="mb-4 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No assets found</span>
                      </div>
                    ) : (
                      assets.map(a => (
                        <div key={a.id} className="group relative bg-[#07101F] border border-slate-800 p-5 rounded-2xl hover:border-slate-600 transition-all">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                              {a.type === 'link' ? <LinkIcon className="text-blue-400" /> : getFileIcon(a.mime_type || '')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${a.type === 'link' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                  {a.type}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-white truncate pr-6">{a.title}</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 truncate">
                                {a.type === 'link' ? a.external_url : `${((a.file_size || 0) / 1024).toFixed(1)} KB • ${new Date(a.created_at).toLocaleDateString()}`}
                              </p>
                              <div className="mt-3 flex gap-3">
                                {a.type === 'link' ? (
                                  <a href={a.external_url || ''} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-400 flex items-center gap-1.5 hover:text-white transition-colors">
                                    <ExternalLink size={12} /> OPEN LINK
                                  </a>
                                ) : (
                                  <a href={a.file_url || ''} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 hover:text-white transition-colors">
                                    <FileDown size={12} /> DOWNLOAD
                                  </a>
                                )}
                                <button onClick={() => deleteFile(a.id)} className="text-[10px] font-black text-slate-600 hover:text-red-400 flex items-center gap-1.5 transition-colors">
                                  <Trash2 size={12} /> DELETE
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {fileLoadError && (
                  <p className="text-center text-red-400 text-xs font-bold italic">{fileLoadError}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
