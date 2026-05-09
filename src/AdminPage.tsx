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
  Headset,
  RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
import { api as db, AdminSettings, AccessCode, Transaction, PaymentSubmission } from './utils/api';

export default function AdminPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [draftSettings, setDraftSettings] = useState<AdminSettings | null>(null);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
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

  const loadData = async (isInitial = false) => {
    try {
      const [s, sub, c, e] = await Promise.all([
        db.getSettings(),
        db.getSubmissions(),
        db.getAccessCodes(),
        db.getAllEarnings()
      ]);
      
      if (s) {
        setSettings(s);
        if (isInitial) setDraftSettings(s);
      }
      setSubmissions(Array.isArray(sub) ? sub : []);
      setAccessCodes(Array.isArray(c) ? c : []);
      setEarningsHistory(Array.isArray(e) ? e : []);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftSettings) return;
    try {
      await db.saveSettings(draftSettings);
      setSettings(draftSettings);
      showToast('Settings saved successfully');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  const confirmCancelWithdrawal = async () => {
    if (!cancellingTx) return;
    const { code, txId } = cancellingTx;
    try {
      const profile = await db.getProfile(code);
      if (profile) {
        const txIndex = profile.transactions.findIndex((t: any) => t.id === txId);
        if (txIndex !== -1) {
          profile.transactions[txIndex].status = 'canceled';
          await db.updateProfile(code, profile);
          loadData(false);
          if (inspectingCode?.code === code) {
            const fresh = await db.getProfile(code);
            setInspectingCode(prev => prev ? { ...prev, profile: fresh } : null);
          }
          showToast('Withdrawal canceled and refunded');
        }
      }
    } catch (err) { showToast('Action failed', 'error'); }
    setCancellingTx(null);
  };

  const handleGenerateCode = async () => {
    const newCode = Math.floor(10000 + Math.random() * 90000).toString();
    try {
      await db.saveAccessCodes([{ code: newCode, user: null, totalEarned: 0, status: 'active' }]);
      loadData(false);
      setConfirmModal({
        show: true,
        title: 'Success!',
        msg: `Access node ${newCode} has been generated.`,
        type: 'warning',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
      });
    } catch (err) { showToast('Generation failed', 'error'); }
  };

  const handleDeleteCode = (code: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Node',
      msg: `Delete node ${code}?`,
      type: 'danger',
      onConfirm: async () => {
        await db.deleteCode(code);
        loadData(false);
        setConfirmModal(prev => ({ ...prev, show: false }));
        showToast('Node deleted');
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Admin Gateway</h1>
            <div className="flex items-center gap-2 mt-2">
               <div className={`w-1.5 h-1.5 rounded-full ${settings ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{settings ? 'Sync Active' : 'Offline'}</p>
            </div>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === (settings?.adminPassword || 'admin123')) setIsLoggedIn(true);
            else setLoginError('Incorrect Phrase');
          }} className="space-y-6 text-left">
            <input 
              type="password" autoFocus placeholder="Authentication Phrase"
              className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-center text-white"
              value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(null); }}
            />
            {loginError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase text-center">{loginError}</div>}
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-lg text-white">Unlock Console</button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.3em]">Exit</button>
          </form>
        </div>
      </div>
    );
  }

  const totalVolume = submissions.reduce((acc, curr) => acc + (Number(curr?.price) || 0), 0);
  const totalNetworkEarnings = accessCodes.reduce((acc, curr) => acc + (Number(curr?.totalEarned) || 0), 0);

  if (!settings || !draftSettings) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><div className="w-8 h-8 border-t-blue-500 border-2 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12 text-left">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <AnimatePresence>{toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {toast.msg}
        </motion.div>
      )}</AnimatePresence>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div><h1 className="text-4xl font-black tracking-tighter text-white uppercase">{settings.appName} Control</h1><p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Network Node Monitoring</p></div>
          <div className="flex items-center gap-4"><button onClick={() => navigate('/')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 text-white flex items-center gap-2"><ChevronLeft size={16} /> Live View</button><button onClick={() => setIsLoggedIn(false)} className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 flex items-center gap-2"><LogOut size={16} /> Terminate</button></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative group">
              <div className="flex items-center gap-3 mb-8"><div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20"><BarChart3 size={20} /></div><div><h2 className="text-xl font-black tracking-tight uppercase text-white">Network Earning History</h2><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time reward distribution</p></div></div>
              <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-white/5 text-[9px] text-slate-500 font-black uppercase tracking-widest"><th className="text-left py-4 px-2">Participant</th><th className="text-left py-4 px-2">Reward</th><th className="text-left py-4 px-2">Node</th><th className="text-right py-4 px-2">Amount</th></tr></thead><tbody className="divide-y divide-white/5">{!Array.isArray(earningsHistory) || earningsHistory.length === 0 ? (<tr><td colSpan={4} className="py-12 text-center text-slate-700 font-bold uppercase tracking-widest text-[10px]">No recent sequences</td></tr>) : (earningsHistory.slice(0, 15).map((reward, i) => (<tr key={i} className="group hover:bg-white/[0.02] transition-all"><td className="py-4 px-2"><div className="font-black text-xs text-white uppercase">{reward.fullName || 'User'}</div><div className="text-[9px] text-slate-600 font-bold font-mono">NODE_{reward.user_code}</div></td><td className="py-4 px-2"><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${reward.type === 'bonus' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{reward.type}</span></td><td className="py-4 px-2"><div className="text-[10px] text-slate-400 font-bold italic opacity-60">0x{reward.id?.substring(3, 7)}</div><div className="text-[8px] text-slate-700 font-black uppercase">{new Date(Number(reward.timestamp)).toLocaleString()}</div></td><td className="py-4 px-2 text-right"><div className="font-black text-emerald-400 text-sm tracking-tight">+₦{Number(reward.amount || 0).toLocaleString()}</div></td></tr>)))}</tbody></table></div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl h-full sticky top-12">
              <div className="flex items-center gap-3 mb-10"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20"><Settings size={20} /></div><h2 className="text-xl font-black tracking-tight text-white uppercase font-black">Config</h2></div>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">App Name</label><input type="text" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-white text-sm" value={draftSettings.appName} onChange={(e) => setDraftSettings({...draftSettings, appName: e.target.value})} /></div>
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Activation Price (₦)</label><input type="number" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-blue-400 text-sm" value={draftSettings.price} onChange={(e) => setDraftSettings({...draftSettings, price: parseInt(e.target.value)})} /></div>
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">USDT Wallet (TRC20)</label><input type="text" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-mono text-[9px] px-6 focus:border-emerald-500/50 transition-all text-emerald-400" value={draftSettings.adminUsdtWallet} onChange={(e) => setDraftSettings({...draftSettings, adminUsdtWallet: e.target.value})} /></div>
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Telegram Link</label><input type="text" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all text-blue-400 text-xs" value={draftSettings.telegramLink} onChange={(e) => setDraftSettings({...draftSettings, telegramLink: e.target.value})} /></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Min Bank</label><input type="number" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold px-4 text-xs" value={draftSettings.minWithdrawalBank} onChange={(e) => setDraftSettings({...draftSettings, minWithdrawalBank: parseInt(e.target.value)})} /></div>
                  <div><label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Min USDT</label><input type="number" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl outline-none font-bold px-4 text-xs" value={draftSettings.minWithdrawalUsdt} onChange={(e) => setDraftSettings({...draftSettings, minWithdrawalUsdt: parseInt(e.target.value)})} /></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Community Popup</span>
                  <button type="button" onClick={() => setDraftSettings({...draftSettings, communityPopupEnabled: !draftSettings.communityPopupEnabled})} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase ${draftSettings.communityPopupEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>{draftSettings.communityPopupEnabled ? 'ON' : 'OFF'}</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Live Support</span>
                  <button type="button" onClick={() => setDraftSettings({...draftSettings, supportEnabled: !draftSettings.supportEnabled})} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase ${draftSettings.supportEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>{draftSettings.supportEnabled ? 'ON' : 'OFF'}</button>
                </div>

                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Support Script</label><textarea rows={3} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-[9px] text-slate-400" value={draftSettings.supportCode} onChange={(e) => setDraftSettings({...draftSettings, supportCode: e.target.value})} /></div>

                <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition-all">Apply Updates</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-xl font-black uppercase text-white mb-8 flex justify-between items-center">Access Log <span className="text-[10px] text-slate-500">{submissions.length} leads</span></h2>
              <div className="overflow-x-auto"><table className="w-full border-collapse"><tbody className="divide-y divide-white/5">{submissions.slice(0, 10).map((sub) => (<tr key={sub.id} className="group hover:bg-white/[0.02] transition-all"><td className="py-4 px-2 text-left"><div className="font-black text-xs text-white uppercase">{sub.fullName}</div><div className="text-[9px] text-slate-600 font-bold">{sub.phone}</div></td><td className="py-4 px-2 text-right"><div className="flex flex-col items-end gap-1"><div className="font-black text-white text-xs">₦{Number(sub.price || 0).toLocaleString()}</div><button onClick={async () => { const mc = accessCodes.find(c => c.user === sub.fullName); if(mc) { const fp = await db.getProfile(mc.code); setInspectingCode({...mc, profile: fp}); } else { showToast("No active node", "error"); } }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">View Log</button></div></td></tr>))}</tbody></table></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <h2 className="text-xl font-black uppercase text-white mb-8 flex justify-between items-center">Active Nodes <button onClick={handleGenerateCode} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest">New Node</button></h2>
              <div className="overflow-x-auto text-left"><table className="w-full border-collapse"><thead><tr className="border-b border-white/5 text-[9px] text-slate-600 font-black uppercase"><th className="py-4 px-2 text-left">Key</th><th className="py-4 px-2 text-left">Owner</th><th className="py-4 px-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5">{accessCodes.map((ac) => (<tr key={ac.code} className="group hover:bg-white/[0.02] transition-all text-left"><td className="py-4 px-2"><div className="font-mono text-base font-black text-blue-400">{ac.code}</div></td><td className="py-4 px-2 text-left"><div className="font-black text-xs text-white uppercase">{ac.user || 'Unassigned'}</div><div className="text-[9px] text-emerald-500 font-bold">₦{Number(ac.totalEarned || 0).toLocaleString()}</div></td><td className="py-4 px-2 text-right flex justify-end gap-2">{ac.user && (<button onClick={async () => { const fp = await db.getProfile(ac.code); setInspectingCode({...ac, profile: fp}); }} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">View Log</button>)}<button onClick={() => handleDeleteCode(ac.code)} className="p-2 text-red-500/40 hover:text-red-500 transition-all"><Trash2 size={14} /></button></td></tr>))}</tbody></table></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-20">
           <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] flex items-center justify-between"><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Gross Volume</p><h3 className="text-3xl font-black tracking-tighter text-white">₦{totalVolume.toLocaleString()}</h3></div><div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5"><TrendingUp size={28} /></div></div>
           <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] flex items-center justify-between"><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Earnings</p><h3 className="text-3xl font-black tracking-tighter text-white">₦{totalNetworkEarnings.toLocaleString()}</h3></div><div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-lg shadow-purple-500/5"><BarChart3 size={28} /></div></div>
           <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] flex items-center justify-between"><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Node Efficiency</p><div className="flex items-end gap-2"><h3 className="text-3xl font-black tracking-tighter text-white">99.4</h3><span className="text-xs font-black text-emerald-500 mb-1.5 uppercase">%</span></div></div><div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"><Zap size={28} /></div></div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>{inspectingCode && inspectingCode.profile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-4xl w-full shadow-2xl relative my-8">
              <button onClick={() => setInspectingCode(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
              <div className="flex flex-col md:flex-row gap-8 mb-10 text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><User size={32} /></div><div><h3 className="text-2xl font-black text-white uppercase">{inspectingCode.profile.fullName}</h3><p className="text-blue-400 font-mono text-xs uppercase tracking-widest">Access Node: {inspectingCode.code}</p></div></div>
                  <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5"><div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Phone</span><span className="font-bold text-white text-xs">{inspectingCode.profile.phone}</span></div><div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Email</span><span className="font-bold text-white text-xs">{inspectingCode.profile.email}</span></div><div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Ads watched</span><span className="font-bold text-white text-xs">{inspectingCode.profile.adsWatched} Sessions</span></div></div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] flex flex-col justify-center text-left text-white"><div className="flex items-center gap-2 text-blue-100/60 font-bold text-[10px] uppercase tracking-widest mb-2"><Wallet size={12} /> Liquid Balance</div><h4 className="text-4xl font-black tracking-tighter mb-4 text-white">₦{(Number(inspectingCode.profile.balance) || 0).toLocaleString()}</h4><div className="h-0.5 w-full bg-white/10 my-4" /><div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-blue-100/60">Lifetime Earnings</span><span className="font-black text-white italic">₦{(Number(inspectingCode.profile.earnings) || 0).toLocaleString()}</span></div></div>
              </div>
              <div className="space-y-4 text-left"><h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Transaction Log</h4><div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">{Array.isArray(inspectingCode.profile.transactions) ? inspectingCode.profile.transactions.map((tx) => (<div key={tx.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all"><div className="flex items-center gap-4"><div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tx.type !== 'withdrawal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>{tx.type !== 'withdrawal' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}</div><div><p className="text-[11px] font-black text-white capitalize">{tx.description}</p><p className="text-[9px] text-slate-600 font-bold uppercase">{new Date(Number(tx.timestamp)).toLocaleString()}</p></div></div><div className="flex items-center gap-4"><div className="text-right"><p className={`text-xs font-black ${tx.type !== 'withdrawal' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.type !== 'withdrawal' ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString()}</p><div className="flex items-center gap-1 justify-end mt-0.5"><span className={`text-[8px] font-black uppercase ${tx.status === 'approved' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>{tx.status}</span></div></div>{tx.type === 'withdrawal' && tx.status !== 'canceled' && (<button onClick={() => setCancellingTx({code: inspectingCode.code, txId: tx.id, amount: tx.amount})} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20" title="Cancel Withdrawal"><Ban size={14} /></button>)}</div></div>)) : (<p className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-[10px]">No transaction history found</p>)}</div></div>
            </motion.div>
          </div>
        )}</AnimatePresence>

      <AnimatePresence>{cancellingTx && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#151515] border border-red-500/20 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" /><div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20"><AlertCircle size={40} className="text-red-500" /></div><h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tighter">Cancel Node Request?</h3><p className="text-slate-400 font-bold mb-8 leading-tight text-sm text-center">You are about to revoke the withdrawal of <span className="text-white">₦{cancellingTx.amount.toLocaleString()}</span>. Funds will be instantly returned.</p>
              <div className="space-y-3"><button onClick={confirmCancelWithdrawal} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Confirm Cancellation</button><button onClick={() => setCancellingTx(null)} className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Abort Action</button></div>
            </motion.div>
          </div>
        )}</AnimatePresence>

      <AnimatePresence>{confirmModal.show && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className={`bg-[#151515] border rounded-[2.5rem] p-10 max-w-sm w-full text-center relative overflow-hidden ${confirmModal.type === 'danger' ? 'border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]' : 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]'}`}><div className={`absolute top-0 left-0 w-full h-1 ${confirmModal.type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} /><div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border ${confirmModal.type === 'danger' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}><AlertCircle size={40} className={confirmModal.type === 'danger' ? 'text-red-500' : 'text-amber-500'} /></div><h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tighter">{confirmModal.title}</h3><p className="text-slate-400 font-bold mb-8 leading-tight text-sm text-center">{confirmModal.msg}</p>
              <div className="space-y-3"><button onClick={confirmModal.onConfirm} className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'}`}>Confirm Proceed</button><button onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel Action</button></div>
            </motion.div>
          </div>
        )}</AnimatePresence>
    </div>
  );
}
