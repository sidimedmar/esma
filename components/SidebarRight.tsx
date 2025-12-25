
import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Language, User } from '../types';
import { TRANSLATIONS, PRICE_PREMIUM_DEFAULT } from '../constants';
import { backendService } from '../services/storageService';

interface SidebarRightProps {
  lang: Language;
  eventType: string;
  onOrder: () => void;
  canvas: fabric.Canvas | null;
  user: User | null;
  onDraftSaved?: () => void;
  onPriceChange?: (price: number) => void;
  onAddPriceToCanvas?: () => void;
  onShareShop?: () => void;
  editingDraftId?: string | null;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ 
  lang, eventType, onOrder, canvas, user, onDraftSaved, onPriceChange, onAddPriceToCanvas, onShareShop, editingDraftId 
}) => {
  const t = TRANSLATIONS[lang];
  const [localPrice, setLocalPrice] = useState(PRICE_PREMIUM_DEFAULT);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!canvas || !user?.isAdmin) return alert("Action réservée à l'admin.");
    setIsSaving(true);
    try {
      const json = JSON.stringify(canvas.toJSON());
      canvas.discardActiveObject();
      canvas.renderAll();
      const preview = canvas.toDataURL({ multiplier: 0.6 });
      
      const payload = {
        name: `Filtre ${eventType.toUpperCase()}`,
        eventType,
        canvasJson: json,
        previewUrl: preview,
        price: localPrice
      };

      if (editingDraftId) {
        // Mise à jour si on est en mode édition
        await backendService.deleteDraft(editingDraftId);
      }
      
      await backendService.saveDraft(user.id, payload as any);
      
      onDraftSaved?.();
      alert(lang === 'fr' ? "Filtre mis à jour dans la boutique !" : "تم تحديث الفلتر في المتجر!");
    } finally { setIsSaving(false); }
  };

  return (
    <aside className="w-80 bg-gray-950 border-l border-white/5 flex flex-col p-8 space-y-8">
      {user?.isAdmin && (
        <>
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[3rem] shadow-2xl text-center">
            <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">{t.adminPrice}</span>
            <div className="flex items-center justify-center gap-3 mt-4">
              <input 
                type="number" value={localPrice} 
                onChange={e => { const p = parseInt(e.target.value); setLocalPrice(p); onPriceChange?.(p); }}
                className="w-full bg-transparent border-b-2 border-white/30 text-4xl font-black text-center outline-none focus:border-white transition-all"
              />
            </div>
            <button 
              onClick={onAddPriceToCanvas}
              className="mt-6 w-full py-4 bg-white text-purple-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition"
            >
              Afficher Prix sur Filtre
            </button>
          </div>

          <div className="space-y-4">
            <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-white/5 border-2 border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-purple-500 transition duration-300">
              {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up mr-2"></i>}
              {editingDraftId ? t.updateDraft : t.saveDraft}
            </button>

            <button onClick={onShareShop} className="w-full py-6 bg-purple-600/10 border-2 border-purple-600/30 text-purple-400 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition group">
              <i className="fa-solid fa-share-nodes mr-2 group-hover:rotate-12 transition"></i>
              {lang === 'fr' ? 'PARTAGER MA BOUTIQUE' : 'مشاركة متجري'}
            </button>
          </div>
        </>
      )}

      {!user?.isAdmin && (
        <div className="p-8 bg-gray-900 rounded-[2.5rem] border border-white/5 text-center space-y-4">
           <i className="fa-solid fa-lock text-gray-700 text-3xl"></i>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
             Mode Aperçu Client.<br/>Connectez-vous en Admin pour gérer.
           </p>
        </div>
      )}

      <div className="mt-auto pt-8 border-t border-white/5">
        <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <i className="fa-solid fa-shield-halved"></i> Paiement 100% Sécurisé
        </p>
      </div>
    </aside>
  );
};

export default SidebarRight;
