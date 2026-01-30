
import React, { useState, useRef } from 'react';
import { PotteryEntry, CraftMode, Material } from '../types';
import { CRAFT_CONFIG } from '../constants';

interface UploadModalProps {
  mode: CraftMode;
  image: string;
  initialData?: PotteryEntry;
  availableMaterials: Material[];
  onConfirm: (data: any) => void;
  onCancel: () => void;
  onQuickAddMaterial: (data: { type: string; name: string; brand: string }) => Material | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ mode, image, initialData, availableMaterials, onConfirm, onCancel, onQuickAddMaterial }) => {
  const config = CRAFT_CONFIG[mode];
  const [images, setImages] = useState<string[]>(initialData?.images || [image]);
  const [stage, setStage] = useState<string>(initialData?.stage || config.stages[0].value);
  const [title, setTitle] = useState(initialData?.title || '');
  const [memo, setMemo] = useState(initialData?.memo || '');
  const [quickAddInputs, setQuickAddInputs] = useState<Record<string, { name: string; brand: string }>>({});
  
  // 动态材料管理
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, Material[]>>(
    initialData?.materialDetails || {}
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = (overrideStage?: string) => {
    const finalStage = overrideStage || stage;
    onConfirm({
      stage: finalStage,
      title: title || (finalStage === '灵感' ? '未命名灵感' : `${finalStage}记录`),
      memo,
      images,
      materialDetails: selectedMaterials
    });
  };

  const toggleMaterialSelection = (typeId: string, mat: Material) => {
    const current = selectedMaterials[typeId] || [];
    const exists = current.find(m => m.id === mat.id);
    const next = exists ? current.filter(m => m.id !== mat.id) : [...current, mat];
    setSelectedMaterials(prev => ({ ...prev, [typeId]: next }));
  };

  const handleQuickAdd = (typeId: string) => {
    const input = quickAddInputs[typeId];
    if (!input?.name?.trim()) return;
    const created = onQuickAddMaterial({ type: typeId, name: input.name.trim(), brand: (input.brand || '').trim() });
    if (created) {
      setSelectedMaterials(prev => {
        const current = prev[typeId] || [];
        return { ...prev, [typeId]: [...current, created] };
      });
      setQuickAddInputs(prev => ({ ...prev, [typeId]: { name: '', brand: '' } }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-stone-900/60 backdrop-blur-sm overflow-y-auto items-start p-4">
      <div className="bg-warm-surface w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="sticky top-0 z-30 bg-warm-surface/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-text">
            {stage === '灵感' ? '灵感卡片' : stage === '放弃' ? '废弃卡片' : '作品卡片'}
          </h2>
          <button onClick={onCancel} className="material-symbols-outlined text-stone-muted size-10 rounded-full flex items-center justify-center bg-stone-100">close</button>
        </div>

        <div className="p-6">
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {images.map((img, idx) => (
              <div key={idx} className="relative shrink-0 w-28 aspect-square rounded-2xl overflow-hidden border border-stone-200">
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-28 aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-300"><span className="material-symbols-outlined">add_a_photo</span></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const reader = new FileReader();
                 reader.onloadend = () => setImages([...images, reader.result as string]);
                 reader.readAsDataURL(file);
               }
            }} />
          </div>

          <div className="space-y-6 mt-6">
            <div>
              <label className="text-xs font-bold text-stone-muted uppercase tracking-widest mb-3 block">当前阶段</label>
              <div className="grid grid-cols-3 gap-2">
                {config.stages.map(s => (
                  <button key={s.value} onClick={() => setStage(s.value)} className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${stage === s.value ? 'border-terracotta bg-terracotta text-white' : 'border-stone-100 bg-stone-50 text-stone-muted'}`}>
                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                    <span className="text-[10px] font-bold">{s.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="名称..." className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none text-sm font-medium" />

            {stage !== '灵感' && stage !== '放弃' && config.materialTypes.map(mType => (
              <div key={mType.id}>
                <label className="text-xs font-bold text-stone-muted uppercase tracking-widest mb-2 block">{mType.label}</label>
                <div className="flex flex-wrap gap-2">
                  {availableMaterials.filter(m => m.type === mType.id).map(mat => (
                    <button 
                      key={mat.id} 
                      onClick={() => toggleMaterialSelection(mType.id, mat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${selectedMaterials[mType.id]?.find(m => m.id === mat.id) ? 'bg-terracotta border-terracotta text-white' : 'bg-white border-stone-200 text-stone-400'}`}
                    >
                      {mat.name}
                    </button>
                  ))}
                  {availableMaterials.filter(m => m.type === mType.id).length === 0 && <p className="text-[10px] text-stone-300 italic font-medium">仓库中暂无此类材料</p>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={quickAddInputs[mType.id]?.name || ''}
                    onChange={e => setQuickAddInputs(prev => ({ ...prev, [mType.id]: { ...(prev[mType.id] || {}), name: e.target.value } }))}
                    placeholder="材料名称"
                    className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-medium"
                  />
                  <input
                    value={quickAddInputs[mType.id]?.brand || ''}
                    onChange={e => setQuickAddInputs(prev => ({ ...prev, [mType.id]: { ...(prev[mType.id] || {}), brand: e.target.value } }))}
                    placeholder="品牌/来源"
                    className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-medium"
                  />
                  <button
                    onClick={() => handleQuickAdd(mType.id)}
                    className="shrink-0 px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs font-bold active:scale-95 transition-transform"
                  >
                    保存
                  </button>
                </div>
              </div>
            ))}

            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="记录细节..." className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-none text-sm font-medium min-h-[100px]" />
          </div>

          <div className="flex gap-3 mt-10 mb-6">
            <button 
              onClick={() => handleConfirm('放弃')} 
              className="flex-1 py-5 text-sm font-bold text-red-400 border border-red-100 rounded-2xl active:scale-95 transition-transform"
            >
              废弃项目
            </button>
            <button 
              onClick={() => handleConfirm()} 
              className="flex-[2] py-5 text-sm font-bold text-white bg-stone-800 rounded-2xl active:scale-95 transition-transform"
            >
              保存卡片
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
