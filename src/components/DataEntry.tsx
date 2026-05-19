import { motion } from 'motion/react';
import { Camera, ChevronDown, TrendingUp, X } from 'lucide-react';
import React from 'react';
import { Product } from '../types';

interface DataEntryProps {
  initialData?: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export default function DataEntry({ initialData, onSave, onCancel }: DataEntryProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = React.useState<Partial<Product>>(initialData || {
    name: '',
    category: '请选择分类',
    material: '',
    supplier: '',
    description: '',
    costPrice: 0,
    marketPrice: 0,
  });

  const [costInput, setCostInput] = React.useState<string>(initialData?.costPrice?.toString() || '');
  const [marketInput, setMarketInput] = React.useState<string>(initialData?.marketPrice?.toString() || '');

  const margin = React.useMemo(() => {
    const c = parseFloat(costInput);
    const m = parseFloat(marketInput);
    if (!c || !m || m <= 0) return null;
    return ((m - c) / m) * 100;
  }, [costInput, marketInput]);

  const handleSave = () => {
    if (!formData.name) {
      alert('请输入植物名称');
      return;
    }
    onSave({
      ...formData,
      costPrice: parseFloat(costInput) || 0,
      marketPrice: parseFloat(marketInput) || 0,
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl mb-2">{initialData ? '编辑植物信息' : '新增绿植录入'}</h1>
          <p className="text-on-surface-variant">请输入该新植物资产的相关详细规格。</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="px-8 py-2.5 border border-primary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-10 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all active:scale-95 cursor-pointer"
          >
            保存产品
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Basic Info */}
          <section className="bg-white p-8 rounded-3xl shadow-[0_10px_30px_rgba(74,93,78,0.05)] space-y-8">
            <h2 className="text-2xl">基本信息</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">植物名称</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：琴叶榕 '标准型'" 
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm placeholder:text-outline-variant"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">分类</label>
                  <div className="relative">
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm appearance-none"
                    >
                      <option>请选择分类</option>
                      <option>丝绸花卉</option>
                      <option>大型绿植</option>
                      <option>多肉植物</option>
                      <option>硬木乔木</option>
                      <option>稀有天南星科</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">材质</label>
                  <input 
                    type="text" 
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="例如：红陶" 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">供应商</label>
                <input 
                  type="text" 
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="例如：翠绿苗圃有限公司" 
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm placeholder:text-outline-variant"
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white p-8 rounded-3xl shadow-[0_10px_30px_rgba(74,93,78,0.05)] space-y-8">
            <h2 className="text-2xl">描述</h2>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">内部备注与特征</label>
              <textarea 
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="记录具体的养护说明、土壤pH值要求或审美特征..." 
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm placeholder:text-outline-variant resize-none"
              />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Upload (Static in this prototype) */}
          <section 
            onClick={handleImageClick}
            className="group bg-white p-12 rounded-3xl border-2 border-dashed border-outline-variant/30 hover:border-primary/40 transition-colors cursor-pointer text-center space-y-6 overflow-hidden relative"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            {formData.image ? (
              <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
            ) : null}
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 relative z-10">
              <Camera className="text-primary w-8 h-8" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl mb-1">{formData.image ? '更换植物照片' : '上传视觉资料'}</h3>
              <p className="text-on-surface-variant text-sm px-8">拖拽植物照片至此或点击浏览文件</p>
              <p className="text-[10px] text-outline-variant mt-6 uppercase tracking-widest font-bold">支持 PNG, JPG 格式，最大 10MB</p>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white p-8 rounded-3xl shadow-[0_10px_30px_rgba(74,93,78,0.05)] space-y-8">
            <h2 className="text-2xl">财务信息</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">成本价 (¥)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">¥</span>
                  <input 
                    type="text" 
                    value={costInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) setCostInput(val);
                    }}
                    placeholder="0.00" 
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 pl-10 text-sm font-sans font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary block mb-2">市场价 (¥) - 请手动输入</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">¥</span>
                  <input 
                    type="text" 
                    value={marketInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) setMarketInput(val);
                    }}
                    placeholder="0.00" 
                    className="w-full bg-white border-2 border-primary/20 rounded-xl p-4 pl-10 text-xl font-sans font-bold text-primary focus:border-primary shadow-sm"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant/70 italic mt-2">* 最终销售价格将基于此数值计算</p>
              </div>

              <div className="pt-6 border-t border-outline-variant/10">
                <div className="flex justify-between items-center bg-primary-container/10 p-5 rounded-2xl">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">毛利率</label>
                    <p className={`text-2xl font-sans font-bold mt-1 ${margin && margin < 0 ? 'text-secondary' : 'text-primary'}`}>
                      {margin !== null ? `${margin.toFixed(1)}%` : '--%'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <TrendingUp className="text-primary w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
