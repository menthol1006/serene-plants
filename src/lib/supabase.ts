import { createClient } from '@supabase/supabase-js';
import { Product, ActivityLog } from '../types';
import { localStorageDB } from './localStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 配置检查:');
console.log('   Supabase URL:', supabaseUrl);
console.log('   Supabase Key:', supabaseAnonKey ? '已设置' : '未设置');

const useSupabase = !!supabaseUrl && !!supabaseAnonKey;

if (useSupabase) {
  console.log('✅ 使用 Supabase 数据库');
} else {
  console.log('⚠️  Supabase 配置不完整，使用本地存储');
}

const supabase = useSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

// 默认产品数据 - 仅在初始化时使用
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: '北欧丝绒玫瑰', category: '丝绸花卉', material: '高级丝绸 / 聚合物', supplier: '翡翠苗圃有限公司', description: '具有深红色的色调和天鹅绒般的质感。', costPrice: 45, marketPrice: 189, stock: 120, image: 'https://img0.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000', status: 'In Stock', sku: 'PE-ROSE-001' },
  { id: '2', name: '特级龟背竹叶', category: '稀有天南星科', material: '耐用聚乙烯', supplier: '热带绿植行', description: '巨大的分瓣叶片，具有极高的装饰性。', costPrice: 85, marketPrice: 245, stock: 45, image: 'https://img1.baidu.com/it/u=3489569824,2204550324&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000', status: 'In Stock', sku: 'PE-MONS-002' },
  { id: '3', name: '琴叶榕大型盆栽', category: '大型绿植', material: '涂层织物 / 环保塑料', supplier: '艺境花卉', description: '经典的室内装饰绿植，形态优美。', costPrice: 120, marketPrice: 480, stock: 8, image: 'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000', status: 'Low Stock', sku: 'PE-FIG-003' },
  { id: '4', name: '荒漠宝石多肉', category: '多肉植物', material: '环保树脂', supplier: '沙生植物培育基地', description: '仿真度极高的沙漠植物，适合干燥环境。', costPrice: 35, marketPrice: 98, stock: 200, image: 'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000', status: 'In Stock', sku: 'PE-SUCC-004' }
];

// 根据配置选择使用 Supabase 还是本地存储
export const db = useSupabase ? {
  products: {
    get: async (): Promise<Product[]> => {
      console.log('📡 db.products.get() 开始执行 (Supabase)');
      
      const { data, error } = await supabase!.from('products').select('*');
      
      if (error) {
        console.error('❌ 从 Supabase 获取产品失败:', error.message);
        throw error;
      }
      
      console.log('✅ 从 Supabase 获取产品成功:', data?.length || 0, '个');
      
      // 如果 Supabase 没有数据，初始化默认数据
      if (!data || data.length === 0) {
        console.log('ℹ️ Supabase 没有产品数据，正在初始化默认数据...');
        for (const product of DEFAULT_PRODUCTS) {
          await supabase!.from('products').upsert(product);
        }
        return DEFAULT_PRODUCTS;
      }
      
      return data;
    },
    
    save: async (product: Product) => {
      console.log('💾 db.products.save() 开始执行 (Supabase)');
      console.log('   产品数据:', JSON.stringify(product, null, 2));
      
      const { data, error } = await supabase!.from('products').upsert(product).select();
      
      if (error) {
        console.error('❌ 保存到 Supabase 失败:', error.message);
        throw error;
      }
      
      console.log('✅ 产品保存到 Supabase 成功');
      return data;
    },
    
    delete: async (id: string) => {
      console.log('🗑️ db.products.delete() 开始执行 (Supabase)');
      
      const { error } = await supabase!.from('products').delete().eq('id', id);
      
      if (error) {
        console.error('❌ 从 Supabase 删除失败:', error.message);
        throw error;
      }
      
      console.log('✅ 产品从 Supabase 删除成功');
    },
    
    subscribe: (callback: (products: Product[]) => void) => {
      console.log('📡 db.products.subscribe() 开始执行 (Supabase)');
      
      // 立即提供初始数据
      db.products.get().then(products => {
        console.log('📡 提供初始产品数据:', products.length, '个');
        callback(products);
      });
      
      const channel = supabase!
        .channel('products-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, async () => {
          console.log('📡 products 实时变更收到');
          const products = await db.products.get();
          callback(products);
        })
        .subscribe();
      
      console.log('✅ db.products.subscribe() 订阅成功');
      
      return () => {
        supabase!.removeChannel(channel);
      };
    }
  },
  
  activities: {
    get: async (): Promise<ActivityLog[]> => {
      const { data, error } = await supabase!
        .from('activities')
        .select('*')
        .order('time', { ascending: false });
      
      if (error) {
        console.error('❌ 从 Supabase 获取活动失败:', error.message);
        throw error;
      }
      
      return data || [];
    },
    
    add: async (activity: ActivityLog) => {
      const { error } = await supabase!.from('activities').insert(activity);
      
      if (error) {
        console.error('❌ 添加活动到 Supabase 失败:', error.message);
        throw error;
      }
    },
    
    subscribe: (callback: (activities: ActivityLog[]) => void) => {
      console.log('📡 db.activities.subscribe() 开始执行 (Supabase)');
      
      // 立即提供初始数据
      db.activities.get().then(activities => {
        console.log('📡 提供初始活动数据:', activities.length, '条');
        callback(activities);
      });
      
      const channel = supabase!
        .channel('activities-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'activities'
        }, async () => {
          console.log('📡 activities 实时变更收到');
          const activities = await db.activities.get();
          callback(activities);
        })
        .subscribe();
      
      console.log('✅ db.activities.subscribe() 订阅成功');
      
      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }
} : {
  // 使用本地存储作为备用方案
  products: localStorageDB.products,
  activities: localStorageDB.activities
};
