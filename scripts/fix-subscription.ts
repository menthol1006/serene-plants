/**
 * 修复订阅问题的脚本
 */

import * as fs from 'fs';
import * as path from 'path';

const servicePath = path.join(__dirname, '../src/services/firebaseService.ts');

// 修复后的代码
const fixedCode = `import { db } from '../lib/supabase';
import { Product, ActivityLog } from '../types';

export const firebaseService = {
  async getProducts(): Promise<Product[]> {
    return await db.products.get();
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    // 立即获取数据并调用回调
    db.products.get().then(products => {
      console.log('🔄 初始产品数据:', products.length, '个产品');
      callback(products);
    }).catch(error => {
      console.error('❌ 获取初始产品失败:', error);
      callback([]);
    });
    
    // 设置实时订阅
    return db.products.subscribe(callback);
  },

  async saveProduct(product: Product) {
    await db.products.save(product);
  },

  async deleteProduct(id: string) {
    await db.products.delete(id);
  },

  async getActivities(): Promise<ActivityLog[]> {
    return await db.activities.get();
  },

  subscribeToActivities(callback: (activities: ActivityLog[]) => void) {
    // 立即获取数据并调用回调
    db.activities.get().then(activities => {
      console.log('🔄 初始活动数据:', activities.length, '条记录');
      callback(activities);
    }).catch(error => {
      console.error('❌ 获取初始活动失败:', error);
      callback([]);
    });
    
    // 设置实时订阅
    return db.activities.subscribe(callback);
  },

  async addActivity(activity: ActivityLog) {
    await db.activities.add(activity);
  }
};
`;

// 写入修复后的代码
fs.writeFileSync(servicePath, fixedCode);
console.log('✅ firebaseService.ts 已修复');
console.log('💡 现在订阅会立即获取初始数据');
