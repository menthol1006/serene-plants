/**
 * 执行 SQL 更新脚本
 * 使用方法：npx tsx scripts/run-sql.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 产品图片更新 SQL
const sqlUpdates = [
  `UPDATE products SET image = 'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '1'`,
  `UPDATE products SET image = 'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '2'`,
  `UPDATE products SET image = 'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '3'`,
  `UPDATE products SET image = 'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '4'`,
  `UPDATE products SET image = 'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '5'`,
];

async function runSql() {
  console.log('🔄 开始更新数据库产品图片...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 请确保 .env 文件中配置了 Supabase 的 URL 和 ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 先获取所有产品，显示当前数据
    console.log('1. 获取当前产品列表...');
    const { data: products, error: fetchError } = await supabase.from('products').select('id, name');
    
    if (fetchError) {
      console.error('   获取产品失败:', fetchError.message);
      process.exit(1);
    }

    console.log(`   找到 ${products.length} 个产品:`);
    products.forEach((p: any) => console.log(`     - ${p.id}: ${p.name}`));
    console.log('');

    // 执行更新
    console.log('2. 更新产品图片...');
    
    for (const sql of sqlUpdates) {
      const { error } = await supabase.rpc('run_sql', { sql });
      
      if (error) {
        console.log(`   ⚠️  ${error.message}`);
      } else {
        console.log(`   ✓ 更新成功`);
      }
    }

    // 验证更新结果
    console.log('\n3. 验证更新结果...');
    const { data: updatedProducts } = await supabase.from('products').select('id, name, image');
    
    console.log('   更新后的产品图片:');
    updatedProducts?.forEach((p: any) => {
      const imageDomain = p.image.substring(0, 30);
      console.log(`     - ${p.name}: ${imageDomain}...`);
    });

    console.log('\n🎉 产品图片更新完成！');
    console.log('💡 提示: 刷新前端页面即可看到新图片');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  }
}

runSql();
