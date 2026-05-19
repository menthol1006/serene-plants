/**
 * Firebase 到 Supabase 数据迁移脚本
 * 
 * 使用方法：
 * 1. 确保已安装 Node.js 和 npm
 * 2. 安装依赖: npm install firebase @supabase/supabase-js dotenv
 * 3. 创建 .env 文件，填入 Firebase 和 Supabase 的配置
 * 4. 运行脚本: npx tsx scripts/migrate-from-firebase.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Firebase 配置（从 firebase-applet-config.json 复制）
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
};

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  supplier: string;
  description: string;
  costPrice: number;
  marketPrice: number;
  stock: number;
  image: string;
  status: string;
  sku: string;
}

interface ActivityLog {
  id: string;
  productName: string;
  action: string;
  amount?: string;
  time: string;
  type: string;
}

async function main() {
  console.log('🚀 开始数据迁移...\n');

  try {
    // 初始化 Firebase
    console.log('1. 连接 Firebase...');
    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);

    // 初始化 Supabase
    console.log('2. 连接 Supabase...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 导出 Firebase 数据
    console.log('\n3. 从 Firebase 导出数据...');
    
    console.log('   - 导出产品数据...');
    const productsSnapshot = await getDocs(collection(firestore, 'products'));
    const products: Product[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    console.log(`     ✓ 导出了 ${products.length} 个产品`);

    console.log('   - 导出活动日志...');
    const activitiesSnapshot = await getDocs(collection(firestore, 'activities'));
    const activities: ActivityLog[] = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
    console.log(`     ✓ 导出了 ${activities.length} 条活动日志`);

    // 导入到 Supabase
    console.log('\n4. 导入数据到 Supabase...');

    console.log('   - 导入产品数据...');
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert(product);
      
      if (error) {
        console.log(`     ✗ 导入产品 "${product.name}" 失败: ${error.message}`);
      }
    }
    console.log(`     ✓ 成功导入 ${products.length} 个产品`);

    console.log('   - 导入活动日志...');
    for (const activity of activities) {
      const { error } = await supabase
        .from('activities')
        .upsert(activity);
      
      if (error) {
        console.log(`     ✗ 导入活动 "${activity.action}" 失败: ${error.message}`);
      }
    }
    console.log(`     ✓ 成功导入 ${activities.length} 条活动日志`);

    console.log('\n🎉 数据迁移完成！');
    console.log(`   - 迁移产品: ${products.length} 个`);
    console.log(`   - 迁移活动日志: ${activities.length} 条`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    process.exit(1);
  }
}

main();
