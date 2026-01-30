
import { CraftMode } from './types';

export interface ModeConfig {
  stages: { value: string; icon: string }[];
  materialTypes: { id: string; label: string; icon: string }[];
}

export const CRAFT_CONFIG: Record<CraftMode, ModeConfig> = {
  [CraftMode.POTTERY]: {
    stages: [
      { value: '灵感', icon: 'lightbulb' },
      { value: '泥坯', icon: 'texture' },
      { value: '素坯', icon: 'oven' },
      { value: '上釉中', icon: 'format_paint' },
      { value: '成品', icon: 'stars' },
      { value: '放弃', icon: 'delete_outline' },
    ],
    materialTypes: [
      { id: 'clay', label: '泥料', icon: 'texture' },
      { id: 'glaze', label: '釉料', icon: 'format_paint' },
      { id: 'slip', label: '化妆土', icon: 'format_color_fill' },
      { id: 'color', label: '颜色/色粉', icon: 'palette' },
    ]
  },
  [CraftMode.WOODWORK]: {
    stages: [
      { value: '灵感', icon: 'lightbulb' },
      { value: '设计·结构', icon: 'architecture' },
      { value: '组装中', icon: 'handyman' },
      { value: '表面处理', icon: 'imagesearch_roller' },
      { value: '成品', icon: 'stars' },
      { value: '放弃', icon: 'delete_outline' },
    ],
    materialTypes: [
      { id: 'wood', label: '木材', icon: 'forest' },
      { id: 'hardware', label: '五金', icon: 'nut' },
      { id: 'finish', label: '表面处理', icon: 'brush' },
      { id: 'other', label: '其他', icon: 'category' },
    ]
  },
  [CraftMode.METALWORK]: {
    stages: [
      { value: '灵感', icon: 'lightbulb' },
      { value: '设计·版型', icon: 'straighten' },
      { value: '成型中', icon: 'hardware' },
      { value: '组合', icon: 'join_inner' },
      { value: '表面处理', icon: 'auto_fix_high' },
      { value: '成品', icon: 'stars' },
      { value: '放弃', icon: 'delete_outline' },
    ],
    materialTypes: [
      { id: 'metal', label: '金属材料', icon: 'layers' },
      { id: 'solder', label: '焊料·助焊剂', icon: 'mode_fan' },
      { id: 'finish', label: '表面处理', icon: 'blur_on' },
      { id: 'decoration', label: '宝石·装饰', icon: 'diamond' },
      { id: 'other', label: '其他', icon: 'category' },
    ]
  },
  [CraftMode.WEAVING]: {
    stages: [
      { value: '灵感', icon: 'lightbulb' },
      { value: '配色·试样', icon: 'palette' },
      { value: '编织中', icon: 'waves' },
      { value: '成型', icon: 'checkroom' },
      { value: '整理·定型', icon: 'iron' },
      { value: '成品', icon: 'stars' },
      { value: '放弃', icon: 'delete_outline' },
    ],
    materialTypes: [
      { id: 'yarn', label: '线材·纱线', icon: 'gesture' },
      { id: 'fabric', label: '布料', icon: 'texture' },
      { id: 'dye', label: '染料', icon: 'colorize' },
      { id: 'accessory', label: '辅料', icon: 'extension' },
      { id: 'other', label: '其他', icon: 'category' },
    ]
  },
  [CraftMode.GLASS]: {
    stages: [
      { value: '灵感', icon: 'lightbulb' },
      { value: '备料', icon: 'inventory' },
      { value: '成型中', icon: 'mode_heat' },
      { value: '冷却·退火', icon: 'ac_unit' },
      { value: '后处理', icon: 'grid_view' },
      { value: '成品', icon: 'stars' },
      { value: '放弃', icon: 'delete_outline' },
    ],
    materialTypes: [
      { id: 'glass', label: '玻璃材料', icon: 'window' },
      { id: 'color', label: '颜色料', icon: 'invert_colors' },
      { id: 'mold', label: '模具·支撑', icon: 'rebase_edit' },
      { id: 'coldwork', label: '冷加工材料', icon: 'shutter_speed' },
      { id: 'other', label: '其他', icon: 'category' },
    ]
  },
  [CraftMode.LEATHER]: {
    stages: [
      { value: '灵感', icon: 'lightbulb' },
      { value: '裁切', icon: 'content_cut' },
      { value: '缝制·组装', icon: 'edit_note' },
      { value: '边油·整理', icon: 'ink_eraser' },
      { value: '成品', icon: 'stars' },
      { value: '放弃', icon: 'delete_outline' },
    ],
    materialTypes: [
      { id: 'leather', label: '皮料', icon: 'reorder' },
      { id: 'thread', label: '线材', icon: 'vaping_rooms' },
      { id: 'hardware', label: '五金', icon: 'settings' },
      { id: 'auxiliary', label: '辅助材料', icon: 'format_color_fill' },
      { id: 'other', label: '其他', icon: 'category' },
    ]
  }
};

export const STAGE_COLORS: Record<string, string> = {
  '灵感': 'text-blue-500',
  '成品': 'text-terracotta',
  '放弃': 'text-stone-400',
};

export const getStageColor = (stage: string) => STAGE_COLORS[stage] || 'text-indigo-500';
