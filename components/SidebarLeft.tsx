
import React, { useState, useRef } from 'react';
import { fabric } from 'fabric';
import { Language, FilterDraft } from '../types';
import { TRANSLATIONS } from '../constants';

const STICKERS = [
  { id: 'heart', icon: '❤', color: '#ff4d4d' },
  { id: 'star', icon: '⭐', color: '#ffcc00' },
  { id: 'crown', icon: '👑', color: '#ffd700' },
  { id: 'flower', icon: '🌸', color: '#ff9ff3' },
  { id: 'gold_ring', icon: '💍', color: '#f1c40f' },
  { id: 'cake', icon: '🎂', color: '#ff6b6b' },
  { id: 'star2', icon: '✨', color: '#ffffff' },
  { id: 'palme', icon: '🌴', color: '#2ecc71' },
  { id: 'moon', icon: '🌙', color: '#f1c40f' },
  { id: 'lantern', icon: '🏮', color: '#e67e22' }
];

interface SidebarLeftProps {
  lang: Language;
  canvas: fabric.Canvas | null;
  eventType: string;
  setEventType: (v: string) => void;
  onAiAsk: () => void;
  aiLoading: boolean;
  aiSuggestions: any[];
  onAddAiText: (t: string) => void;
  selectedObject: fabric.Object | null;
  onDelete: () => void;
  onReset: () => void;
  currentBg: string;
  onBgChange: (url: string) => void;
  scenes: { id: string, url: string, label: string }[];
  allDrafts: FilterDraft[];
  onLoadDraft: (d: FilterDraft) => void;
  onDeleteDraft: (id: string) => void;
  isAdmin: boolean;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ 
  lang, canvas, onAiAsk, aiLoading, aiSuggestions, onAddAiText, onDelete, onReset,
  currentBg, onBgChange, scenes, allDrafts, onLoadDraft, onDeleteDraft, isAdmin
}) => {
  const t = TRANSLATIONS[lang];
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'stickers' | 'assets' | 'designs' | 'scene'>('text');
  const assetInputRef = useRef<HTMLInputElement>(null);

  const addSticker = (sticker: typeof STICKERS[0]) => {
    if (!canvas) return;
    const txt = new fabric.IText(sticker.icon, {
      left: 170, top: 300, fontSize: 80, originX: 'center', fill: sticker.color,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10 })
    });
    canvas.add(txt); canvas.setActiveObject(txt); canvas.requestRenderAll();
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target?.result as string, (img) => {
          img.scaleToWidth(120);
          canvas.add(img); canvas.centerObject(img); canvas.setActiveObject(img); canvas.requestRenderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = isAdmin 
    ? (['text', 'stickers', 'assets', 'designs', 'scene'] as const)
    : (['text', 'stickers', 'scene'] as const);

  return (
    <aside className="w-80 bg-[#0d0d0d] border-r rtl:border-r-0 rtl:border-l border-white/5 flex flex-col z-20">
      <div className="flex border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-5 px-3 text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-purple-500 bg-white/5 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab === 'designs' ? t.myLibrary : tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === 'text' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{t.text}</label>
              <div className="flex gap-2">
                <input 
                  type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                  placeholder={t.textPlaceholder}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:border-purple-500 outline-none transition"
                />
                <button onClick={() => { if(textInput) onAddAiText(textInput); setTextInput(''); }} className="w-14 bg-purple-600 rounded-2xl hover:scale-105 transition shadow-lg">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            
            <button onClick={onAiAsk} disabled={aiLoading} className="w-full py-5 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/30 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3">
              {aiLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-sparkles text-purple-400"></i>}
              {t.aiSuggest}
            </button>

            <div className="space-y-3">
              {aiSuggestions.map((s, i) => (
                <button key={i} onClick={() => onAddAiText(s.text)} className="w-full p-5 bg-black/40 border border-white/5 rounded-2xl text-left rtl:text-right hover:border-purple-500/50 transition-all group">
                  <p className="text-[13px] font-semibold text-white group-hover:text-purple-400 transition">"{s.text}"</p>
                  <span className="text-[8px] text-gray-600 uppercase font-black mt-1.5 block">{s.style}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="grid grid-cols-2 gap-4">
            {STICKERS.map(s => (
              <button key={s.id} onClick={() => addSticker(s)} className="aspect-square bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center text-4xl hover:border-purple-500/50 transition">
                {s.icon}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'designs' && isAdmin && (
          <div className="space-y-4">
            {allDrafts.map(draft => (
              <div key={draft.id} className="group relative bg-black/40 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/50 transition">
                <img src={draft.previewUrl} className="w-full aspect-[16/9] object-cover opacity-60 group-hover:opacity-100 transition" />
                <div className="p-4 flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest">{draft.name}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onLoadDraft(draft)} className="flex-1 py-3 bg-white text-black text-[9px] font-black rounded-xl hover:bg-purple-600 hover:text-white transition">
                      {t.loadDraft}
                    </button>
                    <button onClick={() => onDeleteDraft(draft.id)} className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition">
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {allDrafts.length === 0 && <p className="text-center py-10 text-[10px] text-gray-600 uppercase font-black">{t.noDrafts}</p>}
          </div>
        )}

        {activeTab === 'assets' && isAdmin && (
          <div className="space-y-6 text-center">
            <input type="file" ref={assetInputRef} className="hidden" accept="image/*" onChange={handleAssetUpload} />
            <button onClick={() => assetInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 hover:border-purple-500 transition-all bg-black/20">
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-700"></i>
              <span className="text-[10px] font-black uppercase text-gray-500">{t.upload}</span>
            </button>
          </div>
        )}

        {activeTab === 'scene' && (
          <div className="space-y-4">
            {scenes.map(s => (
              <button key={s.id} onClick={() => onBgChange(s.url)} className={`w-full aspect-[2/1] rounded-[2rem] border-2 overflow-hidden transition ${currentBg === s.url ? 'border-purple-500' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                {s.url ? <img src={s.url} className="w-full h-full object-cover" /> : <div className="bg-black w-full h-full flex items-center justify-center text-xs">{lang === 'fr' ? 'SANS DÉCOR' : 'بدون خلفية'}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-black/40 space-y-3">
        <button onClick={onDelete} className="w-full py-4 bg-orange-500/10 text-orange-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition shadow-lg">
           <i className="fa-solid fa-eraser mr-2"></i> {lang === 'fr' ? 'Supprimer Sélection' : 'حذف المحدد'}
        </button>
        <button onClick={onReset} className="w-full py-4 bg-red-600/10 text-red-600 border border-red-600/20 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition shadow-lg">
           <i className="fa-solid fa-trash-arrow-up mr-2"></i> {lang === 'fr' ? 'VIDER CANVAS' : 'إفراغ اللوحة'}
        </button>
      </div>
    </aside>
  );
};

export default SidebarLeft;
