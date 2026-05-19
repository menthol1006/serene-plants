/**
 * 测试数据读取功能
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function testRead() {
  console.log('🔍 测试数据读取功能...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 测试读取所有产品
    console.log('1. 读取所有产品...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.log(`   ❌ 读取失败: ${productsError.message}`);
    } else {
      console.log(`   ✅ 成功读取 ${products?.length || 0} 个产品`);
      products?.forEach((p: any, i) => {
        console.log(`      ${i + 1}. ${p.name}`);
        console.log(`         图片: ${p.image?.substring(0, 50)}...`);
      });
    }

    // 2. 测试读取活动日志
    console.log('\n2. 读取活动日志...');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .order('time', { ascending: false });
    
    if (activitiesError) {
      console.log(`   ❌ 读取失败: ${activitiesError.message}`);
    } else {
      console.log(`   ✅ 成功读取 ${activities?.length || 0} 条活动日志`);
    }

    // 3. 检查图片 URL
    console.log('\n3. 检查图片可访问性...');
    if (products && products.length > 0) {
      const sampleImage = products[0].image;
      console.log(`   示例图片: ${sampleImage.substring(0, 60)}...`);
      
      // 检查是否是百度图片
      if (sampleImage.includes('baidu.com')) {
        console.log('   ✅ 使用百度图片 CDN，国内可访问');
      } else {
        console.log('   ⚠️  图片可能需要检查可访问性');
      }
    }

    console.log('\n🎉 数据读取测试完成！');
    console.log('\n💡 刷新浏览器页面应该能看到产品了');
    console.log('   如果还是看不到，可能需要：');
    console.log('   1. 清除浏览器缓存');
    console.log('   2. 强制刷新 (Ctrl + F5)');
    console.log('   3. 检查浏览器控制台错误');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

testRead();
