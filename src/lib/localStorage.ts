// 完全本地化的数据存储层 - 不需要任何外部服务
import { Product, ActivityLog } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'serene_products',
  ACTIVITIES: 'serene_activities'
};

// 默认产品数据
const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: '北欧丝绒玫瑰', category: '丝绸花卉', material: '高级丝绸 / 聚合物', supplier: '翡翠苗圃有限公司', description: '具有深红色的色调和天鹅绒般的质感。', costPrice: 45, marketPrice: 189, stock: 120, image: 'https://picsum.photos/seed/rose/800/1000', status: 'In Stock', sku: 'PE-ROSE-001' },
  { id: '2', name: '特级龟背竹叶', category: '稀有天南星科', material: '耐用聚乙烯', supplier: '热带绿植行', description: '巨大的分瓣叶片，具有极高的装饰性。', costPrice: 85, marketPrice: 245, stock: 45, image: 'https://picsum.photos/seed/monstera/800/1000', status: 'In Stock', sku: 'PE-MONS-002' },
  { id: '3', name: '琴叶榕大型盆栽', category: '大型绿植', material: '涂层织物 / 环保塑料', supplier: '艺境花卉', description: '经典的室内装饰绿植，形态优美。', costPrice: 120, marketPrice: 480, stock: 8, image: 'https://picsum.photos/seed/fiddle/800/1000', status: 'Low Stock', sku: 'PE-FIG-003' },
  { id: '4', name: '荒漠宝石多肉', category: '多肉植物', material: '环保树脂', supplier: '沙生植物培育基地', description: '仿真度极高的沙漠植物，适合干燥环境。', costPrice: 35, marketPrice: 98, stock: 200, image: 'https://picsum.photos/seed/succulent/800/1000', status: 'In Stock', sku: 'PE-SUCC-004' }
];

const DEFAULT_ACTIVITIES: ActivityLog[] = [
  { id: '1', productName: '系统初始化', action: '添加了示例数据', amount: '+ 4 个产品', time: new Date().toISOString(), type: 'inventory' }
];

// 本地存储辅助函数
const getLocalProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('读取本地产品数据失败:', e);
  }
  return DEFAULT_PRODUCTS;
};

const setLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('保存本地产品数据失败:', e);
  }
};

const getLocalActivities = (): ActivityLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('读取本地活动数据失败:', e);
  }
  return DEFAULT_ACTIVITIES;
};

const setLocalActivities = (activities: ActivityLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('保存本地活动数据失败:', e);
  }
};

// 简单的事件发布订阅系统 - 用于模拟实时更新
type Listener<T> = (data: T) => void;
const productListeners: Listener<Product[]>[] = [];
const activityListeners: Listener<ActivityLog[]>[] = [];

const notifyProductListeners = () => {
  const products = getLocalProducts();
  productListeners.forEach(listener => listener(products));
};

const notifyActivityListeners = () => {
  const activities = getLocalActivities();
  activityListeners.forEach(listener => listener(activities));
};

export const localStorageDB = {
  products: {
    get: async (): Promise<Product[]> => {
      console.log('📡 读取本地产品数据');
      return getLocalProducts();
    },
    
    save: async (product: Product) => {
      console.log('💾 保存产品到本地:', product.name);
      const localProducts = getLocalProducts();
      const existingIndex = localProducts.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        localProducts[existingIndex] = product;
      } else {
        localProducts.push(product);
      }
      
      setLocalProducts(localProducts);
      notifyProductListeners();
      console.log('✅ 产品保存成功');
    },
    
    delete: async (id: string) => {
      console.log('🗑️ 从本地删除产品 ID:', id);
      const localProducts = getLocalProducts();
      const filteredProducts = localProducts.filter(p => p.id !== id);
      setLocalProducts(filteredProducts);
      notifyProductListeners();
      console.log('✅ 产品删除成功');
    },
    
    subscribe: (callback: (products: Product[]) => void) => {
      console.log('📡 订阅产品数据');
      // 立即提供初始数据
      callback(getLocalProducts());
      productListeners.push(callback);
      
      return () => {
        const index = productListeners.indexOf(callback);
        if (index > -1) {
          productListeners.splice(index, 1);
        }
      };
    }
  },
  
  activities: {
    get: async (): Promise<ActivityLog[]> => {
      console.log('📡 读取本地活动数据');
      return getLocalActivities();
    },
    
    add: async (activity: ActivityLog) => {
      console.log('💾 添加活动到本地:', activity.action);
      const localActivities = getLocalActivities();
      localActivities.unshift(activity);
      setLocalActivities(localActivities);
      notifyActivityListeners();
    },
    
    subscribe: (callback: (activities: ActivityLog[]) => void) => {
      console.log('📡 订阅活动数据');
      // 立即提供初始数据
      callback(getLocalActivities());
      activityListeners.push(callback);
      
      return () => {
        const index = activityListeners.indexOf(callback);
        if (index > -1) {
          activityListeners.splice(index, 1);
        }
      };
    }
  },
  
  // 数据导出
  exportData: () => {
    const data = {
      products: getLocalProducts(),
      activities: getLocalActivities(),
      exportTime: new Date().toISOString()
    };
    return data;
  },
  
  // 数据导入
  importData: (data: any) => {
    if (data.products) {
      setLocalProducts(data.products);
      notifyProductListeners();
    }
    if (data.activities) {
      setLocalActivities(data.activities);
      notifyActivityListeners();
    }
  },
  
  // 清空所有数据
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    notifyProductListeners();
    notifyActivityListeners();
  }
};
