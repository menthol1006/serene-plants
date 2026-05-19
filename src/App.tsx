import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductGallery from './components/ProductGallery';
import DataEntry from './components/DataEntry';
import Quotes from './components/Quotes';
import ProductDetail from './components/ProductDetail';
import { AnimatePresence, motion } from 'motion/react';
import { Product, ActivityLog } from './types';
import { firebaseService } from './services/firebaseService';
import { storageService } from './services/storageService';
import { fireAuth } from './lib/firebase';
import { Leaf } from 'lucide-react';

// 默认产品图片
const DEFAULT_PRODUCT_IMAGE = 'https://picsum.photos/seed/default/800/600';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<{ product: Product; quantity: number }[]>([]);

  const currentUser = user;

  useEffect(() => {
    // 监听认证状态变化
    const unsubscribe = fireAuth.onAuthStateChanged((newUser) => {
      console.log('🔐 认证状态变化:', newUser);
      setUser(newUser);
      setAuthLoading(false);
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect 触发');
    console.log('   authLoading:', authLoading);
    console.log('   currentUser:', currentUser ? '已设置' : 'null');
    
    if (authLoading || !currentUser) {
      console.log('⏭️  条件不满足，跳过订阅');
      return;
    }

    console.log('🚀 App.tsx: 开始订阅数据');
    
    const unsubProducts = firebaseService.subscribeToProducts((fetchedProducts) => {
      console.log('📥 App.tsx: 收到产品数据:', fetchedProducts.length, '个');
      console.log('📋 App.tsx: 产品列表:', fetchedProducts.map(p => p.name));
      setProducts(fetchedProducts);
    });

    const unsubActivities = firebaseService.subscribeToActivities((fetchedActivities) => {
      console.log('📥 App.tsx: 收到活动数据:', fetchedActivities.length, '条');
      setActivities(fetchedActivities);
    });

    return () => {
      console.log('🔌 App.tsx: 取消订阅');
      unsubProducts();
      unsubActivities();
    };
  }, [currentUser, authLoading]);

  const selectedProduct = React.useMemo(() => 
    products.find(p => p.id === selectedProductId), 
    [products, selectedProductId]
  );

  const handleSelectProduct = (id: string, view: string = 'productDetail') => {
    setSelectedProductId(id);
    setActiveView(view);
  };

  const handleAddToOrder = (product: Product) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    alert(`已将 ${product.name} 加入报价单`);
  };

  const handleRemoveFromOrder = (id: string) => {
    setOrderItems(prev => prev.filter(item => item.product.id !== id));
  };

  const handleExport = () => {
    storageService.exportData(products, activities);
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      firebaseService.deleteProduct(id);
      addActivity(product.name, '删除了产品', 'alert');
      setActiveView('gallery');
      setSelectedProductId(null);
    }
  };

  const addActivity = (productName: string, action: string, type: 'inventory' | 'price' | 'alert' = 'inventory', amount?: string) => {
    const newActivity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      productName,
      action,
      type,
      time: new Date().toISOString(),
    };

    if (amount) {
      newActivity.amount = amount;
    }

    firebaseService.addActivity(newActivity);
  };

  const handleSaveProduct = async (product: Partial<Product>) => {
    console.log('📝 handleSaveProduct 被调用');
    console.log('   selectedProductId:', selectedProductId);
    console.log('   产品数据:', product);
    
    try {
      if (selectedProductId) {
        console.log('📝 正在更新现有产品...');
        const oldProduct = products.find(p => p.id === selectedProductId);
        if (oldProduct) {
          if (oldProduct.marketPrice !== product.marketPrice || oldProduct.costPrice !== product.costPrice) {
            addActivity(product.name || oldProduct.name, '更新了价格参数', 'price', `¥${product.marketPrice?.toFixed(2)}`);
          } else {
            addActivity(product.name || oldProduct.name, '修改了产品信息', 'inventory');
          }
          const updatedProduct = { ...oldProduct, ...product } as Product;
          console.log('📝 准备保存的产品:', updatedProduct);
          await firebaseService.saveProduct(updatedProduct);
          console.log('✅ 现有产品保存完成');
        }
      } else {
        console.log('📝 正在创建新产品...');
        const newProduct: Product = {
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          status: 'In Stock',
          stock: Math.floor(Math.random() * 100),
          sku: `SKU-${Math.floor(Math.random() * 10000)}`,
          image: product.image || DEFAULT_PRODUCT_IMAGE,
        } as Product;

        console.log('📝 准备保存的新产品:', newProduct);
        await firebaseService.saveProduct(newProduct);
        addActivity(newProduct.name, '录入了新产品', 'inventory', '新增');
        console.log('✅ 新产品保存完成');
      }
      
      console.log('🔄 正在重新获取产品列表...');
      const freshProducts = await firebaseService.getProducts();
      console.log('✅ 获取到产品数量:', freshProducts.length);
      setProducts(freshProducts);
      
      setActiveView('gallery');
      setSelectedProductId(null);
      console.log('✅ 保存流程完成');
    } catch (error) {
      console.error('❌ 保存产品时发生错误:', error);
      alert('保存产品时发生错误: ' + (error as Error).message);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            products={products}
            activities={activities}
            onSelectProduct={(id) => handleSelectProduct(id, 'productDetail')} 
            onViewAll={() => setActiveView('gallery')}
            currentUser={currentUser}
          />
        );
      case 'gallery':
        return (
          <ProductGallery 
            products={products} 
            onSelectProduct={(id) => handleSelectProduct(id, 'productDetail')} 
            onDeleteProduct={handleDeleteProduct}
            onAddToQuote={handleAddToOrder}
            currentUser={currentUser}
          />
        );
      case 'productDetail':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onClose={() => setActiveView('gallery')} 
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            onEdit={() => setActiveView('entry')}
            onAddToQuote={handleAddToOrder}
            currentUser={currentUser}
          />
        ) : (
          <div className="text-center py-20 text-on-surface-variant font-serif text-2xl">请选择一个产品</div>
        );
      case 'quotes':
        return (
          <Quotes 
            items={orderItems} 
            onRemove={handleRemoveFromOrder}
            onNavigateToGallery={() => setActiveView('gallery')}
            currentUser={currentUser}
          />
        );
      case 'entry':
        return (
          <DataEntry 
            initialData={selectedProduct}
            onSave={handleSaveProduct} 
            onCancel={() => {
              setActiveView('gallery');
              setSelectedProductId(null);
            }} 
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-[60vh] text-on-surface-variant font-serif text-2xl">
            视图开发中...
          </div>
        );
    }
  };

  const handleNavigate = (view: string) => {
    if (view !== 'quotes' && view !== 'entry') {
      setSelectedProductId(null);
    }
    setActiveView(view);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-on-surface-variant font-serif italic text-lg">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeView={activeView} onNavigate={handleNavigate} onExport={handleExport} currentUser={currentUser}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView + (selectedProductId || '')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
