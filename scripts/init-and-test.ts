/**
 * 初始化示例数据并测试读取
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 示例产品数据
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
    image: 'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
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
    image: 'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
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
    image: 'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    status: 'Low Stock',
    sku: 'PE-FIG-003'
  }
];

const INIT_ACTIVITIES = [
  {
    id: '1',
    productName: '系统初始化',
    action: '添加了示例数据',
    amount: '+ 3 个产品',
    time: new Date().toISOString(),
    type: 'inventory'
  }
];

async function initAndTest() {
  console.log('🚀 初始化示例数据...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 检查现有数据
    console.log('1. 检查现有产品...');
    const { data: existing } = await supabase.from('products').select('count');
    console.log(`   现有产品数: ${(existing as any)?.[0]?.count || 0}`);

    if ((existing as any)?.[0]?.count > 0) {
      console.log('   ✅ 数据库已有数据，跳过初始化');
    } else {
      console.log('   📦 正在初始化数据...\n');
      
      // 2. 插入示例产品
      console.log('2. 插入示例产品...');
      for (const product of INIT_PRODUCTS) {
        const { error } = await supabase.from('products').upsert(product);
        if (error) {
          console.log(`   ❌ 插入 "${product.name}" 失败: ${error.message}`);
        } else {
          console.log(`   ✅ "${product.name}"`);
        }
      }

      // 3. 插入示例活动
      console.log('\n3. 插入示例活动...');
      for (const activity of INIT_ACTIVITIES) {
        await supabase.from('activities').upsert(activity);
      }
    }

    // 4. 验证结果
    console.log('\n4. 验证数据...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.log(`   ❌ 读取产品失败: ${productsError.message}`);
    } else {
      console.log(`   ✅ 数据库中有 ${products?.length || 0} 个产品`);
      products?.forEach((p: any) => {
        console.log(`      - ${p.name} (${p.category})`);
      });
    }

    console.log('\n🎉 数据初始化完成！');
    console.log('\n💡 请刷新浏览器页面，应该能看到产品图库了');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  }
}

initAndTest();
