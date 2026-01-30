
export enum CraftMode {
  POTTERY = '陶艺',
  WOODWORK = '木作',
  METALWORK = '金工',
  WEAVING = '编织',
  GLASS = '玻璃',
  LEATHER = '皮具'
}

export interface Material {
  id: string;
  name: string;
  brand: string;
  type: string; // 动态类型，如 'wood', 'metal', 'leather' 等
  images: string[];
  memo?: string;
}

export interface PotteryEntry {
  id: string;
  title: string;
  images: string[];
  stage: string; // 动态阶段
  timestamp: number;
  memo?: string;
  // 材料现在以类型 key 动态存储或统一归类
  materialDetails?: Record<string, Material[]>; 
  aiInsights?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}
 
export type View = 'home' | 'inspirations' | 'materials' | 'search' | 'profile';
