
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';
import { Language, User, EventType, FilterDraft, EditorTab } from './types';
import { TRANSLATIONS, PHONE_BG_IMAGE, PRICE_PREMIUM_DEFAULT } from './constants';
import { backendService } from './services/storageService';
import { getAiSuggestions } from './services/geminiService';

// Components
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import EditorCanvas from './components/EditorCanvas';
import Modal from './components/Modal';

const SCENES = [
  { id: 'black', url: '', label: 'Noir Total' },
  { id: 'default', url: PHONE_BG_IMAGE, label: 'Mode' },
  { id: 'wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Mariage' },
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [view, setView] = useState<'editor' | 'gallery'>('gallery');
  const [user, setUser] = useState<User | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentBg, setCurrentBg] = useState(SCENES[0].url);
  
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: 'tab1', name: 'Nouveau Design', canvasJson: '', eventType: EventType.WEDDING, price: PRICE_PREMIUM_DEFAULT }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab1');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState<number>(PRICE_PREMIUM_DEFAULT);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [allDrafts, setAllDrafts] = useState<FilterDraft[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllDrafts = useCallback(async () => {
    const drafts = await backendService.getDrafts();
    setAllDrafts([...drafts].sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  useEffect(() => {
    const sessionUser = backendService.getCurrentUser();
    if (sessionUser) setUser({ ...sessionUser, isAdmin: sessionUser.email.toLowerCase().includes('admin') });
    fetchAllDrafts();
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang, fetchAllDrafts]);

  useEffect(() => {
    if (!canvas) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.canvasJson) {
      canvas.loadFromJSON(activeTab.canvasJson, () => {
        canvas.renderAll();
      });
    } else {
      canvas.clear();
      canvas.renderAll();
    }
  }, [activeTabId, canvas]);

  const handleAiAsk = async () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;
    setAiLoading(true);
    try {
      const suggestions = await getAiSuggestions(activeTab.eventType, lang);
      setAiSuggestions(suggestions);
    } catch (err) { console.error(err); } finally { setAiLoading(false); }
  };

  const createNewTab = () => {
    if (!user?.isAdmin) return;
    setEditingDraftId(null);
    const newId = 'tab_' + Date.now();
    setTabs([...tabs, { id: newId, name: `Design ${tabs.length + 1}`, canvasJson: '', eventType: EventType.WEDDING, price: PRICE_PREMIUM_DEFAULT }]);
    setActiveTabId(newId);
    if(canvas) {
      canvas.clear();
      canvas.requestRenderAll();
    }
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id);
      setEditingDraftId(null);
    }
  };

  const addPriceToFilter = () => {
    if (!canvas) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;
    const existing = canvas.getObjects().find(o => (o as any).isPriceTag);
    if (existing) canvas.remove(existing);

    const priceText = new fabric.IText(`${activeTab.price} ${TRANSLATIONS[lang].currency}`, {
      left: 170,
      top: 520,
      fontFamily: lang === 'ar' ? 'Tajawal' : 'Poppins',
      fontSize: 22,
      fontWeight: 'bold',
      fill: '#ffffff',
      backgroundColor: 'rgba(147, 51, 234, 0.9)',
      padding: 12,
      originX: 'center',
      rx: 15, ry: 15,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10 })
    });
    (priceText as any).isPriceTag = true;
    canvas.add(priceText);
    canvas.setActiveObject(priceText);
    canvas.requestRenderAll();
  };

  const handleLogin = async (email: string, name: string) => {
    setIsAuthLoading(true);
    try {
      const loggedUser = await backendService.signup(email, name);
      setUser({ ...loggedUser, isAdmin: email.toLowerCase().includes('admin') });
      setIsLoginOpen(false);
      setView('editor');
    } finally { setIsAuthLoading(false); }
  };

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: "Boutique de Filtres", 
          text: lang === 'fr' ? "Découvrez mes créations exclusives !" : "شاهد تصاميم الفلاتر الحصرية الخاصة بي!",
          url: url 
        });
      } catch (e) { console.log(e); }
    } else {
      navigator.clipboard.writeText(url);
      alert(lang === 'fr' ? "Lien de la boutique copié !" : "تم نسخ رابط المتجر!");
    }
  };

  const loadDraftToCanvas = (draft: FilterDraft) => {
    if (!canvas) return;
    setEditingDraftId(draft.id);
    setView('editor');
    canvas.clear();
    canvas.loadFromJSON(draft.canvasJson, () => {
      canvas.renderAll();
      setTabs([{ 
        id: 'edit_'+draft.id, 
        canvasJson: draft.canvasJson, 
        eventType: draft.eventType, 
        price: draft.price,
        name: draft.name
      }]);
      setActiveTabId('edit_'+draft.id);
    });
  };

  const downloadPreview = (draft: FilterDraft) => {
    const link = document.createElement('a');
    link.download = `${draft.name}.png`;
    link.href = draft.previewUrl;
    link.click();
  };

  const renderGallery = () => {
    const t = TRANSLATIONS[lang];
    return (
      <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 md:p-12 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">{t.galleryTitle}</h2>
            <p className="text-gray-500 text-lg font-medium">{t.gallerySubtitle}</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {allDrafts.map((draft) => (
              <div key={draft.id} className="group bg-gray-900/30 rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-purple-500/40">
                <div className="aspect-[16/9] relative overflow-hidden bg-black/40">
                  <img src={draft.previewUrl} className="w-full h-full object-cover opacity-90 transition duration-1000" alt={draft.name} />
                  <div className="absolute top-6 right-6 bg-purple-600 px-5 py-2 rounded-full text-[11px] font-black shadow-2xl backdrop-blur-md">
                    {draft.price} {t.currency}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-black text-xl tracking-tight">{draft.name}</h4>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      {t[draft.eventType as keyof typeof t] || draft.eventType}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setCheckoutPrice(draft.price); setIsCheckoutOpen(true); }} className="flex-1 bg-white text-black h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition shadow-xl">
                      {t.orderNow}
                    </button>
                    <button onClick={() => downloadPreview(draft)} className="w-14 h-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition" title={t.download}>
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allDrafts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] bg-white/2">
              <i className="fa-solid fa-store-slash text-4xl text-gray-700 mb-6"></i>
              <p className="text-gray-600 font-black uppercase tracking-[0.3em]">{t.noDrafts}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className={`flex flex-col h-screen bg-gray-950 text-white selection:bg-purple-500/30 ${lang === 'ar' ? 'ar-font' : ''}`}>
      <Header 
        lang={lang} toggleLang={() => setLang(l => l === 'fr' ? 'ar' : 'fr')} 
        user={user} onLoginClick={() => setIsLoginOpen(true)} onLogout={() => { backendService.logout(); setUser(null); setView('gallery'); }}
        currentView={view} onViewChange={setView}
      />
      
      {view === 'editor' && user?.isAdmin && (
        <div className="flex bg-black/80 border-b border-white/5 px-8 gap-2 py-2 overflow-x-auto no-scrollbar backdrop-blur-2xl">
          {tabs.map(tab => (
            <div 
              key={tab.id} 
              className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all cursor-pointer group ${activeTabId === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`} 
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-widest">{tab.name}</span>
              {tabs.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition">
                  <i className="fa-solid fa-circle-xmark text-xs"></i>
                </button>
              )}
            </div>
          ))}
          <button onClick={createNewTab} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-gray-500 hover:text-purple-500 transition border border-white/5">
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden relative">
        {view === 'editor' && user?.isAdmin ? (
          <>
            <SidebarLeft 
              lang={lang} canvas={canvas} eventType={activeTab?.eventType || 'custom'} 
              setEventType={(et) => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, eventType: et } : t))}
              onAiAsk={handleAiAsk} aiLoading={aiLoading} aiSuggestions={aiSuggestions}
              onAddAiText={(txt) => {
                if(!canvas) return;
                const fTxt = new fabric.IText(txt, { 
                  left: 170, top: 300, fill: '#fff', 
                  fontSize: 32, originX: 'center', 
                  fontFamily: lang === 'ar' ? 'Tajawal' : 'Great Vibes',
                  textAlign: 'center',
                  shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 15 })
                });
                canvas.add(fTxt); canvas.setActiveObject(fTxt); canvas.requestRenderAll();
              }}
              selectedObject={selectedObject} 
              onDelete={() => { canvas?.remove(...canvas.getActiveObjects()); canvas?.discardActiveObject(); canvas?.requestRenderAll(); }}
              onReset={() => { 
                if(!canvas) return;
                if(confirm(lang === 'fr' ? 'VIDER CANVAS : Voulez-vous tout effacer ?' : 'إفراغ اللوحة: هل تريد حذف كل شيء؟')) {
                   canvas.getObjects().forEach(obj => canvas.remove(obj));
                   canvas.discardActiveObject();
                   canvas.requestRenderAll();
                }
              }} 
              currentBg={currentBg} onBgChange={setCurrentBg} scenes={SCENES}
              allDrafts={allDrafts} onLoadDraft={loadDraftToCanvas} onDeleteDraft={async (id) => { 
                if(confirm(lang === 'fr' ? 'Supprimer définitivement ce design ?' : 'حذف هذا التصميم نهائياً؟')) { 
                  await backendService.deleteDraft(id); 
                  fetchAllDrafts(); 
                } 
              }}
              isAdmin={true}
            />
            
            <section className="flex-1 bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-y-auto">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              <EditorCanvas 
                onCanvasReady={setCanvas} backgroundImage={currentBg} lang={lang} 
                onShutterClick={() => {
                  if(!canvas) return;
                  const link = document.createElement('a');
                  link.download = `preview-${Date.now()}.png`;
                  link.href = canvas.toDataURL({ multiplier: 2 });
                  link.click();
                }}
                onRotateClick={() => {
                   const idx = SCENES.findIndex(s => s.url === currentBg);
                   setCurrentBg(SCENES[(idx + 1) % SCENES.length].url);
                }}
                onGalleryClick={() => fileInputRef.current?.click()}
              />
            </section>

            <SidebarRight 
              lang={lang} eventType={activeTab?.eventType || 'custom'} 
              onOrder={() => { setCheckoutPrice(activeTab?.price || PRICE_PREMIUM_DEFAULT); setIsCheckoutOpen(true); }}
              canvas={canvas} user={user} onDraftSaved={fetchAllDrafts}
              onPriceChange={(p) => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, price: p } : t))}
              onAddPriceToCanvas={addPriceToFilter}
              onShareShop={handleShare}
              editingDraftId={editingDraftId}
            />
          </>
        ) : renderGallery()}
      </main>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && canvas) {
            const reader = new FileReader();
            reader.onload = (f) => {
              fabric.Image.fromURL(f.target?.result as string, (img) => {
                img.scaleToWidth(200);
                canvas.add(img); canvas.centerObject(img); canvas.setActiveObject(img); canvas.requestRenderAll();
              });
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
      }} />

      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title={TRANSLATIONS[lang].login}>
        <LoginForm onSubmit={handleLogin} lang={lang} isLoading={isAuthLoading} />
      </Modal>
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title={TRANSLATIONS[lang].checkoutTitle}>
        <CheckoutForm lang={lang} price={checkoutPrice} onSuccess={() => setIsCheckoutOpen(false)} />
      </Modal>
    </div>
  );
};

const LoginForm: React.FC<any> = ({ onSubmit, isLoading, lang }) => {
  const [e, setE] = useState(''); const [n, setN] = useState('');
  return (
    <div className="space-y-6">
      <div className="p-4 bg-purple-50 rounded-2xl text-center mb-4">
        <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">Espace Réservé à l'Administrateur</p>
      </div>
      <input type="text" placeholder={lang === 'fr' ? "Nom Complet" : "الاسم الكامل"} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition" onChange={x => setN(x.target.value)} />
      <input type="email" placeholder={lang === 'fr' ? "Email Admin" : "البريد الإلكتروني للأدمن"} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition" onChange={x => setE(x.target.value)} />
      <button disabled={isLoading} onClick={() => onSubmit(e, n)} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 transition active:scale-95 shadow-xl shadow-purple-500/20">
        {isLoading ? (lang === 'fr' ? 'Chargement...' : 'جاري التحميل...') : (lang === 'fr' ? 'Se connecter' : 'تسجيل الدخول')}
      </button>
    </div>
  );
};

const CheckoutForm: React.FC<any> = ({ price, onSuccess, lang }) => (
  <div className="text-center space-y-8">
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-10 rounded-[3rem] border border-purple-100 shadow-inner">
      <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em] mb-2">{lang === 'fr' ? 'Total à régler' : 'المبلغ المطلوب'}</p>
      <p className="text-6xl font-black text-purple-600 tracking-tighter">{price} <span className="text-lg font-bold">{TRANSLATIONS[lang].currency}</span></p>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <button onClick={onSuccess} className="group h-24 border-4 border-orange-500 rounded-[2rem] flex flex-col items-center justify-center gap-1 hover:bg-orange-50 transition-all active:scale-95">
        <span className="font-black text-orange-600 text-lg tracking-widest">BANKILY</span>
        <span className="text-[8px] font-bold text-orange-400 uppercase">Application BMCI</span>
      </button>
      <button onClick={onSuccess} className="group h-24 border-4 border-green-600 rounded-[2rem] flex flex-col items-center justify-center gap-1 hover:bg-green-50 transition-all active:scale-95">
        <span className="font-black text-green-700 text-lg tracking-widest">MASRIVI</span>
        <span className="text-[8px] font-bold text-green-500 uppercase">Application BAMIS</span>
      </button>
    </div>
    <div className="p-4 bg-gray-50 rounded-2xl">
       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
         {TRANSLATIONS[lang].paymentSuccess}
       </p>
    </div>
  </div>
);

export default App;
