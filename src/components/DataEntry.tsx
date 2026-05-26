import { Camera, ChevronDown, TrendingUp } from 'lucide-react';
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
    const cost = parseFloat(costInput);
    const market = parseFloat(marketInput);
    if (!cost || !market || market <= 0) return null;
    return ((market - cost) / market) * 100;
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((previous) => ({ ...previous, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const updateField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className="editorial-page space-y-12">
      <section className="grid grid-cols-1 gap-8 border-b border-faint pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow mb-5">Product entry</p>
          <h1 className="text-[48px] font-medium leading-none md:text-[86px]">
            {initialData ? '编辑植物信息' : '新增绿植录入'}
          </h1>
        </div>
        <div className="flex items-end gap-3 lg:col-span-4 lg:justify-end">
          <button onClick={onCancel} className="ghost-button">
            取消
          </button>
          <button onClick={handleSave} className="editorial-button">
            保存产品
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <section className="space-y-8 lg:col-span-7">
          <div className="border-b border-faint pb-8">
            <h2 className="mb-8 text-3xl font-medium">基本信息</h2>
            <div className="space-y-7">
              <label className="block">
                <span className="eyebrow mb-2 block">植物名称</span>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="例如：琴叶榕 标准型"
                  className="line-input text-lg"
                />
              </label>

              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <label className="block">
                  <span className="eyebrow mb-2 block">分类</span>
                  <span className="relative block">
                    <select
                      value={formData.category}
                      onChange={(event) => updateField('category', event.target.value)}
                      className="line-input appearance-none"
                    >
                      <option>请选择分类</option>
                      <option>丝绸花卉</option>
                      <option>干花</option>
                      <option>大型绿植</option>
                      <option>多肉植物</option>
                      <option>硬木乔木</option>
                      <option>稀有天南星科</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  </span>
                </label>
                <label className="block">
                  <span className="eyebrow mb-2 block">材质</span>
                  <input
                    type="text"
                    value={formData.material || ''}
                    onChange={(event) => updateField('material', event.target.value)}
                    placeholder="例如：环保树脂"
                    className="line-input"
                  />
                </label>
              </div>

              <label className="block">
                <span className="eyebrow mb-2 block">供应商</span>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(event) => updateField('supplier', event.target.value)}
                  placeholder="例如：翡翠苗圃有限公司"
                  className="line-input"
                />
              </label>
            </div>
          </div>

          <div className="border-b border-faint pb-8">
            <h2 className="mb-8 text-3xl font-medium">描述</h2>
            <label className="block">
              <span className="eyebrow mb-2 block">内部备注与特征</span>
              <textarea
                rows={7}
                value={formData.description || ''}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="记录具体规格、质感、适用场景或报价备注"
                className="w-full border border-faint bg-paper-soft p-4 text-sm leading-relaxed placeholder:text-muted"
              />
            </label>
          </div>
        </section>

        <aside className="space-y-8 lg:col-span-5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative block aspect-[4/5] w-full overflow-hidden border border-faint bg-paper-soft text-left"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.image ? (
              <img src={formData.image} alt="Preview" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 border-t border-faint bg-paper/90 p-6 backdrop-blur">
              <Camera className="mb-4 h-6 w-6 text-accent" />
              <h3 className="text-2xl font-medium">{formData.image ? '更换植物照片' : '上传视觉资料'}</h3>
              <p className="mt-2 text-sm text-muted">点击浏览文件，支持 PNG / JPG。</p>
            </div>
          </button>

          <section className="border-y border-faint py-8">
            <h2 className="mb-8 text-3xl font-medium">财务信息</h2>
            <div className="space-y-7">
              <label className="block">
                <span className="eyebrow mb-2 block">成本价 ¥</span>
                <input
                  type="text"
                  value={costInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) setCostInput(value);
                  }}
                  placeholder="0.00"
                  className="line-input text-2xl font-medium"
                />
              </label>
              <label className="block">
                <span className="eyebrow mb-2 block text-accent">市场价 ¥</span>
                <input
                  type="text"
                  value={marketInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) setMarketInput(value);
                  }}
                  placeholder="0.00"
                  className="line-input text-3xl font-medium text-accent"
                />
              </label>
              <div className="flex items-center justify-between border-t border-faint pt-6">
                <div>
                  <p className="eyebrow mb-2">毛利率</p>
                  <p className={`text-4xl font-medium ${margin !== null && margin < 0 ? 'text-accent' : 'text-ink'}`}>
                    {margin !== null ? `${margin.toFixed(1)}%` : '--%'}
                  </p>
                </div>
                <TrendingUp className="h-7 w-7 text-accent" />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
