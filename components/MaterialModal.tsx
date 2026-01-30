
import React, { useState, useRef } from 'react';
import { Material, CraftMode } from '../types';
import { CRAFT_CONFIG } from '../constants';

interface MaterialModalProps {
  mode: CraftMode;
  initialData?: Material;
  onConfirm: (data: Omit<Material, 'id'>) => void;
  onCancel: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ mode, initialData, onConfirm, onCancel }) => {
  const config = CRAFT_CONFIG[mode];
  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [type, setType] = useState<string>(initialData?.type || config.materialTypes[0].id);
  const [memo, setMemo] = useState(initialData?.memo || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (!name) return;
    onConfirm({ name, brand, type, memo, images });
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-center bg-stone-900/60 backdrop-blur-sm overflow-y-auto items-start p-4">
      <div className="bg-warm-surface w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="sticky top-0 z-30 bg-warm-surface/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-text">材料卡片</h2>
          <button onClick={onCancel} className="material-symbols-outlined text-stone-muted size-10 rounded-full flex items-center justify-center bg-stone-100">close</button>
        </div>

        <div className="p-6">
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar mb-6">
            {images.map((img, idx) => (
              <div key={idx} className="relative shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border border-stone-200">
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-24 aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-300"><span className="material-symbols-outlined">add_a_photo</span></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImages([...images, reader.result as string]);
                reader.readAsDataURL(file);
              }
            }} />
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-stone-muted uppercase tracking-widest mb-3 block">材料类型</label>
              <div className="grid grid-cols-2 gap-2">
                {config.materialTypes.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} className={`flex items-center gap-2 py-3 px-4 rounded-2xl border transition-all text-xs font-bold ${type === t.id ? 'bg-terracotta border-terracotta text-white' : 'bg-stone-50 border-stone-100 text-stone-400'}`}>
                    <span className="material-symbols-outlined text-base">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <input value={name} onChange={e => setName(e.target.value)} placeholder="名称..." className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none text-sm font-medium" />
            <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="品牌/来源..." className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none text-sm font-medium" />
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="备注细节..." className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none text-sm font-medium min-h-[100px]" />
          </div>

          <button onClick={handleConfirm} className="w-full mt-10 mb-6 py-5 text-sm font-bold text-white bg-stone-800 rounded-2xl active:scale-95">加入仓库</button>
        </div>
      </div>
    </div>
  );
};

export default MaterialModal;
