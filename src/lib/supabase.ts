import { createClient } from '@supabase/supabase-js';
import { ActivityLog, LandscapeShowcaseConfig, Product } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const withRetry = async <T>(
  fn: () => PromiseLike<T>,
  retries = 3,
  delay = 1000,
): Promise<T> => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((resolve) => window.setTimeout(resolve, delay * 2 ** attempt));
    }
  }

  throw new Error('Retry limit reached');
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '北欧丝绒玫瑰',
    category: '副造景',
    material: '高级丝绸 / 聚合物',
    supplier: '翡翠苗圃有限公司',
    description: '具有深红色的色调和天鹅绒般的质感。',
    costPrice: 45,
    marketPrice: 189,
    stock: 120,
    image: 'https://picsum.photos/seed/rose/800/1000',
    status: 'In Stock',
    sku: 'PE-ROSE-001',
  },
  {
    id: '2',
    name: '特级龟背竹叶',
    category: '副造景',
    material: '耐用聚乙烯',
    supplier: '热带绿植行',
    description: '巨大的分瓣叶片，具有极高的装饰性。',
    costPrice: 85,
    marketPrice: 245,
    stock: 45,
    image: 'https://picsum.photos/seed/monstera/800/1000',
    status: 'In Stock',
    sku: 'PE-MONS-002',
  },
  {
    id: '3',
    name: '琴叶榕大型盆栽',
    category: '主造景',
    material: '涂层织物 / 环保塑料',
    supplier: '艺境花卉',
    description: '经典的室内装饰绿植，形态优美。',
    costPrice: 120,
    marketPrice: 480,
    stock: 8,
    image: 'https://picsum.photos/seed/fiddle/800/1000',
    status: 'Low Stock',
    sku: 'PE-FIG-003',
  },
  {
    id: '4',
    name: '荒漠宝石多肉',
    category: '小型植物',
    material: '环保树脂',
    supplier: '沙生植物培育基地',
    description: '仿真度极高的沙漠植物，适合干燥环境。',
    costPrice: 35,
    marketPrice: 98,
    stock: 200,
    image: 'https://picsum.photos/seed/succulent/800/1000',
    status: 'In Stock',
    sku: 'PE-SUCC-004',
  },
];

const LANDSCAPE_STORAGE_KEY = 'serene_landscape_showcases';

const getLocalLandscapeShowcases = (): LandscapeShowcaseConfig[] => {
  const stored = localStorage.getItem(LANDSCAPE_STORAGE_KEY);
  if (!stored) {
    const legacyStored = localStorage.getItem('serene_landscape_showcase');
    if (!legacyStored) return [];
    const legacyConfig = JSON.parse(legacyStored) as LandscapeShowcaseConfig;
    return legacyConfig ? [legacyConfig] : [];
  }

  const parsed = JSON.parse(stored) as LandscapeShowcaseConfig[] | LandscapeShowcaseConfig;
  return Array.isArray(parsed) ? parsed : [parsed];
};

const setLocalLandscapeShowcases = (configs: LandscapeShowcaseConfig[]) => {
  localStorage.setItem(LANDSCAPE_STORAGE_KEY, JSON.stringify(configs));
};

export const db = {
  products: {
    async get(): Promise<Product[]> {
      const { data, error } = await withRetry(() =>
        supabase.from('products').select('*').order('name', { ascending: true }),
      );

      if (error) throw error;

      if (!data || data.length === 0) {
        for (const product of DEFAULT_PRODUCTS) {
          await withRetry(() => supabase.from('products').upsert(product));
        }

        return DEFAULT_PRODUCTS;
      }

      return data as Product[];
    },

    async save(product: Product): Promise<Product[]> {
      const { data, error } = await withRetry(() =>
        supabase.from('products').upsert(product).select(),
      );

      if (error) throw error;
      return (data || []) as Product[];
    },

    async delete(id: string): Promise<void> {
      const { error } = await withRetry(() =>
        supabase.from('products').delete().eq('id', id),
      );

      if (error) throw error;
    },

    async subscribe(callback: (products: Product[]) => void) {
      callback(await db.products.get());

      const channel = supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          async () => callback(await db.products.get()),
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    },
  },

  activities: {
    async get(): Promise<ActivityLog[]> {
      const { data, error } = await withRetry(() =>
        supabase.from('activities').select('*').order('time', { ascending: false }),
      );

      if (error) throw error;
      return (data || []) as ActivityLog[];
    },

    async add(activity: ActivityLog): Promise<void> {
      const { error } = await withRetry(() => supabase.from('activities').insert(activity));
      if (error) throw error;
    },

    async subscribe(callback: (activities: ActivityLog[]) => void) {
      callback(await db.activities.get());

      const channel = supabase
        .channel('activities-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activities' },
          async () => callback(await db.activities.get()),
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    },
  },

  landscapeShowcase: {
    async getAll(): Promise<LandscapeShowcaseConfig[]> {
      try {
        const { data, error } = await withRetry(() =>
          supabase
            .from('landscape_showcases')
            .select('*')
            .order('updatedAt', { ascending: false }),
        );

        if (error) throw error;
        return (data || []) as LandscapeShowcaseConfig[];
      } catch (error) {
        console.warn('Falling back to local landscape showcase configs:', error);
        return getLocalLandscapeShowcases();
      }
    },

    async save(config: LandscapeShowcaseConfig): Promise<void> {
      const localConfigs = getLocalLandscapeShowcases();
      const nextLocalConfigs = [
        config,
        ...localConfigs.filter((existingConfig) => existingConfig.id !== config.id),
      ];
      setLocalLandscapeShowcases(nextLocalConfigs);

      try {
        const { error } = await withRetry(() =>
          supabase.from('landscape_showcases').upsert(config),
        );

        if (error) throw error;
      } catch (error) {
        console.warn('Saved landscape showcase locally because Supabase table is unavailable:', error);
      }
    },

    async delete(id: string): Promise<void> {
      setLocalLandscapeShowcases(getLocalLandscapeShowcases().filter((config) => config.id !== id));

      try {
        const { error } = await withRetry(() =>
          supabase.from('landscape_showcases').delete().eq('id', id),
        );

        if (error) throw error;
      } catch (error) {
        console.warn('Deleted landscape showcase locally because Supabase table is unavailable:', error);
      }
    },

    async subscribe(callback: (configs: LandscapeShowcaseConfig[]) => void) {
      callback(await db.landscapeShowcase.getAll());

      const channel = supabase
        .channel('landscape-showcase-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'landscape_showcases' },
          async () => callback(await db.landscapeShowcase.getAll()),
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    },
  },
};
