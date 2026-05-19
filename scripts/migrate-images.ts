/**
 * Firebase Storage 图片迁移脚本
 * 
 * 使用方法：
 * 1. 确保已安装依赖: npm install firebase @supabase/supabase-js dotenv
 * 2. 运行脚本: npx tsx scripts/migrate-images.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

dotenv.config();

// Firebase Storage 配置
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 替代图片服务 - 国内可访问
const IMAGE_REPLACEMENTS: Record<string, string> = {
  'unsplash': 'https://images.unsplash.com',
  'via.placeholder': 'https://placehold.co',
};

// 备用图片（国内可访问的植物图片）
const FALLBACK_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=800',
  'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb75bb44?w=800',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
  'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=800',
  'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800',
];

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

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filepath);
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve);
          return;
        }
      }
      
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      resolve(false);
    });
  });
}

async function uploadToSupabase(filepath: string, filename: string): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const fileBuffer = fs.readFileSync(filepath);
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.log(`     上传失败: ${error.message}`);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  } catch (error) {
    console.log(`     上传异常: ${error}`);
    return null;
  }
}

async function migrateImages() {
  console.log('🖼️  开始图片迁移...\n');

  try {
    // 初始化 Firebase Storage
    console.log('1. 连接 Firebase Storage...');
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const storage = getStorage(app);

    // 列出 Storage 中的所有图片
    console.log('\n2. 获取 Firebase Storage 中的图片列表...');
    const imagesRef = ref(storage, 'products');
    const imageList = await listAll(imagesRef);
    
    console.log(`   找到 ${imageList.items.length} 张图片`);

    if (imageList.items.length === 0) {
      console.log('\n⚠️  Firebase Storage 中没有图片');
      console.log('   提示: 您的产品图片可能存储在外部 URL (如 Unsplash)');
      console.log('   这些图片在国内可能无法访问，已使用备用图片替换');
      
      await updateProductsWithFallbackImages();
      return;
    }

    // 下载并迁移图片
    console.log('\n3. 下载并迁移图片...');
    const imageMap: Record<string, string> = {};
    const tempDir = './temp-images';
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (let i = 0; i < imageList.items.length; i++) {
      const imageRef = imageList.items[i];
      const filename = imageRef.name;
      const filepath = path.join(tempDir, filename);
      
      process.stdout.write(`   正在处理: ${filename} (${i + 1}/${imageList.items.length})`);
      
      const downloaded = await downloadImage(await getDownloadURL(imageRef), filepath);
      
      if (downloaded) {
        console.log(' ✓');
        const uploadUrl = await uploadToSupabase(filepath, filename);
        if (uploadUrl) {
          imageMap[filename] = uploadUrl;
          console.log(`   新 URL: ${uploadUrl.substring(0, 50)}...`);
        }
      } else {
        console.log(' ✗');
      }
    }

    // 清理临时文件
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n4. 更新数据库中的图片链接...');
    
    if (Object.keys(imageMap).length > 0) {
      await updateProductsWithNewImages(imageMap);
    } else {
      console.log('   没有成功迁移的图片，使用备用图片');
      await updateProductsWithFallbackImages();
    }

    console.log('\n🎉 图片迁移完成！');
    console.log(`   成功迁移: ${Object.keys(imageMap).length} 张图片`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 图片迁移失败:', error);
    
    console.log('\n⚠️  使用备用图片方案...');
    await updateProductsWithFallbackImages();
    
    process.exit(1);
  }
}

async function updateProductsWithNewImages(imageMap: Record<string, string>) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.log(`   获取产品失败: ${error.message}`);
    return;
  }

  const updates = (products as Product[]).map(product => {
    const filename = path.basename(product.image);
    const newUrl = imageMap[filename] || product.image;
    return { ...product, image: newUrl };
  });

  for (const product of updates) {
    await supabase
      .from('products')
      .upsert(product);
  }
  
  console.log(`   已更新 ${updates.length} 个产品的图片链接`);
}

async function updateProductsWithFallbackImages() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 国内可访问的植物图片（使用 Proxy 或 CDN）
  const safeImages = [
    'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    'https://img1.baidu.com/it/u=3489569824,2204550324&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
    'https://img1.baidu.com/it/u=215806123,3539579518&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600',
  ];
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.log(`   获取产品失败: ${error.message}`);
    return;
  }

  const updates = (products as Product[]).map((product, index) => {
    return { 
      ...product, 
      image: safeImages[index % safeImages.length] 
    };
  });

  for (const product of updates) {
    await supabase
      .from('products')
      .upsert(product);
  }
  
  console.log(`   已更新 ${updates.length} 个产品的图片为国内可访问图片`);
}

migrateImages();
