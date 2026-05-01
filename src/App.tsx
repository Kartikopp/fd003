import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';
import { Loader2, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            watchlist: ['AAPL', 'MSFT', 'GOOGL'],
            notificationsEnabled: true,
            enrolledCourses: [],
            purchasedResources: [],
          };
          await setDoc(profileRef, {
            ...newProfile,
            updatedAt: serverTimestamp()
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B0E14]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="h-screen flex flex-col md:flex-row bg-[#0B0E14] overflow-hidden">
        {/* Branding/Hero */}
        <div className="flex-1 bg-emerald-500 p-8 md:p-16 flex flex-col justify-between text-[#0B0E14] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] bg-[size:40px_40px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-[#0B0E14] rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-2xl font-black tracking-tighter">Finance Dastak</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6">
              REDEFINE YOUR <br />INVESTMENT <br /><span className="opacity-60 text-[#0B0E14]">STRATEGY.</span>
            </h1>
            <p className="text-xl text-[#0B0E14]/80 max-w-md font-medium">
              Real-time visualization, AI-driven insights, and secure asset tracking for the modern investor.
            </p>
          </div>
          <div className="relative text-[#0B0E14]/60 text-sm font-mono uppercase tracking-widest">
            Finance Dastak Premium Terminal v1.0
          </div>
        </div>

        {/* Login Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[480px] p-8 md:p-16 flex flex-col justify-center bg-[#0B0E14]"
        >
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-100">Get Started</h2>
              <p className="text-slate-400">Sign in to access your secure financial dashboard.</p>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 glass text-slate-100 rounded-2xl hover:bg-white/10 transition-all font-semibold shadow-sm hover:shadow-md"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale invert" alt="Google" referrerPolicy="no-referrer" />
              Continue with Google
            </button>

            <div className="pt-8 space-y-4">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-emerald-500/10 rounded-lg">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-300 uppercase tracking-tight">Zero-Trust Security</p>
                   <p className="text-xs text-slate-500">Your data is encrypted with Firebase security protocols.</p>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <Dashboard userProfile={profile} onUpdateProfile={setProfile} />;
}
