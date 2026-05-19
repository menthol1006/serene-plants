// 使用 Supabase 服务
import { db } from '../lib/supabase';
import { Product, ActivityLog } from '../types';

export const firebaseService = {
  async getProducts(): Promise<Product[]> {
    return await db.products.get();
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    console.log('🔔 订阅产品数据 (Supabase)');
    return db.products.subscribe(callback);
  },

  async saveProduct(product: Product): Promise<void> {
    console.log('💾 保存产品 (Supabase):', product.name);
    try {
      await db.products.save(product);
      console.log('✅ 产品保存成功 (Supabase)');
    } catch (error) {
      console.error('❌ 产品保存失败 (Supabase):', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    console.log('🗑️ 删除产品 ID (Supabase):', id);
    await db.products.delete(id);
  },

  async getActivities(): Promise<ActivityLog[]> {
    return await db.activities.get();
  },

  subscribeToActivities(callback: (activities: ActivityLog[]) => void) {
    console.log('🔔 订阅活动数据 (Supabase)');
    return db.activities.subscribe(callback);
  },

  async addActivity(activity: ActivityLog) {
    await db.activities.add(activity);
  },
  
  // 数据导出 - 简单导出当前数据
  async exportData() {
    const products = await db.products.get();
    const activities = await db.activities.get();
    return {
      products,
      activities,
      exportedAt: new Date().toISOString()
    };
  }
};
