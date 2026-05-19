import { Search, ChevronLeft, ChevronRight, Trash2, ShoppingCart } from 'lucide-react';
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
  const categories = ['全部分类', '丝绸花卉', '大型绿植', '多肉植物', '硬木乔木', '稀有天南星科'];
  const isVisitor = !currentUser || currentUser.isAnonymous;
  const isEditable = !isVisitor;
  
  const [activeCat, setActiveCat] = React.useState('全部分类');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesCat = activeCat === '全部分类' || p.category === activeCat;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeCat, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on search/filter
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCat, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-md">
          <h1 className="text-4xl mb-4 font-serif">植物图库与价格列表</h1>
          <p className="text-on-surface-variant">为高端室内设计策划的高仿真植物系列。</p>
        </div>
        <div className="flex-1 max-w-xl space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索植物品种..." 
              className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-[0_10px_30px_rgba(74,93,78,0.05)] text-sm focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCat === cat ? 'bg-primary text-white shadow-md' : 'bg-surface-dim/20 text-on-surface-variant hover:bg-surface-dim/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {paginatedProducts.map((p) => (
            <div 
              key={p.id} 
              onClick={() => onSelectProduct(p.id)}
              className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(74,93,78,0.05)] cursor-pointer group hover:shadow-xl transition-all h-full flex flex-col"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                {isEditable && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteProduct(p.id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur rounded-full flex items-center justify-center text-secondary md:opacity-0 group-hover:opacity-100 transition-all hover:bg-secondary hover:text-white shadow-lg z-30 cursor-pointer pointer-events-auto"
                    data-no-export="true"
                    title="删除产品"
                  >
                    <Trash2 className="w-5 h-5 pointer-events-none" />
                  </button>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl pr-4">{p.name}</h3>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                    p.status === 'In Stock' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {p.status === 'In Stock' ? '库存充足' : '库存紧张'}
                  </div>
                </div>
                <div className="mt-auto space-y-4">
                  {!isVisitor && (
                    <div className="flex justify-between text-xs text-on-surface-variant/70 font-medium">
                      <span>成本: ¥{p.costPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium text-primary">
                    <span>市场价: ¥{p.marketPrice.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToQuote(p);
                    }}
                    className="w-full py-3 bg-primary/10 text-primary rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors group cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    添加到报价
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-on-surface-variant italic">没有找到匹配的植物品种</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="w-10 h-10 rounded-xl border border-outline-variant/30 flex items-center justify-center hover:bg-white text-on-surface-variant disabled:opacity-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-sans font-medium text-sm cursor-pointer transition-colors ${
                currentPage === i + 1 
                  ? 'bg-primary text-white' 
                  : 'border border-outline-variant/30 hover:bg-white text-on-surface-variant'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="w-10 h-10 rounded-xl border border-outline-variant/30 flex items-center justify-center hover:bg-white text-on-surface-variant disabled:opacity-20 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
