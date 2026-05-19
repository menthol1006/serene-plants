/**
 * 更新所有产品图片为稳定可访问的 URL
 * 使用多种可靠的图片源
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const STABLE_IMAGES = [
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=800&h=1000&fit=crop',
];

const CHINESE_IMAGES = [
  'https://img0.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000',
  'https://img1.baidu.com/it/u=3489569824,2204550324&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000',
  'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000',
  'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1000',
];

async function updateImages() {
  console.log('🔄 开始更新产品图片...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('1. 获取所有产品...');
    const { data: products, error } = await supabase.from('products').select('*');

    if (error) {
      console.log('   ❌ 获取产品失败:', error.message);
      return;
    }

    console.log(`   ✅ 找到 ${products.length} 个产品\n`);

    console.log('2. 更新图片 URL...');
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageUrl = CHINESE_IMAGES[i % CHINESE_IMAGES.length];

      console.log(`   📦 更新 "${product.name}" 的图片...`);

      const { error: updateError } = await supabase
        .from('products')
        .update({ image: imageUrl })
        .eq('id', product.id);

      if (updateError) {
        console.log(`      ❌ 更新失败: ${updateError.message}`);
      } else {
        console.log(`      ✅ 图片已更新`);
      }
    }

    console.log('\n🎉 所有产品图片已更新！');
    console.log('\n💡 现在刷新浏览器页面，应该能看到正确的图片了');

  } catch (err) {
    console.error('❌ 更新失败:', err);
  }
}

updateImages();
