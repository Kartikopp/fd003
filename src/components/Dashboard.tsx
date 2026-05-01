import { useState, useEffect } from "react";
import { Stock, NewsItem, UserProfile, Course, Resource } from "../types";
import { getMockStocks, getMockNews, getMockCourses, getMockResources } from "../lib/stockService";
import { getInvestmentAdvice } from "../lib/geminiService";
import StockChart from "./StockChart";
import { TrendingUp, Bell, Star, Search, Brain, LogOut, Loader2, BookOpen, Clock, BarChart, ShieldCheck, CheckCircle2, FileText, Download, ShoppingBag, Settings, User, CreditCard, Lock, Mail, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function Dashboard({ userProfile, onUpdateProfile }: { userProfile: UserProfile, onUpdateProfile: (p: UserProfile) => void }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [view, setView] = useState<'terminal' | 'academy' | 'settings'>('terminal');
  const [academyTab, setAcademyTab] = useState<'courses' | 'library'>('courses');
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleNotifications = async () => {
    const updated = { ...userProfile, notificationsEnabled: !userProfile.notificationsEnabled };
    onUpdateProfile(updated);
    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        notificationsEnabled: updated.notificationsEnabled,
        updatedAt: serverTimestamp()
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const fetchData = () => {
      const mockStocks = getMockStocks();
      setStocks(mockStocks);
      setNews(getMockNews());
      setCourses(getMockCourses());
      setResources(getMockResources());
      if (!selectedStock) setSelectedStock(mockStocks[0]);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const enrollInCourse = async (courseId: string) => {
    if (userProfile.enrolledCourses.includes(courseId)) return;
    
    const newEnrollments = [...userProfile.enrolledCourses, courseId];
    const updated = { ...userProfile, enrolledCourses: newEnrollments };
    onUpdateProfile(updated);

    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        enrolledCourses: newEnrollments,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Enrollment failed", e);
    }
  };

  const purchaseResource = async (resourceId: string) => {
    if (userProfile.purchasedResources.includes(resourceId)) return;
    
    const newPurchases = [...userProfile.purchasedResources, resourceId];
    const updated = { ...userProfile, purchasedResources: newPurchases };
    onUpdateProfile(updated);

    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        purchasedResources: newPurchases,
        updatedAt: serverTimestamp()
      });
      alert("PDF Purchased! You can now download it.");
    } catch (e) {
      console.error("Purchase failed", e);
    }
  };

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const watchlistStocks = stocks.filter(s => userProfile.watchlist.includes(s.symbol));
      const newsTitles = news.map(n => n.title);
      const advice = await getInvestmentAdvice(watchlistStocks.length > 0 ? watchlistStocks : stocks.slice(0, 3), newsTitles);
      setAiAdvice(advice);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const toggleWatchlist = async (symbol: string) => {
    const isWatched = userProfile.watchlist.includes(symbol);
    const newWatchlist = isWatched 
      ? userProfile.watchlist.filter(s => s !== symbol)
      : [...userProfile.watchlist, symbol];
    
    const updated = { ...userProfile, watchlist: newWatchlist };
    onUpdateProfile(updated);
    
    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        watchlist: newWatchlist,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to update watchlist", e);
    }
  };

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-4 md:p-6 space-y-4 max-w-[1440px] mx-auto flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between glass rounded-2xl px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#0B0E14]">FD</div>
          <h1 className="text-xl font-bold tracking-tight">Finance<span className="text-emerald-500">Dastak</span></h1>
        </div>
        
        <div className="hidden lg:flex space-x-8 text-sm font-medium text-slate-400">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-50">NIFTY 50</span>
            <span className="text-slate-100">22,453.20 <span className="trend-up">+0.85%</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-50">SENSEX</span>
            <span className="text-slate-100">73,901.35 <span className="trend-up">+0.72%</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 bg-white/5 p-1 rounded-xl glass">
            {[
              { id: 'terminal', label: 'Terminal' },
              { id: 'academy', label: 'Academy' },
              { id: 'settings', label: 'Settings' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === item.id ? 'bg-emerald-500 text-[#0B0E14]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search stocks..." 
              className="pl-10 pr-4 py-1.5 glass rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-xs w-48 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-100">{userProfile.email.split('@')[0]}</p>
              <p className="text-[10px] text-emerald-500 font-medium tracking-tight">Verified Terminal</p>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-slate-100" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 glass rounded-2xl flex-col p-5 gap-6 overflow-y-auto">
          <nav className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 ml-2">Navigation</p>
            {[
              { id: 'terminal', icon: TrendingUp, label: 'Market Terminal' },
              { id: 'academy', icon: BookOpen, label: 'Finance Academy' },
              { id: 'settings', icon: Settings, label: 'User Settings' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all ${view === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="space-y-3">
             <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 ml-2">My Watchlist</p>
             <div className="space-y-1">
                {stocks.filter(s => userProfile.watchlist.includes(s.symbol)).map(s => (
                  <button 
                    key={s.symbol} 
                    onClick={() => { setView('terminal'); setSelectedStock(s); }} 
                    className={`w-full flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors text-xs ${selectedStock?.symbol === s.symbol ? 'bg-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                       <Star 
                        className={`w-3 h-3 ${userProfile.watchlist.includes(s.symbol) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-600'}`} 
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(s.symbol); }}
                      />
                      <span className="font-semibold text-slate-300">{s.symbol}</span>
                    </div>
                    <span className={`font-mono ${s.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {s.change >= 0 ? '+' : ''}{s.changePercent}%
                    </span>
                  </button>
                ))}
                {userProfile.watchlist.length === 0 && (
                  <p className="text-[10px] text-slate-500 italic ml-2">Empty watchlist</p>
                )}
             </div>
          </div>

          <div className="mt-auto p-4 bg-emerald-500 rounded-xl text-[#0B0E14] relative overflow-hidden group cursor-pointer" onClick={handleGetAdvice}>
            <Brain className="absolute -right-2 -bottom-2 w-12 h-12 opacity-10" />
            <p className="text-xs font-bold mb-1">AI Intelligence</p>
            <p className="text-[10px] leading-tight opacity-80 font-medium">
              {loadingAdvice ? 'Processing terminal data...' : aiAdvice ? aiAdvice.slice(0, 60) + '...' : 'Analysis ready. Tap to run query.'}
            </p>
          </div>
        </aside>

        {/* Dynamic Main Section */}
        <AnimatePresence mode="wait">
          {view === 'terminal' ? (
            <motion.section 
              key="terminal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1"
            >
              {/* Detailed View */}
              <div className="flex-1 glass rounded-3xl p-6 md:p-8 flex flex-col min-h-[400px]">
                <AnimatePresence mode="wait">
                  {selectedStock ? (
                    <motion.div
                      key={selectedStock.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl font-black tracking-tighter">${selectedStock.price}</span>
                            <span className={`text-sm font-bold ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change} ({selectedStock.changePercent}%)
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            {selectedStock.symbol} • {selectedStock.name} • LIVE
                          </p>
                        </div>
                        <div className="flex gap-2">
                           {['1H', '1D', '1W', '1M'].map(t => (
                             <button key={t} className={`px-3 py-1 text-[10px] rounded-lg border transition-all ${t === '1D' ? 'bg-slate-700 border-slate-600 text-white' : 'glass text-slate-400'}`}>{t}</button>
                           ))}
                        </div>
                      </div>

                      <div className="flex-1 min-h-[200px] mb-8">
                        <StockChart data={selectedStock.history} color={selectedStock.change >= 0 ? "#10b981" : "#ef4444"} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Day High", value: `$${(selectedStock.price * 1.02).toFixed(2)}` },
                          { label: "Day Low", value: `$${(selectedStock.price * 0.98).toFixed(2)}` },
                          { label: "Volume", value: selectedStock.volume },
                          { label: "Market Cap", value: selectedStock.marketCap },
                        ].map(st => (
                          <div key={st.label} className="p-3 glass rounded-xl">
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{st.label}</p>
                            <p className="text-sm font-black font-mono">{st.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                      Select a stock to view detailed analytics
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                {/* Sector News */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Intelligence Stream</h3>
                     <span className="text-[10px] text-emerald-500 animate-pulse font-bold tracking-widest uppercase">Live Updates</span>
                  </div>
                  <div className="space-y-4">
                    {news.slice(0, 3).map(n => (
                      <div key={n.id} className="flex gap-4 group cursor-pointer">
                        <div className="w-10 h-10 bg-slate-800 rounded flex-shrink-0 group-hover:bg-slate-700 transition-colors" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">{n.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{n.timestamp} • {n.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="glass rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expert Analysis</h3>
                    <button 
                      onClick={handleGetAdvice}
                      disabled={loadingAdvice}
                      className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg font-bold hover:bg-emerald-500/20 transition-all uppercase tracking-tight"
                    >
                      {loadingAdvice ? 'Processing...' : 'Run Query'}
                    </button>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex-1">
                    <p className="text-xs italic leading-relaxed text-slate-400 line-clamp-3">
                      {aiAdvice || '"Our predictive algorithms suggest bullish momentum in various sectors based on real-time sentiment analysis..."'}
                    </p>
                    <div className="mt-3 flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-widest">Sentiment: <span className="text-emerald-500">Aggressive</span></span>
                     <button className="uppercase text-slate-100 hover:text-emerald-400 transition-all font-black">Full Report →</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : view === 'settings' ? (
            <motion.section 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto pr-2"
            >
              <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
                <header>
                  <h2 className="text-3xl font-black tracking-tighter">Account Control</h2>
                  <p className="text-slate-400 text-sm italic">Manage your alerts, purchases, and security preferences.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Info */}
                  <div className="glass rounded-3xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
                        <User className="w-8 h-8 text-[#0B0E14]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{userProfile.email.split('@')[0]}</h3>
                        <p className="text-xs text-slate-500 font-mono italic">{userProfile.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${userProfile.notificationsEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">Push Notifications</p>
                            <p className="text-[10px] text-slate-500">Live stock and news alerts</p>
                          </div>
                        </div>
                        <button 
                          onClick={toggleNotifications}
                          className={`w-12 h-6 rounded-full transition-all relative ${userProfile.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${userProfile.notificationsEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="p-2 rounded-lg bg-slate-800 text-slate-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-tight">Email Reports</p>
                            <p className="text-[10px] text-slate-500">Daily market summary</p>
                          </div>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-slate-800 cursor-not-allowed">
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Stats */}
                  <div className="glass rounded-3xl p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-black uppercase tracking-widest text-sm">Data & Privacy</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        Your terminal data is encrypted using AES-256 standards. Watchlists and learning progress are stored securely in a private Firestore node.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Enrolled</p>
                          <p className="text-xl font-black text-emerald-400">{userProfile.enrolledCourses.length}</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Courses</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Purchased</p>
                          <p className="text-xl font-black text-emerald-400">{userProfile.purchasedResources.length}</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Resources</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Inventory / Purchase History */}
                <div className="glass rounded-3xl p-8">
                   <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    Terminal Inventory
                   </h3>
                   <div className="space-y-3">
                      {userProfile.enrolledCourses.length === 0 && userProfile.purchasedResources.length === 0 && (
                        <div className="py-12 text-center text-slate-600 italic text-sm">
                          No assets linked to your account yet.
                        </div>
                      )}
                      
                      {/* Course List */}
                      {courses.filter(c => userProfile.enrolledCourses.includes(c.id)).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800">
                               <img src={c.thumbnail} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight text-slate-200">{c.title}</p>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase">{c.category} • Course</p>
                            </div>
                          </div>
                          <button onClick={() => setView('academy')} className="p-2 text-slate-500 hover:text-emerald-400 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      ))}

                      {/* PDF List */}
                      {resources.filter(r => userProfile.purchasedResources.includes(r.id)).map(r => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                               <FileText className="w-6 h-6 text-emerald-500/50" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight text-slate-200">{r.title}</p>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase">{r.category} • PDF</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button className="p-2 h-10 w-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all">
                                <Download className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="academy"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">Finance Academy</h2>
                  <p className="text-slate-400 text-sm">Master the markets with expert-led courses and PDF resources.</p>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl glass">
                  <button 
                    onClick={() => setAcademyTab('courses')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${academyTab === 'courses' ? 'bg-emerald-500 text-[#0B0E14]' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Courses
                  </button>
                  <button 
                    onClick={() => setAcademyTab('library')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${academyTab === 'library' ? 'bg-emerald-500 text-[#0B0E14]' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF Library
                  </button>
                </div>
              </div>

              {academyTab === 'courses' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="glass rounded-3xl overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-[#0B0E14]/80 backdrop-blur-md rounded-full text-[10px] font-bold text-emerald-500 border border-emerald-500/30 uppercase tracking-widest leading-none">
                            {course.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-1 flex-col gap-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-black leading-tight group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{course.title}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest tracking-tighter">Instructor: {course.instructor}</p>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                        
                        <div className="flex items-center gap-4 py-2 border-y border-white/5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold">{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <BarChart className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase">{course.level}</span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="text-2xl font-black tracking-tighter">₹{course.price.toLocaleString()}</div>
                          {userProfile.enrolledCourses.includes(course.id) ? (
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" /> Enrolled
                            </button>
                          ) : (
                            <button 
                              onClick={() => enrollInCourse(course.id)}
                              className="px-6 py-2.5 bg-emerald-500 text-[#0B0E14] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                              Buy Course
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {resources.map(res => (
                    <div key={res.id} className="glass rounded-2xl overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all">
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
                        <img src={res.thumbnail} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4">
                           <span className="px-2 py-1 bg-emerald-500 text-[#0B0E14] rounded-md text-[9px] font-black uppercase tracking-widest mb-2 inline-block leading-none">
                            {res.category}
                          </span>
                          <h4 className="text-sm font-black text-white leading-tight uppercase tracking-tight">{res.title}</h4>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {res.pages} Pages</span>
                          <span>{res.fileSize}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{res.description}</p>
                        
                        <div className="mt-auto pt-2">
                           {userProfile.purchasedResources.includes(res.id) ? (
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                              <Download className="w-3.5 h-3.5" /> Download PDF
                            </button>
                          ) : (
                            <button 
                              onClick={() => purchaseResource(res.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-[#0B0E14] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" /> Buy for ₹{res.price}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
