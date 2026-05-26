import { ArrowLeft, CreditCard, Download, Loader2, Trash2 } from 'lucide-react';
import React from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { Product } from '../types';
import { User } from '../types/user';

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
      const dataUrl = await toPng(quoteRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#f4efe7',
        filter: (node) => !(node instanceof HTMLElement) || node.getAttribute('data-no-export') !== 'true',
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`报价单_${isCustomerView ? '客户版' : '内部版'}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF 生成失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="editorial-page space-y-12">
      <section className="grid grid-cols-1 gap-8 border-b border-faint pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow mb-5">Proposal studio</p>
          <h1 className="text-[48px] font-medium leading-none md:text-[86px]">客户报价清单</h1>
        </div>
        <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end lg:justify-end">
          {!isVisitor && (
            <button
              onClick={() => setIsCustomerView(!isCustomerView)}
              className={isCustomerView ? 'editorial-button' : 'ghost-button'}
            >
              {isCustomerView ? '当前：客户视图' : '当前：内部视图'}
            </button>
          )}
          <button onClick={onNavigateToGallery} className="text-link">
            <ArrowLeft className="h-4 w-4" />
            继续添加产品
          </button>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="grid min-h-[48vh] place-items-center border-y border-faint py-20 text-center">
          <div>
            <CreditCard className="mx-auto mb-6 h-12 w-12 text-accent" />
            <h2 className="text-4xl font-medium">报价单目前是空的</h2>
            <button onClick={onNavigateToGallery} className="editorial-button mt-8">
              浏览产品图库
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button onClick={handleExport} disabled={isExporting} className="editorial-button disabled:opacity-50">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isCustomerView ? '导出客户版 PDF' : '导出内部版 PDF'}
            </button>
          </div>

          <div ref={quoteRef} className="bg-paper p-2">
            <div className="border border-faint bg-paper-soft p-6 md:p-10">
              <div className="grid grid-cols-1 gap-8 border-b border-faint pb-10 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <p className="eyebrow mb-4">Serene Botanical</p>
                  <h2 className="text-5xl font-medium leading-none md:text-7xl">Proposal & Order Summary</h2>
                </div>
                <div className="text-sm text-muted lg:col-span-4 lg:text-right">
                  <p>日期：{new Date().toLocaleDateString('zh-CN')}</p>
                  <p className="mt-2 uppercase tracking-[0.12em]">NO. {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10 pt-10 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  {items.map((item) => (
                    <div key={item.product.id} className="grid grid-cols-1 gap-5 border-b border-faint py-6 md:grid-cols-12 md:items-center">
                      <div className="md:col-span-2">
                        <div className="aspect-square overflow-hidden bg-surface-container-low">
                          <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                        </div>
                      </div>
                      <div className="md:col-span-5">
                        <h3 className="text-2xl font-medium">{item.product.name}</h3>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{item.product.category}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm md:col-span-5 md:text-right">
                        <div>
                          <p className="eyebrow mb-2">单价</p>
                          <p>¥{item.product.marketPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-2">数量</p>
                          <p>{item.quantity}</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-2">小计</p>
                          <p className="font-medium">¥{(item.product.marketPrice * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => onRemove(item.product.id)}
                            className="mt-3 inline-flex text-accent"
                            data-no-export="true"
                            aria-label="移除产品"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="lg:col-span-4">
                  <div className="sticky top-24 border border-ink bg-ink p-7 text-paper">
                    <p className="eyebrow mb-8 text-paper/60">报价总计</p>
                    <div className="space-y-5">
                      <div className="flex justify-between">
                        <span className="text-paper/70">项目总数</span>
                        <span>{items.length} 个品种</span>
                      </div>
                      <label className="flex items-center justify-between gap-5 border-t border-paper/15 pt-5">
                        <span className="text-paper/70">运输费用</span>
                        <input
                          type="number"
                          value={shippingFee || ''}
                          onChange={(event) => setShippingFee(parseFloat(event.target.value) || 0)}
                          className="w-24 border-b border-paper/25 bg-transparent text-right focus:border-paper"
                          placeholder="0.00"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-5 border-t border-paper/15 pt-5">
                        <span className="text-paper/70">安装费用</span>
                        <input
                          type="number"
                          value={installationFee || ''}
                          onChange={(event) => setInstallationFee(parseFloat(event.target.value) || 0)}
                          className="w-24 border-b border-paper/25 bg-transparent text-right focus:border-paper"
                          placeholder="0.00"
                        />
                      </label>
                      {!isCustomerView && (
                        <div className="flex justify-between border-t border-paper/15 pt-5">
                          <span className="text-paper/70">预计成本</span>
                          <span>¥{totalCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-paper/15 pt-7">
                        <p className="text-xs uppercase tracking-[0.16em] text-paper/60">最终报价总额</p>
                        <p className="mt-3 text-5xl font-medium leading-none">¥{totalMarket.toFixed(2)}</p>
                      </div>
                      {!isCustomerView && (
                        <div className="flex justify-between border-t border-paper/15 pt-5">
                          <span className="text-paper/70">综合毛利率</span>
                          <span>{totalMargin.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-16 grid grid-cols-1 gap-8 border-t border-faint pt-8 md:grid-cols-2">
                <div>
                  <p className="eyebrow mb-4">我们的承诺</p>
                  <p className="max-w-md text-sm leading-relaxed text-muted">
                    提供高标准仿真植物方案，关注质感、空间比例与长期耐用性，为办公及生活空间带来自然秩序。
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-2xl font-medium">Serene Botanical</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Official Quote</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
