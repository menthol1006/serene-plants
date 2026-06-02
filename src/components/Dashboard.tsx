import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import heroIntegratedHomeGreenery from '../assets/hero-integrated-home-greenery.png';
import { ActivityLog, Product } from '../types';
import { User } from '../types/user';

interface DashboardProps {
  products: Product[];
  activities: ActivityLog[];
  onSelectProduct: (id: string) => void;
  onViewAll: () => void;
  onViewShowcase: () => void;
  currentUser: User | null;
}

export default function Dashboard({ products, activities, onSelectProduct, onViewAll, onViewShowcase, currentUser }: DashboardProps) {
  const isVisitor = !currentUser || currentUser.isAnonymous;
  const totalProducts = products.length;
  const avgCost = totalProducts > 0 ? products.reduce((sum, product) => sum + product.costPrice, 0) / totalProducts : 0;
  const avgMarket = totalProducts > 0 ? products.reduce((sum, product) => sum + product.marketPrice, 0) / totalProducts : 0;
  const avgMargin = avgMarket > 0 ? ((avgMarket - avgCost) / avgMarket) * 100 : 0;
  const featured = products.slice(0, 6);
  const heroProduct = products[0];

  const stats = isVisitor
    ? [
        { label: '在线植物种类', value: totalProducts.toString() },
        { label: '平均市场价', value: `¥${avgMarket.toFixed(0)}` },
      ]
    : [
        { label: '产品种类', value: totalProducts.toString() },
        { label: '平均成本', value: `¥${avgCost.toFixed(0)}` },
        { label: '平均市场价', value: `¥${avgMarket.toFixed(0)}` },
        { label: '毛利率', value: `${avgMargin.toFixed(0)}%` },
      ];

  return (
    <div className="editorial-page space-y-20">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="grid min-h-[calc(100vh-8rem)] grid-cols-1 gap-10 border-b border-faint pb-14 lg:grid-cols-12 lg:items-end"
      >
        <div className="lg:col-span-12">
          <div className="aspect-[16/7] max-h-[48vh] min-h-72 overflow-hidden bg-surface-container-low">
            <img
              src={heroIntegratedHomeGreenery}
              alt="家居仿真绿植造景"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-8">
          <p className="eyebrow mb-6">{isVisitor ? 'Curated botanical catalogue' : 'Inventory and proposal studio'}</p>
          <h1 className="display-title">
            Botanical inventory for quiet, considered interiors.
          </h1>
        </div>
        <div className="space-y-8 lg:col-span-4">
          <p className="max-w-md text-xl leading-snug text-muted">
            把春天，留在生活里。每一束花，都是对美好生活的温柔表达。无需打理，也能四季盛放。
          </p>
          <button onClick={onViewAll} className="text-link">
            查看全部产品
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>

      <section className="grid grid-cols-2 border-b border-faint md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-r border-faint px-5 py-7 last:border-r-0 md:px-8 md:py-10">
            <p className="eyebrow mb-4">{stat.label}</p>
            <p className="text-5xl font-medium leading-none md:text-7xl">{stat.value}</p>
          </div>
        ))}
      </section>

      {heroProduct && (
        <section className="grid grid-cols-1 gap-8 border-b border-faint pb-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <button onClick={onViewShowcase} className="group block w-full text-left">
              <div className="aspect-[5/4] overflow-hidden bg-surface-container-low">
                <img
                  src={heroProduct.image}
                  alt="造景展示"
                  className="h-full w-full object-cover grayscale-[18%] transition duration-700 group-hover:scale-[1.035] group-hover:grayscale-0"
                />
              </div>
            </button>
          </div>
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="eyebrow mb-5">Landscape showcase</p>
              <h2 className="text-5xl font-medium leading-none md:text-7xl">造景展示</h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                让花艺成为空间情绪的一部分，于无声处营造惊艳氛围
              </p>
              <button onClick={onViewShowcase} className="mt-8 text-link">
                进入造景展示
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-10 grid grid-cols-2 border-t border-faint">
              <div className="border-r border-faint py-6">
                <p className="eyebrow mb-3">主推单品</p>
                <button onClick={() => onSelectProduct(heroProduct.id)} className="text-left text-lg hover:text-accent">
                  {heroProduct.name}
                </button>
              </div>
              <div className="py-6 pl-6">
                <p className="eyebrow mb-3">参考单价</p>
                <p className="text-lg">¥{heroProduct.marketPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-8 border-b border-faint pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">Selected products</p>
            <h2 className="text-4xl font-medium md:text-6xl">精选产品</h2>
          </div>
          <button onClick={onViewAll} className="hidden text-link md:inline-flex">
            全部产品
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featured.map((product, index) => (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className="group text-left"
            >
              <div className={`overflow-hidden bg-surface-container-low ${index === 1 ? 'aspect-[4/5]' : 'aspect-[5/6]'}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4 border-t border-faint pt-4">
                <div>
                  <h3 className="text-2xl font-medium">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted">{product.category}</p>
                </div>
                <p className="text-sm font-semibold">¥{product.marketPrice.toFixed(0)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4">Recent activity</p>
          <h2 className="text-4xl font-medium md:text-5xl">最近活动</h2>
        </div>
        <div className="lg:col-span-8">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="grid grid-cols-1 gap-2 border-t border-faint py-5 md:grid-cols-12">
              <p className="text-lg font-medium md:col-span-4">{activity.productName}</p>
              <p className="text-muted md:col-span-5">{activity.action}</p>
              <div className="flex justify-between gap-4 md:col-span-3 md:justify-end">
                {activity.amount && <p className="font-medium">{activity.amount}</p>}
                <p className="text-sm text-muted">
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
