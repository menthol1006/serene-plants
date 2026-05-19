import { Trash2, ArrowLeft, Download, CreditCard, Loader2 } from 'lucide-react';
import React from 'react';
import { Product } from '../types';
import { User } from '../types/user';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

interface QuotesProps {
  items: { product: Product; quantity: number }[];
  onRemove: (id: string) => void;
  onNavigateToGallery: () => void;
  currentUser: User | null;
}

export default function Quotes({ items, onRemove, onNavigateToGallery, currentUser }: QuotesProps) {
  const isVisitor = !currentUser || currentUser.isAnonymous;
  const quoteRef = React.useRef<HTMLDivElement>(null);
  const [isCustomerView, setIsCustomerView] = React.useState(isVisitor);
  const [isExporting, setIsExporting] = React.useState(false);

  const [shippingFee, setShippingFee] = React.useState<number>(0);
  const [installationFee, setInstallationFee] = React.useState<number>(0);

  const totalCost = items.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
  const itemsTotalMarket = items.reduce((sum, item) => sum + item.product.marketPrice * item.quantity, 0);
  const totalMarket = itemsTotalMarket + shippingFee + installationFee;
  const totalMargin = totalMarket > 0 ? ((totalMarket - totalCost) / totalMarket) * 100 : 0;

  const handleExport = async () => {
    if (!quoteRef.current || isExporting) return;
    
    try {
      setIsExporting(true);
      
      const element = quoteRef.current;
      
      // Use html-to-image which handles modern CSS (oklch/oklab) much better than html2canvas
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#D6D6CC', // Match the surface-dim color
        filter: (node) => {
          // Equivalent of data-no-export
          if (node instanceof HTMLElement) {
            return node.getAttribute('data-no-export') !== 'true';
          }
          return true;
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4' // Use standard A4
      });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`报价单_${isCustomerView ? '客户版' : '内部版'}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF 生成失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl mb-2 font-serif italic">客户报价清单</h1>
          <p className="text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">Proposal & Order Summary &bull; Serene Botanical</p>
        </div>
        <div className="flex gap-4">
          {!isVisitor && (
            <button 
              onClick={() => setIsCustomerView(!isCustomerView)}
              className={`px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                isCustomerView ? 'bg-secondary text-white shadow-lg' : 'bg-surface-dim/20 text-on-surface-variant'
              }`}
            >
              {isCustomerView ? '当前：客户视图' : '当前：内部视图'}
            </button>
          )}
          <button 
            onClick={onNavigateToGallery}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> 继续添加产品
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[48px] p-24 text-center border-2 border-dashed border-outline-variant/30">
          <CreditCard className="w-16 h-16 text-primary/20 mx-auto mb-6" />
          <h2 className="text-2xl mb-4 font-serif italic text-primary/60">您的报价单目前是空的</h2>
          <button 
            onClick={onNavigateToGallery}
            className="px-8 py-3 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            浏览产品图库
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Action Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="px-10 py-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest font-bold group cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              )}
              {isCustomerView ? '导出客户版 PDF' : '导出内部版 PDF'}
            </button>
          </div>

          {/* Exportable Content Container */}
          <div ref={quoteRef} className="bg-surface-dim p-12 rounded-[60px] border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="mb-12 flex justify-between items-start">
              <div>
                <h2 className="text-4xl mb-2 font-serif italic text-primary">Serene Botanical</h2>
                <p className="text-on-surface-variant uppercase tracking-widest text-sm font-bold">专业仿真植物方案报价单</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-on-surface-variant font-medium">日期: {new Date().toLocaleDateString()}</p>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">NO. {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Order List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-outline-variant/10 flex items-center gap-6 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-serif italic text-primary">{item.product.name}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">{item.product.category}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">单价: ¥{item.product.marketPrice.toFixed(2)}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">数量: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-lg font-sans font-medium text-primary">¥{(item.product.marketPrice * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => onRemove(item.product.id)}
                        className="p-2 text-on-surface-variant hover:text-secondary hover:bg-neutral-bone rounded-full transition-colors flex items-center justify-center"
                        data-no-export="true"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Table Summary */}
              <div className="space-y-6">
                <section className="bg-primary text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold opacity-60 mb-8">报价总计</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium opacity-70">项目总数</span>
                      <span className="text-xl font-medium">{items.length} 个品种</span>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                        <span className="text-xs font-medium opacity-70">运输费用</span>
                        <input 
                          type="number" 
                          value={shippingFee || ''} 
                          onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-b border-white/20 w-20 text-right font-sans focus:border-white outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                        <span className="text-xs font-medium opacity-70">安装费用</span>
                        <input 
                          type="number" 
                          value={installationFee || ''} 
                          onChange={(e) => setInstallationFee(parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-b border-white/20 w-20 text-right font-sans focus:border-white outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {!isCustomerView && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium opacity-70">预估成本</span>
                        <span className="text-xl font-medium">¥{totalCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-[1px] bg-white/10 w-full" />
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest opacity-60">最终报价总额</p>
                      <p className="text-5xl font-sans font-medium tracking-tighter">¥{totalMarket.toFixed(2)}</p>
                    </div>
                    {!isCustomerView && (
                      <div className="flex justify-between items-center pt-4">
                        <span className="text-xs uppercase tracking-widest opacity-60">综合毛利率</span>
                        <span className="text-lg font-bold text-white bg-white/10 px-3 py-1 rounded-full">{totalMargin.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </section>
                
                <div className="p-6 bg-white rounded-3xl border border-outline-variant/10 text-xs text-on-surface-variant leading-relaxed">
                  <p className="font-bold mb-2 uppercase tracking-widest opacity-60">报价细则</p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>所有报价已包含增值税</li>
                    <li>物流及配送费用另计</li>
                    <li>本报价单有效期 30 天</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-12 border-t border-outline-variant/20 grid grid-cols-2 gap-12">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-6">我们的承诺</p>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">提供业界最高标准的仿真植物，细节考究，环保耐用。我们专注于为您的办公及生活空间带来自然美感。</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif italic text-primary mb-2">Serene Botanical</p>
                <div className="mt-8 opacity-20">
                  {/* Decorative stamp-like element */}
                  <div className="inline-block border-4 border-current rounded-full p-4 rotate-12">
                    <span className="text-xs font-bold text-primary uppercase">Official Quote</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
