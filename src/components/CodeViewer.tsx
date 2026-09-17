import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, Download, Terminal, 
  Settings, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { PYTHON_SCRIPT_CODE, BUILD_BAT_CODE, REQUIREMENTS_TXT, POWERSHELL_SCRIPT, RUN_SILENT_VBS } from '../data/pythonScript';

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'bat' | 'vbs' | 'ps1' | 'req'>('python');
  const [copied, setCopied] = useState(false);

  const getCodeContent = () => {
    switch (activeTab) {
      case 'python':
        return { code: PYTHON_SCRIPT_CODE, name: 'chrome_backup_tool.py', lang: 'python' };
      case 'bat':
        return { code: BUILD_BAT_CODE, name: 'build_exe.bat', lang: 'bat' };
      case 'vbs':
        return { code: RUN_SILENT_VBS, name: 'CHAY_APP.vbs', lang: 'vb' };
      case 'ps1':
        return { code: POWERSHELL_SCRIPT, name: 'backup_chrome.ps1', lang: 'powershell' };
      case 'req':
        return { code: REQUIREMENTS_TXT, name: 'requirements.txt', lang: 'text' };
    }
  };

  const { code, name } = getCodeContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            id="tab-python"
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'python'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            chrome_backup_tool.py (Mã nguồn chính)
          </button>

          <button
            id="tab-vbs"
            onClick={() => setActiveTab('vbs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'vbs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-300" />
            CHAY_APP.vbs (Chạy không console)
          </button>

          <button
            id="tab-bat"
            onClick={() => setActiveTab('bat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'bat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            build_exe.bat (Đóng gói .EXE)
          </button>

          <button
            id="tab-ps1"
            onClick={() => setActiveTab('ps1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'ps1'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            backup_chrome.ps1
          </button>

          <button
            id="tab-req"
            onClick={() => setActiveTab('req')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'req'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            requirements.txt
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ'}</span>
          </button>

          <button
            id="btn-download-active-code"
            onClick={handleDownloadCurrent}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải {name}</span>
          </button>
        </div>
      </div>

      {/* Code Display Frame */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-200 font-semibold">{name}</span>
            <span className="text-slate-500">({lines.length} dòng)</span>
          </div>
          <span>UTF-8 • Python / Batch Script</span>
        </div>

        <div className="max-h-[600px] overflow-y-auto overflow-x-auto p-4 font-mono text-xs text-slate-300 leading-relaxed select-text">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="pr-4 text-right select-none text-slate-600 text-[11px] w-12 align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre text-slate-200 font-mono">
                    {line || '\n'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
