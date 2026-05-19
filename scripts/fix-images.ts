/**
 * 快速修复产品图片 - 使用国内可访问的图片
 * 
 * 使用方法：
 * 运行: npx tsx scripts/fix-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

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

// 国内可访问的植物/花卉图片 (百度图片 CDN)
const SAFE_IMAGES = [
  'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=3489569824,2204550324&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=215806123,3539579518&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
];

async function fixImages() {
  console.log('🖼️  开始修复产品图片...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase 的 URL 和 ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 获取所有产品
    console.log('1. 获取产品列表...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('   获取产品失败:', error.message);
      process.exit(1);
    }

    if (!products || products.length === 0) {
      console.log('   没有找到产品数据');
      console.log('   提示: 请先运行数据迁移脚本或等待系统初始化');
      process.exit(0);
    }

    console.log(`   找到 ${products.length} 个产品\n`);

    // 更新每个产品的图片
    console.log('2. 更新产品图片...');
    let updated = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i] as Product;
      const newImage = SAFE_IMAGES[i % SAFE_IMAGES.length];
      
      console.log(`   更新 "${product.name}" 的图片...`);
      console.log(`   新图片: ${newImage.substring(0, 60)}...`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ image: newImage })
        .eq('id', product.id);
      
      if (updateError) {
        console.log(`   ✗ 更新失败: ${updateError.message}`);
      } else {
        console.log(`   ✓ 更新成功\n`);
        updated++;
      }
    }

    console.log('🎉 图片修复完成！');
    console.log(`   成功更新: ${updated} 个产品`);
    console.log('\n💡 提示: 现在可以刷新页面查看新的产品图片');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  }
}

fixImages();
