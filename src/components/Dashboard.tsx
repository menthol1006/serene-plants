import { motion } from 'motion/react';
import { Package, TrendingUp } from 'lucide-react';
import { Product, ActivityLog } from '../types';
import { User } from '../types/user';

interface DashboardProps {
  products: Product[];
  activities: ActivityLog[];
  onSelectProduct: (id: string) => void;
  onViewAll: () => void;
  currentUser: User | null;
}

export default function Dashboard({ products, activities, onSelectProduct, onViewAll, currentUser }: DashboardProps) {
  const isVisitor = !currentUser || currentUser.isAnonymous;

  const totalStockCount = products.length;
  const avgCost = products.length > 0 ? products.reduce((sum, p) => sum + p.costPrice, 0) / products.length : 0;
  const avgMarket = products.length > 0 ? products.reduce((sum, p) => sum + p.marketPrice, 0) / products.length : 0;
  const avgMargin = avgMarket > 0 ? ((avgMarket - avgCost) / avgMarket) * 100 : 0;

  const stats = isVisitor ? [
    { label: '在线植物种类', value: totalStockCount.toString() },
    { label: '平均市场价', value: `¥${avgMarket.toFixed(0)}` },
  ] : [
    { label: '产品种类', value: totalStockCount.toString() },
    { label: '平均成本', value: `¥${avgCost.toFixed(0)}` },
    { label: '平均市场价', value: `¥${avgMarket.toFixed(0)}` },
    { label: '毛利率', value: `${avgMargin.toFixed(0)}%` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 space-y-20">
      {/* Welcome Section */}
      <section className="space-y-4">
        <h1 className="text-5xl font-light tracking-tight">
          {isVisitor ? '欢迎访问' : '欢迎回来'}
        </h1>
        <p className="text-xl text-gray-400 font-light max-w-2xl">
          {isVisitor 
            ? '浏览我们的精选植物系列'
            : '实时管理您的植物库存与报价'}
        </p>
      </section>

      {/* Stats Grid - Apple Style */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="py-8 px-6 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-default">
            <p className="text-sm text-gray-400 mb-3">{stat.label}</p>
            <p className="text-4xl font-light tracking-tight">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Products Grid - Spacious */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-light">精选产品</h2>
          <button
            onClick={onViewAll}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            查看全部 →
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => onSelectProduct(product.id)}
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <h3 className="text-base font-medium mb-1">{product.name}</h3>
              <p className="text-sm text-gray-400">¥{product.marketPrice.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Log - Minimal */}
      <section className="space-y-6">
        <h2 className="text-2xl font-light">最近活动</h2>
        <div className="space-y-1">
          {activities.slice(0, 5).map((activity) => (
            <div 
              key={activity.id} 
              className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.productName}</p>
                  <p className="text-xs text-gray-400">{activity.action}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.amount && <p className="text-sm font-medium">{activity.amount}</p>}
                <p className="text-xs text-gray-400">
                  {new Date(activity.time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
