/**
 * 使用 Supabase API 直接更新产品图片
 * 使用方法：npx tsx scripts/update-images-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 国内可访问的产品图片
const PRODUCT_IMAGES = [
  'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=3489569824,2204550324&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  'https://img1.baidu.com/it/u=215806123,3539579518&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
];

async function updateImages() {
  console.log('🔄 开始更新 Supabase 产品图片...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase 的 URL 和 ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 获取所有产品
    console.log('1. 获取产品列表...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, image');
    
    if (fetchError) {
      console.error('   获取产品失败:', fetchError.message);
      process.exit(1);
    }

    if (!products || products.length === 0) {
      console.log('   ❌ 没有找到产品数据');
      console.log('   提示: 数据库中可能还没有产品，请先运行数据迁移或等待系统初始化');
      process.exit(0);
    }

    console.log(`   ✓ 找到 ${products.length} 个产品`);
    products.forEach((p: any) => {
      const currentDomain = p.image?.substring(0, 40) || '无图片';
      console.log(`     - ${p.name}: ${currentDomain}...`);
    });
    console.log('');

    // 2. 更新每个产品的图片
    console.log('2. 更新产品图片...');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newImage = PRODUCT_IMAGES[i % PRODUCT_IMAGES.length];
      
      process.stdout.write(`   更新 "${product.name}"... `);

      const { error } = await supabase
        .from('products')
        .update({ image: newImage })
        .eq('id', product.id);

      if (error) {
        console.log(`✗ ${error.message}`);
        failCount++;
      } else {
        console.log(`✓`);
        successCount++;
      }
    }

    console.log('');

    // 3. 验证更新结果
    console.log('3. 验证更新结果...');
    const { data: updatedProducts } = await supabase
      .from('products')
      .select('id, name, image');

    console.log('   更新后的产品图片:');
    updatedProducts?.forEach((p: any) => {
      const newDomain = p.image.substring(0, 40);
      console.log(`     - ${p.name}: ${newDomain}...`);
    });

    console.log('\n🎉 产品图片更新完成！');
    console.log(`   ✓ 成功: ${successCount} 个`);
    console.log(`   ✗ 失败: ${failCount} 个`);
    console.log('\n💡 提示: 刷新前端页面即可看到新图片');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  }
}

updateImages();
