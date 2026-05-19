/**
 * 模拟前端完整的数据加载流程
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 模拟前端的订阅函数
function subscribeToProducts(callback: (products: any[]) => void) {
  console.log('🔔 subscribeToProducts 被调用');
  
  // 模拟 firebaseService 的行为
  db.products.get().then(products => {
    console.log('📥 初始数据获取完成:', products.length, '个产品');
    callback(products);
  }).catch(error => {
    console.error('❌ 获取初始产品失败:', error);
    callback([]);
  });
  
  return () => {
    console.log('🔌 取消订阅');
  };
}

// 模拟 supabase 数据库操作
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const db = {
  products: {
    get: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('❌ Supabase 查询错误:', error);
        return [];
      }
      return data || [];
    }
  }
};

// 模拟前端组件的状态管理
let products: any[] = [];
let isLoading = true;

// 模拟 useEffect 中的订阅
async function simulateUseEffect() {
  console.log('🚀 模拟 useEffect 执行...');
  
  // 模拟订阅
  const unsubscribe = subscribeToProducts((fetchedProducts) => {
    console.log('🔄 setState 被调用，更新 products');
    products = fetchedProducts;
    isLoading = false;
    
    // 模拟组件渲染
    renderComponent();
  });
  
  // 返回清理函数
  return unsubscribe;
}

// 模拟组件渲染
function renderComponent() {
  console.log('\n🎨 组件渲染结果:');
  console.log('   产品数量:', products.length);
  console.log('   加载状态:', isLoading ? '加载中' : '已加载');
  
  if (products.length > 0) {
    console.log('\n📋 产品列表:');
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      - ID: ${p.id}`);
      console.log(`      - 价格: ${p.marketPrice}`);
      console.log(`      - 库存: ${p.stock}`);
    });
    
    // 计算统计数据
    const avgCost = products.reduce((sum, p) => sum + p.costPrice, 0) / products.length;
    const avgMarket = products.reduce((sum, p) => sum + p.marketPrice, 0) / products.length;
    
    console.log('\n📊 统计数据:');
    console.log(`   总产品种类: ${products.length}`);
    console.log(`   平均成本: ¥${avgCost.toFixed(2)}`);
    console.log(`   平均市场价: ¥${avgMarket.toFixed(2)}`);
  } else {
    console.log('   ⚠️  没有产品数据');
  }
}

// 运行测试
async function runTest() {
  console.log('========================================');
  console.log('  前端数据加载模拟测试');
  console.log('========================================\n');
  
  const unsubscribe = await simulateUseEffect();
  
  // 清理
  setTimeout(() => {
    unsubscribe();
    console.log('\n✅ 测试完成');
  }, 1000);
}

runTest();
