/**
 * 初始化 Supabase 数据库脚本
 * 直接使用示例数据初始化
 * 
 * 使用方法：
 * 1. 确保 .env 文件中有 Supabase 配置
 * 2. 运行脚本: npx tsx scripts/init-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 使用 Picsum Photos 作为图片源
const PRODUCT_IMAGES = [
  'https://picsum.photos/seed/rose/800/600',
  'https://picsum.photos/seed/monstera/800/600',
  'https://picsum.photos/seed/fiddle/800/600',
  'https://picsum.photos/seed/succulent/800/600',
  'https://picsum.photos/seed/tree/800/600',
];

const INIT_PRODUCTS = [
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

const INIT_ACTIVITIES = [
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

async function initSupabase() {
  console.log('🚀 开始清理并重新初始化 Supabase 数据库...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase 的 URL 和 ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 检查数据库连接
    console.log('1. 连接 Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count');
    
    if (testError) {
      console.log('   ⚠️ 可能需要先创建表');
      console.log('\n💡 请先在 Supabase SQL Editor 中执行以下 SQL 创建表：');
      console.log(`
-- 创建 products 表
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  material TEXT NOT NULL,
  supplier TEXT NOT NULL,
  description TEXT NOT NULL,
  costPrice NUMERIC NOT NULL,
  marketPrice NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  image TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  sku TEXT NOT NULL
);

-- 创建 activities 表
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  productName TEXT NOT NULL,
  action TEXT NOT NULL,
  amount TEXT,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'price', 'alert'))
);

-- 启用实时功能
BEGIN;
DROP publication IF EXISTS supabase_realtime;
CREATE publication supabase_realtime FOR TABLE products, activities;
COMMIT;
      `);
      console.log('\n创建完表后重新运行此脚本');
      process.exit(1);
    }

    console.log('   ✓ 已连接 Supabase');

    // 2. 清空现有数据
    console.log('\n2. 清空现有数据...');
    console.log('   - 删除活动日志...');
    await supabase.from('activities').delete().not('id', 'is', null);
    console.log('   - 删除产品数据...');
    await supabase.from('products').delete().not('id', 'is', null);
    console.log('   ✓ 已清空所有数据');

    // 3. 初始化产品数据
    console.log('\n3. 初始化产品数据...');
    let productSuccess = 0;
    
    for (const product of INIT_PRODUCTS) {
      const { error } = await supabase
        .from('products')
        .upsert(product);
      
      if (error) {
        console.log(`   ✗ 导入 "${product.name}" 失败: ${error.message}`);
      } else {
        console.log(`   ✓ 导入 "${product.name}" 成功`);
        productSuccess++;
      }
    }
    
    // 4. 初始化活动日志
    console.log('\n4. 初始化活动日志...');
    for (const activity of INIT_ACTIVITIES) {
      await supabase
        .from('activities')
        .upsert(activity);
    }
    
    console.log(`   ✓ 成功导入 ${productSuccess} 个产品`);

    // 5. 验证结果
    console.log('\n5. 验证数据库...');
    const { data: finalProducts } = await supabase
      .from('products')
      .select('id, name, image');

    console.log(`   数据库中现有 ${finalProducts?.length || 0} 个产品:`);
    finalProducts?.forEach((p: any) => {
      const domain = p.image.substring(0, 35);
      console.log(`     - ${p.name}: ${domain}...`);
    });

    console.log('\n🎉 数据库初始化完成！');
    console.log('💡 提示: 刷新前端页面即可看到数据');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  }
}

initSupabase();
