import { useState, useEffect } from 'react';
import { 
  Eye, 
  Play, 
  CheckCircle2, 
  Clock, 
  LogOut,
  ChevronRight,
  Zap, 
  ShieldCheck,
  History,
  Headset,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Globe,
  X,
  AlertCircle,
  Settings,
  Mail,
  PhoneCall,
  RefreshCcw,
  BarChart3,
  User,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { api as db, Transaction, AdminSettings } from './utils/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<{show: boolean, msg: string, amount?: number}>({show: false, msg: ''});
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'usdt' | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState({bank: '', account: '', accountName: '', wallet: ''});
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [lastWithdrawal, setLastWithdrawal] = useState<Transaction | null>(null);
  const [showAdsHistory, setShowAdsHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({fullName: '', phone: '', email: ''});
  const [savedProfileInfo, setSavedProfileInfo] = useState({fullName: '', phone: '', email: ''});
  const [settingsStatus, setSettingsStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [protocolError, setProtocolError] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Bonus states
  const [bonusCountdown, setBonusCountdown] = useState<number | null>(null);
  const [adCooldown, setAdCooldown] = useState<number | null>(null);
  const [showCommunityPopup, setShowCommunityPopup] = useState(true);
  const [liveActivity, setLiveActivity] = useState<{name: string, amount: number} | null>(null);

  const userCode = sessionStorage.getItem('fundstube_user_code');

  useEffect(() => {
    const names = [
      'Oluwaseun', 'Chidi', 'Aminu', 'Fatima', 'Blessing', 'Ibrahim', 'Ejiro', 'Aisha', 'Kazeem', 'Nneka', 'Tunde', 'Zainab', 'Abimbola', 'Emeka', 'Yusuf', 'Titilayo', 'Uche', 'Amaka', 'Damilola', 'Bashiru', 'Adaeze', 'Akunna', 'Amarachi', 'Azubuike',
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
      'Taiwo', 'Temitope', 'Tejumola', 'Titilayo', 'Tolulope', 'Toyin', 'Tunji', 'Wasiu', 'Yetunde', 'Yinka', 'Abdullahi', 'Abubakar', 
      'Adamu', 'Bashir', 'Bilkisu', 'Danjuma', 'Faruk', 'Habiba', 'Halima', 'Hassan', 'Hussaini', 'Idris', 'Isah', 'Ismail', 'Jamilu', 
      'Kabiru', 'Khadija', 'Lawal', 'Mahmoud', 'Mukhtar', 'Musa', 'Mustafa', 'Nafisat', 'Nasir', 'Rabiu', 'Sadiq', 'Safiya', 'Sahabi', 
      'Salisu', 'Sani', 'Shehu', 'Suleiman', 'Umar', 'Usman', 'Yahaya', 'Yakubu', 'Zakari', 'Aghatise', 'Amenaghawon', 'Efosa', 'Ehis', 
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
      setTimeout(() => setLiveActivity(null), 4000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string, _type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const calculateBalance = (txs: Transaction[]) => {
    if (!Array.isArray(txs)) return 0;
    return txs.reduce((acc, tx) => {
      const status = tx.status as string;
      if (status === 'canceled') return acc;
      if (tx.type === 'withdrawal') return acc - Number(tx.amount);
      return acc + Number(tx.amount);
    }, 0);
  };

  const calculateEarnings = (txs: Transaction[]) => {
    if (!Array.isArray(txs)) return 0;
    return txs.reduce((acc, tx) => {
      const status = tx.status as string;
      if (status === 'canceled') return acc;
      if (tx.type === 'earning' || tx.type === 'bonus') return acc + Number(tx.amount);
      return acc;
    }, 0);
  };

  // Recalculate balance and earnings whenever transactions change
  useEffect(() => {
    const newBalance = calculateBalance(transactions);
    const earnVal = calculateEarnings(transactions);
    
    setBalance(newBalance);
    setEarnings(earnVal);

    if (!loading && userCode) {
      syncGlobalProfile(
        newBalance,
        earnVal,
        adsWatched,
        transactions,
        settingsForm
      );
    }
  }, [transactions, adsWatched]);

  const addTransaction = (type: Transaction['type'], amount: number, description: string) => {
    const newTx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      type,
      amount,
      status: 'approved',
      timestamp: Date.now(),
      description
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Check if user is authenticated & React to Admin Actions
  useEffect(() => {
    const auth = sessionStorage.getItem('fundstube_user_auth');
    if (!auth || !userCode) {
      navigate('/');
      return;
    }

    const checkGlobalUpdates = async () => {
      if (isSyncing) return;
      try {
        const profile = await db.getProfile(userCode);
        if (profile) {
          if (profile.transactions.length !== transactions.length || (profile.transactions[0] && profile.transactions[0].status !== transactions[0]?.status)) {
            setTransactions(profile.transactions);
            setAdsWatched(profile.adsWatched);
          }
        }
      } catch (err) {
        console.error("Sync Error:", err);
      }
    };

    const interval = setInterval(checkGlobalUpdates, 5000);

    db.getSettings().then(setAdminSettings).catch(() => {});

    db.getProfile(userCode)
      .then(profile => {
        if (profile) {
          setTransactions(profile.transactions);
          setAdsWatched(profile.adsWatched);
          const profileData = {
            fullName: profile.fullName || 'Active User',
            phone: profile.phone || 'N/A',
            email: profile.email || 'N/A'
          };
          setSettingsForm(profileData);
          setSavedProfileInfo(profileData);
        } else {
            const initTx: Transaction = {
              id: 'tx_init',
              type: 'deposit',
              amount: 6900,
              status: 'approved',
              timestamp: Date.now(),
              description: 'Account Activation Deposit'
            };
            setTransactions([initTx]);
            const baseInfo = { fullName: 'Active User', phone: 'N/A', email: 'N/A' };
            setSettingsForm(baseInfo);
            setSavedProfileInfo(baseInfo);
            // Push to server immediately
            db.updateProfile(userCode, { ...baseInfo, balance: 6900, earnings: 0, adsWatched: 0, transactions: [initTx] });
        }
      })
      .catch(err => {
          console.error("Dashboard load failed:", err);
          showToast("Protocol Link Weak", "error");
      })
      .finally(() => {
          setLoading(false);
      });

    return () => clearInterval(interval);
  }, [navigate, userCode]);

  useEffect(() => {
    const savedBonusEnd = localStorage.getItem('ft_bonus_end');
    if (savedBonusEnd) {
      const remaining = Math.floor((Number(savedBonusEnd) - Date.now()) / 1000);
      if (remaining > 0) setBonusCountdown(remaining);
      else localStorage.removeItem('ft_bonus_end');
    }

    const savedAdEnd = localStorage.getItem('ft_ad_cooldown_end');
    if (savedAdEnd) {
      const remaining = Math.floor((Number(savedAdEnd) - Date.now()) / 1000);
      if (remaining > 0) setAdCooldown(remaining);
      else localStorage.removeItem('ft_ad_cooldown_end');
    }
  }, []);

  useEffect(() => {
    if (adCooldown !== null && adCooldown > 0) {
      const timer = setInterval(() => {
        setAdCooldown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem('ft_ad_cooldown_end');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adCooldown]);

  const syncGlobalProfile = async (
    updatedBalance: number, 
    updatedEarnings: number, 
    updatedAds: number, 
    updatedTransactions: Transaction[],
    profileInfo: {fullName: string, phone: string, email: string}
  ) => {
    if (!userCode || loading) return;

    try {
      setIsSyncing(true);
      const profile = {
        fullName: profileInfo.fullName || 'Active User',
        phone: profileInfo.phone || 'N/A',
        email: profileInfo.email || 'N/A',
        balance: updatedBalance,
        earnings: updatedEarnings,
        adsWatched: updatedAds,
        transactions: updatedTransactions
      };
      await db.updateProfile(userCode, profile);
    } catch (err) {
      console.error("Sync Failure:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  // Global sync is now handled by the transaction listener to avoid duplicates.

  useEffect(() => {
    if (bonusCountdown !== null && bonusCountdown > 0) {
      const timer = setInterval(() => {
        setBonusCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            addTransaction('bonus', 2000, 'Hourly Ads Bonus Claim');
            playSuccessSound();
            setShowPopup({show: true, msg: 'you just earn ads bonus', amount: 2000});
            localStorage.removeItem('ft_bonus_end');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [bonusCountdown]);

  const handleWatchAd = () => {
    if (isWatching || adCooldown !== null) return;
    setProtocolError(null);

    if (!savedProfileInfo.fullName || !savedProfileInfo.phone || !savedProfileInfo.email || savedProfileInfo.fullName === 'Active User') {
      setProtocolError('Please update your profile in settings before participating in ad sequences');
      showToast('Profile Incomplete');
      return;
    }
    
    const durationSeconds = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
    const durationMs = durationSeconds * 1000;

    setIsWatching(true);
    setShowTerminal(true);
    setProgress(0);
    setTerminalLogs([
      '> Initializing Ad-Stream protocol...', 
      `> Ad Sequence Length: ${durationSeconds}s`,
      '> Connecting to secure node...', 
      '> Bypassing anti-bot filters...'
    ]);
    
    const logInterval = setInterval(() => {
      const logs = [
        '> Syncing ad packets...',
        '> Validating frame buffer...',
        '> Encrypting earning hash...',
        '> Confirming view visibility...',
        '> Optimizing bandwidth...',
        '> Node response: 200 OK',
        '> Finalizing rewards calculation...'
      ];
      setTerminalLogs(prev => [...prev, logs[Math.floor(Math.random() * logs.length)]].slice(-6));
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / durationSeconds);
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
      setProgress(100);
      setTerminalLogs(prev => [...prev, '> Ad sequence complete.', '> Starting final validation...', '> Processing_Packets...']);
      
      setTimeout(async () => {
        setIsWatching(false);
        setShowTerminal(false);

        const gain = Math.floor(Math.random() * (2500 - 250 + 1)) + 250;
        const newAdsWatched = adsWatched + 1;
        
        const newTx: Transaction = {
          id: 'tx_' + Math.random().toString(36).substr(2, 9),
          type: 'earning',
          amount: gain,
          status: 'approved',
          timestamp: Date.now(),
          description: 'Ad-Stream Reward Node 0x' + Math.random().toString(16).substr(2, 4)
        };

        setAdsWatched(newAdsWatched);
        setTransactions(prev => [newTx, ...prev]);

        setProgress(0);
        setTerminalLogs([]);
        playSuccessSound();
        setShowPopup({show: true, msg: 'you just eanered an amount for watching ads', amount: gain});
        
        const cooldownEnd = Date.now() + (10 * 1000);
        localStorage.setItem('ft_ad_cooldown_end', cooldownEnd.toString());
        setAdCooldown(10);
      }, 10000);
    }, durationMs);
  };

  const startBonusTimer = () => {
    if (bonusCountdown !== null) return;
    const endTime = Date.now() + (3600 * 1000);
    localStorage.setItem('ft_bonus_end', endTime.toString());
    setBonusCountdown(3600);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSuccessSound = () => {
    const audio = new Audio('http://receipt.sammiehost.com/meldix-success-340660.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio play failed:", e));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fundstube_user_auth');
    sessionStorage.removeItem('fundstube_user_code');
    setProtocolError(null);
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);
    if (!userCode) return;

    try {
      const profile = {
        fullName: settingsForm.fullName,
        phone: settingsForm.phone,
        email: settingsForm.email,
        balance: balance,
        earnings: earnings,
        adsWatched: adsWatched,
        transactions: transactions
      };
      
      await db.updateProfile(userCode, profile);
      setSavedProfileInfo({ ...settingsForm });
      setSettingsStatus({type: 'success', msg: 'Profile updated successfully'});
      setProtocolError(null);
      setTimeout(() => setSettingsStatus(null), 3000);
    } catch (err) {
      setSettingsStatus({type: 'error', msg: 'Failed to update profile. Server unreachable.'});
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amt = Number(withdrawAmount);
    
    if (amt > balance) {
      setWithdrawError('Insufficient balance for this transaction.');
      return;
    }

    const minBank = adminSettings?.minWithdrawalBank || 1000;
    const minUsdtVal = adminSettings?.minWithdrawalUsdt || 5;

    if (withdrawMethod === 'bank') {
      if (amt < minBank) {
        setWithdrawError(`Minimum withdrawal for Bank Transfer is ₦${minBank.toLocaleString()}`);
        return;
      }
    } else if (withdrawMethod === 'usdt') {
      const nairaMin = minUsdtVal * 1500; 
      if (amt < nairaMin) {
        setWithdrawError(`Minimum withdrawal for USDT is $${minUsdtVal} (approx ₦${nairaMin.toLocaleString()})`);
        return;
      }
    }

    const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
    const description = withdrawMethod === 'bank' 
      ? `Withdrawal to ${withdrawDetails.bank} (${withdrawDetails.account})`
      : `Withdrawal to USDT Wallet (${withdrawDetails.wallet.substring(0,6)}...)`;

    const newTx: Transaction = {
      id: txId,
      type: 'withdrawal',
      amount: amt,
      status: 'pending',
      timestamp: Date.now(),
      description
    };

    setTransactions(prev => [newTx, ...prev]);
    setLastWithdrawal(newTx);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawMethod(null);
    setShowWithdrawSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Node Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
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

      {/* Community Popup */}
      <AnimatePresence>
        {showCommunityPopup && adminSettings?.communityPopupEnabled && (
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
                  href={adminSettings?.telegramLink || "https://t.me/fundstube"} 
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

      {/* Nav */}
      <nav className="relative z-20 border-b border-white/10 bg-[#050505]/80 backdrop-blur-2xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
              <span className="font-black italic text-white text-base">₦</span>
            </div>
            <span className="font-bold tracking-tight text-lg  md:block text-slate-200">{adminSettings?.appName || 'Terminal'}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/80">Network Online</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all active:scale-95"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Overview */}
            <section className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] -mr-48 -mt-48 rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1.5">
                      <ShieldCheck size={12} className="text-blue-500" /> Total Available Balance
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-slate-400 text-3xl font-light italic">₦</span>
                       <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                         {balance.toLocaleString()}
                       </h2>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Verified_Asset</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-5 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2"
                  >
                    <ArrowUpRight size={18} /> Withdraw Funds
                  </button>
                  <button 
                    onClick={() => setShowAdsHistory(true)}
                    className="px-5 py-3.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <History size={18} /> Asset History
                  </button>
                </div>
              </div>
            </section>

            {/* Earning Node Area */}
            <section className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/10">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">Ad-Stream Terminal</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowAdsHistory(true)}
                        className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                      >
                        History Log
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#050505] border border-white/5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-[#050505] mb-8">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="aspect-video flex flex-col items-center justify-center p-10">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-500 blur-2xl rounded-full"
                    />
                    <div 
                      onClick={handleWatchAd}
                      className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all group/play shadow-2xl"
                    >
                      <Play size={32} className="text-white fill-white ml-1 group-hover/play:scale-110 transition-transform" />
                    </div>
                  </div>
                  <p className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-widest text-center max-w-[200px] leading-relaxed">
                    Click to initialize secure ad sequence and validate rewards
                  </p>
                </div>
              </div>

              {protocolError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-tight"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  {protocolError}
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="ml-auto underline decoration-red-500/30 underline-offset-2 hover:text-white transition-colors"
                  >
                    Open Settings
                  </button>
                </motion.div>
              )}

              <button 
                onClick={handleWatchAd}
                disabled={isWatching || adCooldown !== null}
                className="w-full py-5 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
              >
                {isWatching ? (
                  <>
                    <RefreshCcw size={16} className="animate-spin" />
                    Streaming Ad Node...
                  </>
                ) : adCooldown !== null ? (
                  <>
                    <Clock size={16} />
                    Sync Cooldown ({adCooldown}s)
                  </>
                ) : (
                  <>
                    Start Earning Sequence
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </section>

            {/* Transaction History */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <History size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Transaction History</h3>
                </div>
               
              </div>

              <div className="space-y-4 overflow-x-auto  max-h-[500px] ">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">No recent transactions</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/[0.08] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          tx.status === 'canceled' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'deposit' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        }`}>
                          {tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white capitalize">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                              {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                              tx.status === 'approved' ? 'text-emerald-500' : 
                              tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {tx.status === 'approved' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-black text-sm ${
                        tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tx.type === 'earning' || tx.type === 'bonus' || tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Metrics Sidebar */}
            <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-10 flex items-center gap-2 border-b border-white/5 pb-4">
                <BarChart3 size={14} className="text-blue-500" /> Analytics Summary
              </h3>
              <div className="space-y-10">
                <div className="group">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex justify-between">
                    Life-time Rewards <span className="text-blue-500/50">₦</span>
                  </p>
                  <div className="flex items-center gap-3 text-3xl font-black text-slate-200 group-hover:text-white transition-colors">
                    ₦{earnings.toLocaleString()}
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
                    <div className="w-2/3 h-full bg-blue-500/30" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Eye size={10} className="text-indigo-400" /> Node Streams
                    </p>
                    <div className="text-xl font-black text-slate-200">{adsWatched}</div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Zap size={10} className="text-amber-400" /> Yield rate
                    </p>
                    <div className="text-xl font-black text-slate-200">1.25x</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                   <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-relaxed">
                     Higher node synchronization frequency increases your daily yield multiplier.
                   </p>
                </div>
              </div>
            </div>

            {/* System Status / Log */}
            <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
                <History size={14} className="text-blue-500" /> Event Monitor
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-200 leading-snug">Protocol Node fully established.</p>
                    <p className="text-[8px] text-slate-600 font-black mt-1 uppercase tracking-widest">Sys_Core • Live</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start opacity-40">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 leading-snug">Initial activation credit validated.</p>
                    <p className="text-[8px] text-slate-700 font-black mt-1 uppercase tracking-widest">Finance • 5m_Ago</p>
                  </div>
                </div>
              </div>
            </div>

           

            {/* Support */}
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2.5rem] p-8 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headset size={24} className="text-white" />
              </div>
              <h4 className="font-black mb-2">Need Assistance?</h4>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Our protocol engineers are available 24/7 to help with node sync issues.</p>
              <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                Open Support Ticket
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Popup Overlay */}
      <AnimatePresence>
        {showPopup.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Success!</h3>
              <p className="text-slate-400 font-bold mb-6 leading-tight">
                {showPopup.msg}
              </p>
              {showPopup.amount && (
                <div className="text-4xl font-black text-white mb-8">
                  +₦{showPopup.amount.toLocaleString()}
                </div>
              )}
              <button 
                onClick={() => setShowPopup({show: false, msg: ''})}
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg hover:bg-slate-100 transition-all"
              >
                Continue Earning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => {
                   setShowWithdrawModal(false);
                   setWithdrawError(null);
                }}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-black mb-2 text-white">Withdraw Funds</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Select your preferred method</p>
              
              {!withdrawMethod ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    onClick={() => setWithdrawMethod('bank')}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-blue-600/10 hover:border-blue-600/50 transition-all"
                  >
                    <Building2 className="text-blue-500" size={32} />
                    <span className="font-black text-xs uppercase tracking-widest">Bank Transfer</span>
                  </button>
                  <button 
                    onClick={() => setWithdrawMethod('usdt')}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-emerald-600/10 hover:border-emerald-600/50 transition-all"
                  >
                    <Globe className="text-emerald-500" size={32} />
                    <span className="font-black text-xs uppercase tracking-widest">USDT (TRC20)</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Amount (₦)</label>
                    <input 
                      type="number"
                      required
                      placeholder="Enter Amount"
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none px-6 font-bold focus:border-blue-500"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                        setWithdrawError(null);
                      }}
                    />
                  </div>
                  
                  {withdrawMethod === 'bank' ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Bank Name</label>
                        <input 
                          type="text" required
                          placeholder="e.g. Moniepoint"
                          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none px-6 font-bold"
                          value={withdrawDetails.bank}
                          onChange={(e) => setWithdrawDetails({...withdrawDetails, bank: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                        <input 
                          type="text" required
                          placeholder="Enter account name"
                          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none px-6 font-bold"
                          value={withdrawDetails.accountName}
                          onChange={(e) => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Number</label>
                        <input 
                          type="text" required
                          placeholder="10-digit account number"
                          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none px-6 font-bold"
                          value={withdrawDetails.account}
                          onChange={(e) => setWithdrawDetails({...withdrawDetails, account: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">USDT Wallet Address (TRC20)</label>
                      <input 
                        type="text" required
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl outline-none px-6 font-bold"
                        value={withdrawDetails.wallet}
                        onChange={(e) => setWithdrawDetails({...withdrawDetails, wallet: e.target.value})}
                      />
                    </div>
                  )}
                  
                  {withdrawError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-tight"
                    >
                      <AlertCircle size={16} />
                      {withdrawError}
                    </motion.div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setWithdrawMethod(null);
                        setWithdrawError(null);
                      }}
                      className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all"
                    >
                      Initiate Withdrawal
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal Success Modal */}
      <AnimatePresence>
        {showWithdrawSuccess && lastWithdrawal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[3rem] p-10 max-w-md w-full shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-white">Withdrawal Sent</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Network Confirmation Successful</p>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Dispatched</span>
                  <span className="text-xl font-black text-emerald-400">₦{lastWithdrawal.amount.toLocaleString()}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Transaction ID</span>
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{lastWithdrawal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Timestamp</span>
                    <span className="text-[10px] text-slate-300">{new Date(lastWithdrawal.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Status</span>
                    <span className="text-[10px] font-black text-amber-500 uppercase">On the way</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 mb-10 text-center">
                 <p className="text-[10px] text-blue-200 font-bold leading-relaxed">
                   Your node rewards are being routed through the secure gateway. Funds typically arrive at your destination node within 5-60 minutes.
                 </p>
              </div>

              <button 
                onClick={() => {
                  setShowWithdrawSuccess(false);
                  setLastWithdrawal(null);
                }}
                className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
              >
                Back to Protocol <ChevronRight size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ads Details Modal */}
      <AnimatePresence>
        {showAdsHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAdsHistory(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-tighter">Asset & Earning History</h3>
              
              <div className="overflow-y-auto space-y-4 pr-2">
                {transactions.length === 0 ? (
                  <p className="text-center py-20 text-slate-600 font-black uppercase tracking-widest text-xs">No activity log found</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${
                           tx.status === 'canceled' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : tx.type === 'withdrawal'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                          {tx.type === 'withdrawal' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{tx.description}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 flex items-center gap-2">
                            {new Date(tx.timestamp).toLocaleString()}
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className={`uppercase ${
                              tx.status === 'approved' ? 'text-emerald-500' : 
                              tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                            }`}>{tx.status}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${
                          tx.type === 'withdrawal' && tx.status !== 'canceled' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {tx.type === 'withdrawal' && tx.status !== 'canceled' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">NODE_RECEIPT</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Earning Terminal Modal */}
      <AnimatePresence>
        {showTerminal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#0a0a0a] border border-blue-500/20 rounded-[2.5rem] p-10 max-w-xl w-full shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden font-mono"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <Zap className="text-blue-500 animate-pulse" size={24} />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Earning Terminal</h3>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-black text-blue-400 uppercase animate-pulse">Live_Sync</span>
                </div>
              </div>

              <div className="bg-black/60 border border-white/5 rounded-2xl p-6 mb-8 min-h-[200px] flex flex-col">
                <div className="flex-grow space-y-2 mb-6 overflow-hidden">
                  {terminalLogs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[11px] text-blue-400/80 tracking-tight"
                    >
                      {log}
                    </motion.div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                      Processing_Packets
                    </p>
                    <p className="text-xs font-black text-white">
                      {Math.floor(progress)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-600/10 p-5 rounded-2xl text-center">
                 <p className="text-[10px] text-blue-400/70 font-bold leading-relaxed uppercase tracking-widest">
                   Do not close this window during the synchronization process to ensure node rewards are correctly validated.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setShowSettings(false);
                  setSettingsStatus(null);
                }}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                  <Settings size={20} />
                </div>
                <h3 className="text-2xl font-black text-white">Node Settings</h3>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Update your identification details</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text"
                      required
                      className="w-full py-4 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold focus:border-blue-500/50 transition-all text-white"
                      value={settingsForm.fullName}
                      onChange={(e) => setSettingsForm({...settingsForm, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <div className="relative group">
                    <PhoneCall className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="tel"
                      required
                      className="w-full py-4 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold focus:border-blue-500/50 transition-all text-white"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="email"
                      required
                      className="w-full py-4 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold focus:border-blue-500/50 transition-all text-white"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                    />
                  </div>
                </div>

                {settingsStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-tight ${
                      settingsStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}
                  >
                    {settingsStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {settingsStatus.msg}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                >
                  Save Configuration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
