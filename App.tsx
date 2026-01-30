import React, { useState, useRef, useEffect } from 'react';
import { PotteryEntry, View, Material, CraftMode, UserAccount } from './types';
import { analyzePotteryImage } from './services/geminiService';
import PotteryCard from './components/PotteryCard';
import UploadModal from './components/UploadModal';
import MaterialModal from './components/MaterialModal';
import { CRAFT_CONFIG } from './constants';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<CraftMode>(() => {
    return (localStorage.getItem('inform_current_mode') as CraftMode) || CraftMode.POTTERY;
  });
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [entries, setEntries] = useState<PotteryEntry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PotteryEntry | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStageFilter, setSearchStageFilter] = useState<string | 'ALL'>('ALL');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // 控制各栏目的展开/折叠状态
  const [expandedSections, setExpandedSections] = useState({
    recent: true,
    wip: true,
    portfolio: true,
    discarded: false // 已废弃模块默认折叠，节省空间
  });

  const [expandedMaterialSections, setExpandedMaterialSections] = useState<Record<string, boolean>>({});

  const ENTRIES_KEY = `inform_entries_${currentMode}`;
  const MATERIALS_KEY = `inform_mats_${currentMode}`;
  const USERS_KEY = 'inform_users';
  const CURRENT_USER_KEY = 'inform_current_user';
  const config = CRAFT_CONFIG[currentMode];

  useEffect(() => {
    localStorage.setItem('inform_current_mode', currentMode);
    const saved = localStorage.getItem(ENTRIES_KEY);
    const savedMats = localStorage.getItem(MATERIALS_KEY);
    setEntries(saved ? JSON.parse(saved) : []);
    setMaterials(savedMats ? JSON.parse(savedMats) : []);
    
    const initialExpanded: Record<string, boolean> = {};
    config.materialTypes.forEach(t => initialExpanded[t.id] = true);
    setExpandedMaterialSections(initialExpanded);
  }, [currentMode, ENTRIES_KEY, MATERIALS_KEY, config.materialTypes]);

  useEffect(() => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries, ENTRIES_KEY]);

  useEffect(() => {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  }, [materials, MATERIALS_KEY]);

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    const savedCurrent = localStorage.getItem(CURRENT_USER_KEY);
    const parsedUsers: UserAccount[] = savedUsers ? JSON.parse(savedUsers) : [];
    setUsers(parsedUsers);
    if (savedCurrent) {
      const found = parsedUsers.find(u => u.id === savedCurrent);
      if (found) setCurrentUser(found);
    }
  }, []);

  const persistUsers = (list: UserAccount[]) => {
    setUsers(list);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const persistCurrentUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) localStorage.setItem(CURRENT_USER_KEY, user.id);
    else localStorage.removeItem(CURRENT_USER_KEY);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPreviewImage(reader.result as string); setIsUploading(true); };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEntry = async (data: any) => {
    setIsUploading(false);
    const isEditing = !!editingEntry;
    let finalData = { ...data };

    if (!isEditing && finalData.images?.[0]) {
      setIsAnalyzing(true);
      try {
        const insights = await analyzePotteryImage(finalData.images[0], finalData.stage);
        if (finalData.title.includes('记录') || finalData.title.includes('未命名')) {
          finalData.title = insights.title;
        }
        finalData.aiInsights = insights.insight;
      } catch (err) { console.error(err); }
      setIsAnalyzing(false);
    }

    if (isEditing && editingEntry) {
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...finalData } : e));
    } else {
      setEntries(prev => [{ id: Date.now().toString(), timestamp: Date.now(), ...finalData }, ...prev]);
    }
    setEditingEntry(null); setPreviewImage(null);
  };

  const handleSaveMaterial = (data: Omit<Material, 'id'>) => {
    if (editingMaterial) {
      setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? { ...data, id: m.id } : m));
    } else {
      setMaterials(prev => [{ ...data, id: Date.now().toString() }, ...prev]);
    }
    setIsAddingMaterial(false); setEditingMaterial(null);
  };

  const handleQuickAddMaterial = (data: { type: string; name: string; brand: string }): Material | null => {
    if (!data.name.trim()) return null;
    const newMat: Material = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: data.name.trim(),
      brand: data.brand || '',
      type: data.type,
      images: []
    };
    setMaterials(prev => [newMat, ...prev]);
    return newMat;
  };

  const handleRegister = () => {
    setAuthError('');
    if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password.trim()) {
      setAuthError('请填写完整信息');
      return;
    }
    const exists = users.find(u => u.email.toLowerCase() === authForm.email.toLowerCase());
    if (exists) {
      setAuthError('该邮箱已注册');
      return;
    }
    const newUser: UserAccount = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: authForm.name.trim(),
      email: authForm.email.trim(),
      password: authForm.password
    };
    const next = [newUser, ...users];
    persistUsers(next);
    persistCurrentUser(newUser);
    setCurrentView('profile');
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleLogin = () => {
    setAuthError('');
    const target = users.find(u => u.email.toLowerCase() === authForm.email.toLowerCase());
    if (!target || target.password !== authForm.password) {
      setAuthError('邮箱或密码错误');
      return;
    }
    persistCurrentUser(target);
    setCurrentView('profile');
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleLogout = () => {
    persistCurrentUser(null);
  };

  const handleCardClick = (entry: PotteryEntry) => {
    setEditingEntry(entry);
    setPreviewImage(entry.images[0]);
    setIsUploading(true);
  };

  // 数据过滤逻辑
  const recentlyAdded = entries.filter(e => e.stage !== '放弃').slice(0, 6);
  const inProgress = entries.filter(e => e.stage !== '成品' && e.stage !== '灵感' && e.stage !== '放弃');
  const portfolio = entries.filter(e => e.stage === '成品');
  const inspirations = entries.filter(e => e.stage === '灵感');
  const discarded = entries.filter(e => e.stage === '放弃');

  const filteredSearchEntries = entries.filter(e => {
    const matchesQuery = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || (e.memo || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = searchStageFilter === 'ALL' || e.stage === searchStageFilter;
    return matchesQuery && matchesStage;
  });

  return (
    <div className="min-h-screen bg-warm-surface text-stone-text font-sans pb-24">
      <header className="sticky top-0 z-40 bg-warm-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-stone-100">
        <div className="relative">
          <button onClick={() => setShowModeMenu(!showModeMenu)} className="flex items-center gap-2 group">
            <h1 className="text-xl font-black tracking-tight text-stone-900 uppercase">手里·InForm</h1>
            <span className="bg-stone-100 text-[10px] font-bold px-2 py-0.5 rounded-full text-stone-500">{currentMode}</span>
            <span className="material-symbols-outlined text-stone-400 text-lg">expand_more</span>
          </button>
          {showModeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)}></div>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
                {Object.values(CraftMode).map(mode => (
                  <button key={mode} onClick={() => { setCurrentMode(mode); setShowModeMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-bold ${currentMode === mode ? 'text-terracotta bg-terracotta/5' : 'text-stone-500 hover:bg-stone-50'}`}>{mode}模式</button>
                ))}
              </div>
            </>
          )}
        </div>
        <button onClick={() => setCurrentView('profile')} className="size-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"><span className="material-symbols-outlined">more_vert</span></button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {currentView === 'home' && (
          <div className="space-y-10">
            <Section title="最近添加" icon="schedule" isOpen={expandedSections.recent} onToggle={() => setExpandedSections(p => ({...p, recent: !p.recent}))}>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
                {recentlyAdded.length > 0 ? recentlyAdded.map(e => <PotteryCard key={e.id} entry={e} compact onClick={() => handleCardClick(e)} />) : <EmptyState text="开启记录" />}
              </div>
            </Section>

            <Section title="制作中" icon="handyman" isOpen={expandedSections.wip} onToggle={() => setExpandedSections(p => ({...p, wip: !p.wip}))}>
              <div className="grid grid-cols-2 gap-4">
                {inProgress.length > 0 ? inProgress.map(e => <PotteryCard key={e.id} entry={e} onClick={() => handleCardClick(e)} />) : <p className="col-span-2 text-center py-10 text-stone-300 text-xs font-bold uppercase tracking-widest">目前无进度</p>}
              </div>
            </Section>

            <Section title="作品集" icon="auto_awesome" isOpen={expandedSections.portfolio} onToggle={() => setExpandedSections(p => ({...p, portfolio: !p.portfolio}))}>
              <div className="grid grid-cols-2 gap-4">
                {portfolio.length > 0 ? portfolio.map(e => <PotteryCard key={e.id} entry={e} onClick={() => handleCardClick(e)} />) : <p className="col-span-2 text-center py-10 text-stone-300 text-xs font-bold uppercase tracking-widest">无完成作品</p>}
              </div>
            </Section>

            {/* 已废弃模块：仅在有废弃作品时显示 */}
            {discarded.length > 0 && (
              <Section title="已废弃" icon="delete_outline" isOpen={expandedSections.discarded} onToggle={() => setExpandedSections(p => ({...p, discarded: !p.discarded}))}>
                <div className="grid grid-cols-2 gap-4 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                  {discarded.map(e => <PotteryCard key={e.id} entry={e} onClick={() => handleCardClick(e)} />)}
                </div>
              </Section>
            )}
          </div>
        )}

        {currentView === 'inspirations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-stone-900">灵感库</h2>
            <div className="grid grid-cols-2 gap-4">
              {inspirations.map(e => <PotteryCard key={e.id} entry={e} onClick={() => handleCardClick(e)} />)}
              {inspirations.length === 0 && <EmptyState text="灵感库空空如也" />}
            </div>
          </div>
        )}

        {currentView === 'materials' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-stone-900">材料仓库</h2><button onClick={() => { setEditingMaterial(null); setIsAddingMaterial(true); }} className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold">添加</button></div>
            {config.materialTypes.map(type => (
              <MaterialList 
                key={type.id} title={type.label} icon={type.icon}
                materials={materials.filter(m => m.type === type.id)}
                isOpen={expandedMaterialSections[type.id]}
                onToggle={() => setExpandedMaterialSections(p => ({...p, [type.id]: !p[type.id]}))}
                onEdit={(m: Material) => { setEditingMaterial(m); setIsAddingMaterial(true); }}
              />
            ))}
          </div>
        )}

        {currentView === 'search' && (
          <div className="space-y-6">
            <div className="relative"><input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索..." className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl outline-none font-medium" /><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300">search</span></div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => setSearchStageFilter('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${searchStageFilter === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>全部</button>
              {config.stages.map(s => <button key={s.value} onClick={() => setSearchStageFilter(s.value)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${searchStageFilter === s.value ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>{s.value}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-4">{filteredSearchEntries.map(e => <PotteryCard key={e.id} entry={e} onClick={() => handleCardClick(e)} />)}</div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-stone-900">个人页面</h2>
                <p className="text-sm text-stone-400 font-medium">登录 / 注册以同步你的创作</p>
              </div>
              {currentUser && <button onClick={handleLogout} className="px-3 py-2 rounded-xl bg-stone-100 text-xs font-bold text-stone-600">退出</button>}
            </div>

            {currentUser ? (
              <div className="p-5 rounded-2xl bg-white border border-stone-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-lg font-bold">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-stone-900">{currentUser.name}</p>
                    <p className="text-sm text-stone-400">{currentUser.email}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-400">当前为本地多用户存储，后续可接入远端账户体系。</p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white border border-stone-100 space-y-5">
                <div className="flex gap-2">
                  <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`flex-1 py-3 rounded-xl text-sm font-bold ${authMode === 'login' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>登录</button>
                  <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`flex-1 py-3 rounded-xl text-sm font-bold ${authMode === 'register' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>注册</button>
                </div>

                {authMode === 'register' && (
                  <input value={authForm.name} onChange={e => setAuthForm(prev => ({ ...prev, name: e.target.value }))} placeholder="昵称" className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 text-sm font-medium" />
                )}
                <input value={authForm.email} onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))} placeholder="邮箱" className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 text-sm font-medium" />
                <input type="password" value={authForm.password} onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))} placeholder="密码" className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 text-sm font-medium" />
                {authError && <p className="text-xs text-red-500">{authError}</p>}
                <button onClick={authMode === 'login' ? handleLogin : handleRegister} className="w-full py-3 rounded-xl bg-terracotta text-white text-sm font-bold active:scale-95 transition-transform">
                  {authMode === 'login' ? '登录' : '注册并登录'}
                </button>
              </div>
            )}

            {users.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">本机账户</p>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-100">
                      <div>
                        <p className="text-sm font-bold text-stone-800">{u.name}</p>
                        <p className="text-[11px] text-stone-400">{u.email}</p>
                      </div>
                      <button onClick={() => { setAuthMode('login'); setAuthForm({ name: u.name, email: u.email, password: '' }); setCurrentView('profile'); }} className="text-xs font-bold text-terracotta">登录</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-100 px-6 py-4 flex items-center justify-between z-40">
        <NavBtn active={currentView === 'home'} icon="history" label="记录" onClick={() => setCurrentView('home')} />
        <NavBtn active={currentView === 'inspirations'} icon="lightbulb" label="灵感" onClick={() => setCurrentView('inspirations')} />
        <div className="relative -mt-12"><button onClick={() => fileInputRef.current?.click()} className="size-14 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform active:scale-90"><span className="material-symbols-outlined text-3xl">add</span></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /></div>
        <NavBtn active={currentView === 'materials'} icon="inventory_2" label="仓库" onClick={() => setCurrentView('materials')} />
        <NavBtn active={currentView === 'search'} icon="search" label="搜索" onClick={() => setCurrentView('search')} />
      </nav>

      {isUploading && <UploadModal mode={currentMode} image={previewImage || (editingEntry?.images[0] || '')} initialData={editingEntry || undefined} availableMaterials={materials} onConfirm={handleSaveEntry} onCancel={() => { setIsUploading(false); setEditingEntry(null); setPreviewImage(null); }} onQuickAddMaterial={handleQuickAddMaterial} />}
      {isAddingMaterial && <MaterialModal mode={currentMode} initialData={editingMaterial || undefined} onConfirm={handleSaveMaterial} onCancel={() => { setIsAddingMaterial(false); setEditingMaterial(null); }} />}
      {isAnalyzing && <div className="fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6"><div className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center gap-4 text-center"><div className="size-12 rounded-full border-4 border-stone-100 border-t-terracotta animate-spin"></div><p className="font-bold">分析中...</p></div></div>}
    </div>
  );
};

// 通用 Section 组件
const Section = ({ title, icon, children, isOpen, onToggle }: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between cursor-pointer group" onClick={onToggle}>
      <div className="flex items-center gap-2">
        {icon && <span className="material-symbols-outlined text-stone-300 text-lg">{icon}</span>}
        <h3 className="text-xs font-bold text-stone-muted uppercase tracking-widest group-hover:text-stone-900 transition-colors">{title}</h3>
      </div>
      <span className={`material-symbols-outlined text-stone-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-stone-500' : ''}`}>expand_more</span>
    </div>
    {isOpen && <div className="animate-in fade-in slide-in-from-top-1 duration-300">{children}</div>}
  </div>
);

const MaterialList = ({ title, icon, materials, isOpen, onToggle, onEdit }: any) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between cursor-pointer group" onClick={onToggle}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-stone-300 text-lg">{icon}</span>
        <h3 className="text-xs font-bold text-stone-muted uppercase tracking-widest group-hover:text-stone-900 transition-colors">{title}</h3>
      </div>
      <span className={`material-symbols-outlined text-stone-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-stone-500' : ''}`}>expand_more</span>
    </div>
    {isOpen && (
      <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-1">
        {materials.length > 0 ? materials.map((m: Material) => (
          <div key={m.id} onClick={() => onEdit(m)} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl hover:border-stone-200 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100 overflow-hidden">{m.images?.[0] ? <img src={m.images[0]} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-stone-200">category</span>}</div>
              <div><p className="text-sm font-bold text-stone-800">{m.name}</p><p className="text-[10px] text-stone-400 font-medium">{m.brand || '未知品牌'}</p></div>
            </div>
            <span className="material-symbols-outlined text-stone-200">chevron_right</span>
          </div>
        )) : <p className="py-6 text-center text-stone-300 text-[10px] font-bold uppercase tracking-widest">暂无数据</p>}
      </div>
    )}
  </div>
);

const NavBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-terracotta' : 'text-stone-400'}`}>
    <span className={`material-symbols-outlined text-2xl ${active ? 'fill-1' : ''}`}>{icon}</span>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="w-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-stone-100 rounded-[2rem]">
    <span className="material-symbols-outlined text-4xl text-stone-100 mb-2">auto_awesome_motion</span>
    <p className="text-stone-300 text-xs font-bold uppercase tracking-widest">{text}</p>
  </div>
);

export default App;
