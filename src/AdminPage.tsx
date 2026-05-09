import { useState, useEffect } from 'react';
import { 
  Lock, 
  Phone, 
  Settings, 
  Database, 
  TrendingUp, 
  LogOut, 
  Trash2,
  ChevronLeft,
  Zap,
  Key,
  Plus, 
  BarChart3,
  User,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Ban,
  AlertCircle,
  Eye,
  CheckCircle2,
  Headset
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
import { api as db, AdminSettings, AccessCode, Transaction, PaymentSubmission } from './utils/api';

export default function AdminPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [inspectingCode, setInspectingCode] = useState<AccessCode | null>(null);
  const [cancellingTx, setCancellingTx] = useState<{code: string, txId: string, amount: number} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    msg: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    show: false,
    title: '',
    msg: '',
    onConfirm: () => {},
    type: 'warning'
  });
  const navigate = useNavigate();

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [s, sub, c] = await Promise.all([
        db.getSettings(),
        db.getSubmissions(),
        db.getAccessCodes()
      ]);
      if (s) setSettings(s);
      setSubmissions(Array.isArray(sub) ? sub : []);
      setAccessCodes(Array.isArray(c) ? c : []);
    } catch (err) {
      console.error("Critical Admin Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmCancelWithdrawal = async () => {
    if (!cancellingTx) return;
    const { code, txId } = cancellingTx;
    
    try {
      const profile = await db.getProfile(code);
      if (profile && Array.isArray(profile.transactions)) {
        const txIndex = profile.transactions.findIndex((t: any) => t.id === txId);
        if (txIndex !== -1) {
          const tx = profile.transactions[txIndex];
          tx.status = 'canceled';
          
          const refundTx: Transaction = {
            id: 'refund_' + Math.random().toString(36).substr(2, 9),
            type: 'deposit',
            amount: tx.amount,
            status: 'approved',
            timestamp: Date.now(),
            description: `Refund: Canceled Withdrawal (${txId.substring(0,8)})`
          };
          profile.transactions = [refundTx, ...profile.transactions];

          await db.updateProfile(code, profile);
          
          const updatedCodes = await db.getAccessCodes();
          if (Array.isArray(updatedCodes)) {
            setAccessCodes(updatedCodes);
            const currentCode = updatedCodes.find(c => c.code === code);
            if (currentCode) setInspectingCode(currentCode);
          }
          
          showToast('Withdrawal canceled. Funds restored.');
        }
      }
    } catch (err) {
      showToast('Failed to cancel withdrawal', 'error');
    }
    setCancellingTx(null);
  };

  const handleGenerateCode = async () => {
    const newCode = Math.floor(10000 + Math.random() * 90000).toString();
    const newEntry: AccessCode = {
      code: newCode,
      user: null,
      totalEarned: 0,
      status: 'active'
    };
    try {
      await db.saveAccessCodes([newEntry]);
      const updated = await db.getAccessCodes();
      if (Array.isArray(updated)) {
        setAccessCodes(updated);
      }
      
      setConfirmModal({
        show: true,
        title: 'Success!',
        msg: `Access node ${newCode} has been successfully generated and deployed to the network.`,
        type: 'warning',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
      });
    } catch (err) {
      console.error("Generate Code Error:", err);
      showToast('Failed to generate code', 'error');
    }
  };

  const handleDeleteCode = (code: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Access Node',
      msg: `Are you sure you want to permanently delete code ${code}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await db.deleteCode(code);
          const updated = await db.getAccessCodes();
          if (Array.isArray(updated)) {
            setAccessCodes(updated);
          }
          showToast('Code deleted successfully');
        } catch (err) {
          showToast('Failed to delete code', 'error');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const pass = settings?.adminPassword || 'admin123';
    if (password === pass) {
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid Authorization Phrase. Access Denied.');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    if (settings.price < 100) {
      showToast('Price must be at least ₦100', 'error');
      return;
    }
    try {
      await db.saveSettings(settings);
      showToast('Configuration updated and deployed');
    } catch (err) {
      showToast('Failed to update configuration', 'error');
    }
  };

  const resetSettings = () => {
    setConfirmModal({
      show: true,
      title: 'Reset Configuration',
      msg: 'Revert all payment settings to default values?',
      type: 'warning',
      onConfirm: () => {
        window.location.reload();
      }
    });
  };

  const clearSubmissions = () => {
    setConfirmModal({
      show: true,
      title: 'Wipe Records',
      msg: 'WARNING: This will permanently delete all captured submission records. Proceed?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await db.clearSubmissions();
          setSubmissions([]);
          showToast('Records wiped successfully');
        } catch (err) {
          showToast('Failed to clear records', 'error');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans selection:bg-blue-500/30 text-left">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        </div>
        <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Admin Gateway</h1>
            <div className="flex items-center gap-2 mt-2 text-left w-full justify-center">
               <div className={`w-1.5 h-1.5 rounded-full ${settings ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                 {settings ? 'Server Online' : 'Server Offline'}
               </p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 text-center">Authentication Phrase</label>
              <input 
                type="password" 
                autoFocus
                placeholder="••••••••"
                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-center tracking-widest"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(null);
                }}
              />
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-tight"
              >
                <AlertCircle size={14} className="shrink-0" />
                {loginError}
              </motion.div>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              Access Control Panel
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-slate-500 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.3em]"
            >
              Return to Interface
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Safety total calculations
  const totalVolume = (Array.isArray(submissions) ? submissions : [])
    .reduce((acc, curr) => acc + (Number(curr?.price) || 0), 0);
  
  const totalNetworkEarnings = (Array.isArray(accessCodes) ? accessCodes : [])
    .reduce((acc, curr) => acc + (Number(curr?.totalEarned) || 0), 0);

  // Safety rendering check
  if (!settings) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
      <div className="w-8 h-8 border-t-blue-500 border-2 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 selection:bg-blue-500/30 text-left">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">{settings?.appName || 'Protocol'} Control</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Configuration & Node Monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Live View
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <LogOut size={16} /> Disconnect
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          {/* Settings Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl h-full sticky top-12">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                  <Settings size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight">System Configuration</h2>
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-6 overflow-x-auto  max-h-[500px] ">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Access Code Price (₦)</label>
                    <input 
                      type="number" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-blue-400"
                      value={settings?.price || 0}
                      onChange={(e) => setSettings(prev => prev ? {...prev, price: parseInt(e.target.value)} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Payment Bank</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all"
                      value={settings?.bankName || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, bankName: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Number</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all font-mono tracking-wider"
                      value={settings?.accountNumber || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, accountNumber: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-xs"
                      value={settings?.accountName || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, accountName: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Transfer Remark</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all italic text-amber-500"
                      value={settings?.remark || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, remark: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">App Name</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-white"
                      value={settings?.appName || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, appName: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Admin Access Password</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-rose-400"
                      value={settings?.adminPassword || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, adminPassword: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 text-emerald-500">Global USDT Wallet (TRC20)</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-emerald-400 font-mono text-xs"
                      value={settings?.adminUsdtWallet || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, adminUsdtWallet: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Telegram Link</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-blue-400"
                      value={settings?.telegramLink || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, telegramLink: e.target.value} : null)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Popup</label>
                    <button 
                      type="button"
                      onClick={() => setSettings(prev => prev ? {...prev, communityPopupEnabled: !prev.communityPopupEnabled} : null)}
                      className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${
                        settings?.communityPopupEnabled ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'
                      }`}
                    >
                      {settings?.communityPopupEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 text-[8px]">Min Bank (₦)</label>
                      <input 
                        type="number" 
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold px-4 focus:border-blue-500/50 transition-all text-xs"
                        value={settings?.minWithdrawalBank || 0}
                        onChange={(e) => setSettings(prev => prev ? {...prev, minWithdrawalBank: parseInt(e.target.value)} : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 text-[8px]">Min USDT ($)</label>
                      <input 
                        type="number" 
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold px-4 focus:border-blue-500/50 transition-all text-xs"
                        value={settings?.minWithdrawalUsdt || 0}
                        onChange={(e) => setSettings(prev => prev ? {...prev, minWithdrawalUsdt: parseInt(e.target.value)} : null)}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Headset size={14} className="text-blue-500" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Support Integration</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Integration Code (Script)</label>
                        <textarea 
                          rows={4}
                          placeholder="Paste your support widget script here..."
                          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-mono text-[10px] px-6 focus:border-blue-500/50 transition-all text-slate-300"
                          value={settings?.supportCode || ''}
                          onChange={(e) => setSettings(prev => prev ? {...prev, supportCode: e.target.value} : null)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Support Status</label>
                        <button 
                          type="button"
                          onClick={() => setSettings(prev => prev ? {...prev, supportEnabled: !prev.supportEnabled} : null)}
                          className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${
                            settings?.supportEnabled ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'
                          }`}
                        >
                          {settings?.supportEnabled ? 'Online' : 'Offline'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    Apply Updates
                  </button>
                  <button 
                    type="button"
                    onClick={resetSettings}
                    className="w-full py-3 border border-white/5 rounded-xl font-bold text-[10px] text-slate-600 hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    Reset Defaults
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                    <Database size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Access Log</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{Array.isArray(submissions) ? submissions.length : 0} Total Captures</p>
                  </div>
                </div>
                <button 
                  onClick={clearSubmissions}
                  className="px-5 py-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <Trash2 size={14} /> Wipe Records
                </button>
              </div>

              <div className="overflow-x-auto flex-grow text-left max-h-[400px] ">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      <th className="text-left py-4 px-2 text-left">Time/Date</th>
                      <th className="text-left py-4 px-2 text-left">User Identification</th>
                      <th className="text-left py-4 px-2 text-left">Contact</th>
                      <th className="text-right py-4 px-2 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {!Array.isArray(submissions) || submissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-32 text-center">
                           <Database className="mx-auto text-slate-800 mb-4" size={48} />
                           <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Database Empty</p>
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="group hover:bg-white/[0.02] transition-all text-left">
                          <td className="py-5 px-2">
                            <div className="text-xs font-black text-white">
                              {sub.timestamp ? new Date(Number(sub.timestamp)).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                              {sub.timestamp ? new Date(Number(sub.timestamp)).toLocaleTimeString() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-5 px-2">
                            <div className="font-black text-sm text-blue-400 group-hover:text-blue-300 transition-colors uppercase">{sub.fullName}</div>
                            <div className="text-[10px] text-slate-500 font-bold tracking-tight lowercase">{sub.email}</div>
                          </td>
                          <td className="py-5 px-2 text-left">
                            <div className="text-xs font-black flex items-center gap-1.5 text-slate-300">
                              <Phone size={10} className="text-blue-500" /> {sub.phone}
                            </div>
                            <div className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-tighter">Region: {sub.country}</div>
                          </td>
                          <td className="py-5 px-2 text-right">
                            <div className="flex flex-col items-end gap-2">
                               <div className="font-black text-white tracking-tighter">₦{Number(sub.price || 0).toLocaleString()}</div>
                               
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Access Code Management */}
        <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Access Codes</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{Array.isArray(accessCodes) ? accessCodes.length : 0} Active Nodes</p>
              </div>
            </div>
            <button 
              onClick={handleGenerateCode}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Generate New Code
            </button>
          </div>

          <div className="overflow-x-auto text-left max-h-[500px] overflow-y-auto space-y-3 pr-2"  >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <th className="text-left py-4 px-2 text-left">Access Key</th>
                  <th className="text-left py-4 px-2 text-left">Node Owner</th>
                  <th className="text-center py-4 px-2">Earning</th>
					 <th className="text-center py-4 px-2">Profile</th>
                  <th className="text-right py-4 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-blue-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Node DB...</td>
                  </tr>
                ) : !Array.isArray(accessCodes) || accessCodes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]">No codes generated</td>
                  </tr>
                ) : (
                  accessCodes.map((ac) => (
                    <tr key={ac.code} className="group hover:bg-white/[0.02] transition-all text-left">
                      <td className="py-5 px-2">
						    <span className="font-mono text-xl font-black text-white tracking-widest">{ac.code}</span>
                       </td>
                      <td className="py-5 px-2">
                        <div className="text-xs font-bold text-slate-400">
                          {ac.user ? (
                            <span className="text-blue-400 uppercase tracking-tighter">{ac.user}</span>
                          ) : (
                            <span className="italic opacity-30">Unassigned Node</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-2 text-center">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                           <BarChart3 size={12} className="text-emerald-500" />
                           <span className="text-[11px] font-black text-emerald-400 tracking-tight">₦{Number(ac.totalEarned || 0).toLocaleString()}</span>
                         </div>
                      </td>

						   <td className="py-5 px-2 text-right">
                        <div className="flex justify-end gap-2">
						{ac.user && (
                               <button 
                                onClick={async () => {
                                  const freshProfile = await db.getProfile(ac.code);
                                  setInspectingCode({ ...ac, profile: freshProfile });
                                }}
                                className="px-4 py-2 bg-blue-600 border border-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg"
                               >
                                 <Eye size={14} />
                               </button>
                            )}

						</div>
                      </td>
						
                      <td className="py-5 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          
                          <button 
                            onClick={() => handleDeleteCode(ac.code)}
                            className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Node"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
           <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Gross Volume</p>
                <h3 className="text-3xl font-black tracking-tighter text-white">₦{Array.isArray(submissions) ? submissions.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0).toLocaleString() : '0'}</h3>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <TrendingUp size={28} />
              </div>
           </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Earnings</p>
                <h3 className="text-3xl font-black tracking-tighter text-white">₦{Array.isArray(accessCodes) ? accessCodes.reduce((acc, curr) => acc + (Number(curr.totalEarned) || 0), 0).toLocaleString() : '0'}</h3>
              </div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                <BarChart3 size={28} />
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Latency</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black tracking-tighter text-white">0.18</h3>
                  <span className="text-xs font-black text-emerald-500 mb-1.5 uppercase">ms</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Zap size={28} />
              </div>
           </div>
        </div>
      </div>

      {/* User Inspection Modal */}
      <AnimatePresence>
        {inspectingCode && inspectingCode.profile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-auto  max-h-[700px] ">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-4xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setInspectingCode(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row gap-8 mb-10 text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{inspectingCode.profile.fullName}</h3>
                      <p className="text-blue-400 font-mono text-xs uppercase tracking-widest">Access Node: {inspectingCode.code}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Phone Number</span>
                      <span className="font-bold text-white">{inspectingCode.profile.phone}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Email Address</span>
                      <span className="font-bold text-white">{inspectingCode.profile.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Ads Streamed</span>
                      <span className="font-bold text-white">{inspectingCode.profile.adsWatched} Sessions</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] flex flex-col justify-center text-left">
                  <div className="flex items-center gap-2 text-blue-100/60 font-bold text-[10px] uppercase tracking-widest mb-2">
                    <Wallet size={12} /> Liquid Balance
                  </div>
                  <h4 className="text-4xl font-black tracking-tighter mb-4 text-white">₦{(Number(inspectingCode.profile.balance) || 0).toLocaleString()}</h4>
                  <div className="h-0.5 w-full bg-white/10 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-blue-100/60">Lifetime Earnings</span>
                    <span className="font-black text-white italic">₦{(Number(inspectingCode.profile.earnings) || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Account Activity</h4>
                  <div className="flex gap-2">
                    <div className="px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                      <span className="text-[8px] font-black text-emerald-500 uppercase">Earnings Log</span>
                    </div>
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2">
                  {Array.isArray(inspectingCode.profile.transactions) ? inspectingCode.profile.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          tx.type !== 'withdrawal'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {tx.type !== 'withdrawal' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white">{tx.description}</p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase">{new Date(Number(tx.timestamp)).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right text-left">
                           <p className={`text-xs font-black ${tx.type !== 'withdrawal' ? 'text-emerald-400' : 'text-red-400'}`}>
                             {tx.type !== 'withdrawal' ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString()}
                           </p>
                           <div className="flex items-center gap-1 justify-end mt-0.5">
                             <span className={`text-[8px] font-black uppercase ${
                               tx.status === 'approved' ? 'text-emerald-500' : 
                               tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                             }`}>
                               {tx.status}
                             </span>
                           </div>
                         </div>
                         {tx.type === 'withdrawal' && tx.status !== 'canceled' && (
                           <button 
                             onClick={() => setCancellingTx({code: inspectingCode.code, txId: tx.id, amount: tx.amount})}
                             className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20"
                             title="Cancel Withdrawal"
                           >
                             <Ban size={14} />
                           </button>
                         )}
                      </div>
                    </div>
                  )) : (
                     <p className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-[10px]">No transaction history found</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancellingTx && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#151515] border border-red-500/20 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tighter">Cancel Node Request?</h3>
              <p className="text-slate-400 font-bold mb-8 leading-tight text-sm text-center">
                You are about to revoke the withdrawal of <span className="text-white">₦{cancellingTx.amount.toLocaleString()}</span>. 
                Funds will be instantly returned to the user's balance.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={confirmCancelWithdrawal}
                  className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-900/20"
                >
                  Confirm Cancellation
                </button>
                <button 
                  onClick={() => setCancellingTx(null)}
                  className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Abort Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generic Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`bg-[#151515] border rounded-[2.5rem] p-10 max-w-sm w-full text-center relative overflow-hidden ${
                confirmModal.type === 'danger' ? 'border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]' : 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]'
              }`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${confirmModal.type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border ${
                confirmModal.type === 'danger' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                <AlertCircle size={40} className={confirmModal.type === 'danger' ? 'text-red-500' : 'text-amber-500'} />
              </div>
              
              <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tighter">{confirmModal.title}</h3>
              <p className="text-slate-400 font-bold mb-8 leading-tight text-sm text-center">
                {confirmModal.msg}
              </p>

              <div className="space-y-3">
                <button 
                  onClick={confirmModal.onConfirm}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                    confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
                  }`}
                >
                  Confirm Proceed
                </button>
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
