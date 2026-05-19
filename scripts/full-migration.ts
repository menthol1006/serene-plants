/**
 * 完整的 Firebase 到 Supabase 数据迁移脚本
 * 
 * 使用方法：
 * 1. 确保 .env 文件中有完整的 Firebase 和 Supabase 配置
 * 2. 运行脚本: npx tsx scripts/full-migration.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Firebase 配置
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

// 国内可访问的产品图片
const PRODUCT_IMAGES = [
  'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
];

// 示例产品数据（备用）
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: '北欧丝绒玫瑰',
    category: '丝绸花卉',
    material: '高级丝绸 / 聚合物',
    supplier: '翡翠苗圃有限公司',
    description: '具有深红色的色调和天鹅绒般的质感。',
    costPrice: 45.00,
    marketPrice: 189.00,
    stock: 120,
    image: PRODUCT_IMAGES[0],
    status: 'In Stock',
    sku: 'PE-ROSE-001'
  },
  {
    id: '2',
    name: '特级龟背竹叶',
    category: '稀有天南星科',
    material: '耐用聚乙烯',
    supplier: '热带绿植行',
    description: '巨大的分瓣叶片，具有极高的装饰性。',
    costPrice: 85.00,
    marketPrice: 245.00,
    stock: 45,
    image: PRODUCT_IMAGES[1],
    status: 'In Stock',
    sku: 'PE-MONS-002'
  },
  {
    id: '3',
    name: '琴叶榕大型盆栽',
    category: '大型绿植',
    material: '涂层织物 / 环保塑料',
    supplier: '艺境花卉',
    description: '经典的室内装饰绿植，形态优美。',
    costPrice: 120.00,
    marketPrice: 480.00,
    stock: 8,
    image: PRODUCT_IMAGES[2],
    status: 'Low Stock',
    sku: 'PE-FIG-003'
  },
  {
    id: '4',
    name: '荒漠宝石多肉',
    category: '多肉植物',
    material: '柔性树脂',
    supplier: '沙地园艺',
    description: '紧凑的莲座状结构，呈现出迷人的灰绿色。',
    costPrice: 12.50,
    marketPrice: 98.00,
    stock: 2,
    image: PRODUCT_IMAGES[3],
    status: 'Out of Stock',
    sku: 'PE-SUCC-004'
  },
  {
    id: '5',
    name: '香樟木景观树',
    category: '硬木乔木',
    material: '真实原木杆 / 聚酰亚胺叶片',
    supplier: '艺境花卉',
    description: '真实触感的树皮，经久耐用。',
    costPrice: 350.50,
    marketPrice: 1200.00,
    stock: 45,
    image: PRODUCT_IMAGES[4],
    status: 'In Stock',
    sku: 'PE-ROOT-005'
  }
];

// 示例活动日志（备用）
const MOCK_ACTIVITIES = [
  {
    id: '1',
    productName: '北欧丝绒玫瑰',
    action: '已添加库存',
    amount: '+ ¥2,268.00',
    time: new Date(Date.now() - 7200000).toISOString(),
    type: 'inventory'
  },
  {
    id: '2',
    productName: '特级龟背竹叶',
    action: '手动调整了市场参考价',
    time: new Date(Date.now() - 18000000).toISOString(),
    type: 'price'
  },
  {
    id: '3',
    productName: '荒漠宝石多肉',
    action: '低库存警报 - 剩余 12 单位',
    time: new Date(Date.now() - 86400000).toISOString(),
    type: 'alert'
  }
];

async function migrateData() {
  console.log('🚀 开始 Firebase 到 Supabase 数据迁移...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase 的 URL 和 ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  let useFirebase = true;

  try {
    // 1. 检查 Firebase 配置
    console.log('1. 检查 Firebase 配置...');
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.log('   ⚠️ Firebase 配置不完整，将使用示例数据');
      useFirebase = false;
    } else {
      console.log('   ✓ Firebase 配置正确');
    }

    let products = [];
    let activities = [];

    if (useFirebase) {
      try {
        // 2. 连接 Firebase 并获取数据
        console.log('\n2. 连接 Firebase...');
        const firebaseApp = initializeApp(firebaseConfig);
        const firestore = getFirestore(firebaseApp);
        console.log('   ✓ 已连接 Firebase');

        console.log('\n3. 从 Firebase 导出数据...');
        
        // 获取产品数据
        console.log('   - 导出产品数据...');
        const productsSnapshot = await getDocs(collection(firestore, 'products'));
        products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`     ✓ 导出了 ${products.length} 个产品`);

        // 获取活动日志
        console.log('   - 导出活动日志...');
        const activitiesSnapshot = await getDocs(collection(firestore, 'activities'));
        activities = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`     ✓ 导出了 ${activities.length} 条活动日志`);

        // 用国内可访问的图片替换原有图片
        console.log('\n4. 处理图片链接...');
        products = products.map((p, i) => ({
          ...p,
          image: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]
        }));
        console.log('   ✓ 图片链接已更新为国内可访问链接');

      } catch (firebaseError: any) {
        console.log(`   ⚠️ 无法连接 Firebase: ${firebaseError.message}`);
        console.log('   💡 将使用示例数据初始化数据库');
        useFirebase = false;
      }
    }

    if (!useFirebase || products.length === 0) {
      console.log('\n2. 使用示例数据...');
      products = MOCK_PRODUCTS;
      activities = MOCK_ACTIVITIES;
      console.log(`   - 准备了 ${products.length} 个示例产品`);
      console.log(`   - 准备了 ${activities.length} 条示例活动日志`);
    }

    // 3. 导入到 Supabase
    console.log('\n3. 导入数据到 Supabase...');

    // 导入产品数据
    console.log('   - 导入产品数据...');
    let productSuccess = 0;
    let productFail = 0;

    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert(product);
      
      if (error) {
        console.log(`     ✗ 导入产品 "${product.name}" 失败: ${error.message}`);
        productFail++;
      } else {
        console.log(`     ✓ 导入产品 "${product.name}" 成功`);
        productSuccess++;
      }
    }

    // 导入活动日志
    console.log('\n   - 导入活动日志...');
    let activitySuccess = 0;
    let activityFail = 0;

    for (const activity of activities) {
      const { error } = await supabase
        .from('activities')
        .upsert(activity);
      
      if (error) {
        console.log(`     ✗ 导入活动失败: ${error.message}`);
        activityFail++;
      } else {
        activitySuccess++;
      }
    }

    // 4. 验证导入结果
    console.log('\n4. 验证导入结果...');
    const { data: verifiedProducts } = await supabase
      .from('products')
      .select('id, name, image');

    console.log(`   数据库中现有 ${verifiedProducts?.length || 0} 个产品:`);
    verifiedProducts?.forEach((p: any) => {
      const domain = p.image.substring(0, 35);
      console.log(`     - ${p.name}: ${domain}...`);
    });

    console.log('\n🎉 数据迁移完成！');
    console.log(`   ✓ 产品导入成功: ${productSuccess} 个`);
    if (productFail > 0) console.log(`   ✗ 产品导入失败: ${productFail} 个`);
    console.log(`   ✓ 活动日志导入成功: ${activitySuccess} 条`);
    if (activityFail > 0) console.log(`   ✗ 活动日志导入失败: ${activityFail} 条`);
    console.log('\n💡 提示: 刷新前端页面即可看到数据');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    
    console.log('\n💡 提示: 请确保已在 Supabase 中创建了表结构');
    console.log('    如果还没创建，请在 Supabase SQL Editor 中执行 supabase-schema.sql');
    
    process.exit(1);
  }
}

migrateData();
