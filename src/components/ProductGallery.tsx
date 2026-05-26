import { ArrowUpRight, ChevronLeft, ChevronRight, Search, ShoppingCart, Trash2 } from 'lucide-react';
import React from 'react';
import { Product } from '../types';
import { User } from '../types/user';

interface ProductGalleryProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddToQuote: (product: Product) => void;
  currentUser: User | null;
}

export default function ProductGallery({ products, onSelectProduct, onDeleteProduct, onAddToQuote, currentUser }: ProductGalleryProps) {
  const categories = ['全部分类', '丝绸花卉', '干花', '大型绿植', '多肉植物', '硬木乔木', '稀有天南星科'];
  const isVisitor = !currentUser || currentUser.isAnonymous;
  const isEditable = !isVisitor;

  const [activeCat, setActiveCat] = React.useState('全部分类');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesCat = activeCat === '全部分类' || product.category === activeCat;
      const query = searchQuery.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [products, activeCat, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCat, searchQuery]);

  return (
    <div className="editorial-page space-y-12">
      <section className="grid grid-cols-1 gap-10 border-b border-faint pb-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5">Plant catalogue</p>
          <h1 className="text-[48px] font-medium leading-[0.98] md:text-[86px]">植物图库与价格列表</h1>
        </div>
        <div className="space-y-6 lg:col-span-5 lg:self-end">
          <p className="max-w-lg text-lg leading-relaxed text-muted">为高端室内设计策划的高仿真植物系列，保留原有价格、库存与报价功能。</p>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索植物品种"
              className="line-input pl-8"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto border-b border-faint pb-5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCat(category)}
            className={`whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
              activeCat === category
                ? 'border-ink bg-ink text-paper'
                : 'border-faint text-muted hover:border-ink hover:text-ink'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {paginatedProducts.map((product) => (
            <article key={product.id} className="group flex h-full flex-col">
              <button onClick={() => onSelectProduct(product.id)} className="block w-full text-left">
                <div className="aspect-[4/5] overflow-hidden bg-surface-container-low">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </button>
              <div className="mt-5 flex flex-1 flex-col border-t border-faint pt-4">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <button onClick={() => onSelectProduct(product.id)} className="text-left">
                      <h3 className="text-3xl font-medium leading-tight">{product.name}</h3>
                    </button>
                    <p className="mt-2 text-sm text-muted">{product.category} / {product.material}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 text-muted transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                </div>
                <div className="mt-5 grid grid-cols-3 border-t border-faint pt-4 text-sm">
                  {!isVisitor && (
                    <div>
                      <p className="eyebrow mb-2">成本</p>
                      <p>¥{product.costPrice.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-2">市场价</p>
                    <p>¥{product.marketPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-2">状态</p>
                    <p>{product.status === 'In Stock' ? '库存充足' : product.status === 'Low Stock' ? '库存紧张' : '缺货'}</p>
                  </div>
                </div>
                <div className="mt-auto flex gap-3 pt-5">
                  <button
                    onClick={() => onAddToQuote(product)}
                    className="editorial-button flex-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    加入报价
                  </button>
                  {isEditable && (
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="ghost-button px-4"
                      title="删除产品"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-y border-faint py-24 text-center text-muted">没有找到匹配的植物品种</div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-faint pt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="ghost-button px-4 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`h-10 w-10 border text-sm font-semibold ${
                currentPage === index + 1 ? 'border-ink bg-ink text-paper' : 'border-faint text-muted hover:border-ink'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="ghost-button px-4 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
