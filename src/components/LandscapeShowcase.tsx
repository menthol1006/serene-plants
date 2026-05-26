import { Camera, Check, Edit3, Plus, Save, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import heroInteriorFlorals from '../assets/hero-interior-florals.png';
import { LandscapeShowcaseConfig, Product } from '../types';
import { User } from '../types/user';

const SHOWCASE_COPY = '让花艺成为空间情绪的一部分，于无声处营造惊艳氛围';

interface LandscapeShowcaseProps {
  products: Product[];
  configs: LandscapeShowcaseConfig[];
  currentUser: User | null;
  onSelectProduct: (id: string) => void;
  onSaveConfig: (config: LandscapeShowcaseConfig) => Promise<void>;
  onDeleteConfig: (id: string) => Promise<void>;
}

interface DraftState {
  id: string;
  title: string;
  description: string;
  image: string;
  productIds: string[];
}

const createDraft = (products: Product[]): DraftState => ({
  id: crypto.randomUUID(),
  title: `造景方案 ${new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}`,
  description: SHOWCASE_COPY,
  image: '',
  productIds: products.slice(0, 4).map((product) => product.id),
});

export default function LandscapeShowcase({
  products,
  configs,
  currentUser,
  onSelectProduct,
  onSaveConfig,
  onDeleteConfig,
}: LandscapeShowcaseProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isAdmin = Boolean(currentUser && !currentUser.isAnonymous);
  const fallbackConfigs = React.useMemo<LandscapeShowcaseConfig[]>(() => {
    if (configs.length > 0) return configs;

    return [{
      id: 'fallback',
      title: '空间造景',
      description: SHOWCASE_COPY,
      image: heroInteriorFlorals,
      productIds: products.slice(0, 4).map((product) => product.id),
      updatedAt: new Date().toISOString(),
    }];
  }, [configs, products]);

  const [draft, setDraft] = React.useState<DraftState>(() => createDraft(products));
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isEditing && products.length > 0 && draft.productIds.length === 0) {
      setDraft(createDraft(products));
    }
  }, [draft.productIds.length, isEditing, products]);

  const draftProducts = React.useMemo(
    () => draft.productIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product)),
    [draft.productIds, products],
  );

  const draftPrice = draftProducts.reduce((sum, product) => sum + product.marketPrice, 0);

  const loadConfigIntoDraft = (config: LandscapeShowcaseConfig) => {
    setDraft({
      id: config.id,
      title: config.title,
      description: config.description,
      image: config.image,
      productIds: config.productIds,
    });
    setIsEditing(true);
  };

  const startNewConfig = () => {
    setDraft(createDraft(products));
    setIsEditing(true);
  };

  const toggleProduct = (id: string) => {
    setDraft((previous) => ({
      ...previous,
      productIds: previous.productIds.includes(id)
        ? previous.productIds.filter((productId) => productId !== id)
        : [...previous.productIds, id],
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDraft((previous) => ({ ...previous, image: reader.result as string }));
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!draft.image) {
      alert('请先上传这套造景的主图');
      return;
    }

    setIsSaving(true);
    await onSaveConfig({
      id: draft.id,
      title: draft.title || '未命名造景',
      description: draft.description || SHOWCASE_COPY,
      image: draft.image,
      productIds: draft.productIds,
      updatedAt: new Date().toISOString(),
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const productMap = React.useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const renderScene = (config: LandscapeShowcaseConfig, index: number) => {
    const selectedProducts = config.productIds
      .map((id) => productMap.get(id))
      .filter((product): product is Product => Boolean(product));
    const totalMarketPrice = selectedProducts.reduce((sum, product) => sum + product.marketPrice, 0);

    return (
      <section key={config.id} className="space-y-8 border-b border-faint pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-4">
            <div>
              <p className="eyebrow mb-5">Scene {String(index + 1).padStart(2, '0')}</p>
              <h2 className="text-5xl font-medium leading-none md:text-7xl">{config.title}</h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">{config.description}</p>
            </div>
            <div className="mt-10 grid grid-cols-2 border-t border-faint">
              <div className="border-r border-faint py-6">
                <p className="eyebrow mb-3">可用单品</p>
                <p className="text-5xl font-medium leading-none">{selectedProducts.length}</p>
              </div>
              <div className="py-6 pl-6">
                <p className="eyebrow mb-3">组合参考价</p>
                <p className="text-5xl font-medium leading-none">¥{totalMarketPrice.toFixed(0)}</p>
              </div>
            </div>
            {isAdmin && config.id !== 'fallback' && (
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => loadConfigIntoDraft(config)} className="ghost-button">
                  <Edit3 className="h-4 w-4" />
                  编辑这套
                </button>
                <button onClick={() => onDeleteConfig(config.id)} className="ghost-button">
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="aspect-[16/10] min-h-80 overflow-hidden bg-surface-container-low">
              <img
                src={config.image || heroInteriorFlorals}
                alt={config.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {selectedProducts.map((product, productIndex) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="group text-left"
              >
                <div className={`overflow-hidden bg-surface-container-low ${productIndex % 2 === 0 ? 'aspect-[4/5]' : 'aspect-[5/6]'}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-5 border-t border-faint pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-medium">{product.name}</h3>
                    <p className="text-sm font-semibold">¥{product.marketPrice.toFixed(0)}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted">{product.category}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="border-y border-faint py-10 text-muted">这套造景暂未选择搭配单品。</div>
        )}
      </section>
    );
  };

  return (
    <div className="editorial-page space-y-20">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-8 border-b border-faint pb-10 pt-8 lg:grid-cols-12 lg:items-end"
      >
        <div className="lg:col-span-7">
          <p className="eyebrow mb-4">Interior botanical styling</p>
          <h1 className="text-[52px] font-medium leading-none md:text-[78px] lg:text-[96px]">造景展示</h1>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <p className="max-w-lg text-xl leading-snug text-muted">{SHOWCASE_COPY}</p>
          {isAdmin && (
            <button onClick={startNewConfig} className="editorial-button">
              <Plus className="h-4 w-4" />
              新增造景
            </button>
          )}
        </div>
      </motion.section>

      {isAdmin && isEditing && (
        <section className="grid grid-cols-1 gap-8 border-b border-faint pb-16 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-4">
            <div>
              <p className="eyebrow mb-4">Admin composer</p>
              <h2 className="text-4xl font-medium md:text-5xl">编辑造景方案</h2>
            </div>
            <label className="block">
              <span className="eyebrow mb-2 block">方案名称</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                className="line-input text-xl"
                placeholder="例如：春日客厅花艺"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block">展示文案</span>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
                className="w-full border border-faint bg-paper-soft p-4 text-sm leading-relaxed placeholder:text-muted"
              />
            </label>
            <div className="grid grid-cols-2 border-t border-faint">
              <div className="border-r border-faint py-6">
                <p className="eyebrow mb-3">已选单品</p>
                <p className="text-5xl font-medium leading-none">{draftProducts.length}</p>
              </div>
              <div className="py-6 pl-6">
                <p className="eyebrow mb-3">参考价</p>
                <p className="text-5xl font-medium leading-none">¥{draftPrice.toFixed(0)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => fileInputRef.current?.click()} className="editorial-button">
                <Camera className="h-4 w-4" />
                上传造景图片
              </button>
              <button onClick={handleSave} className="ghost-button" disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? '保存中' : '保存造景'}
              </button>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-8">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative block w-full overflow-hidden bg-surface-container-low text-left"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="aspect-[16/9] min-h-80">
                <img
                  src={draft.image || heroInteriorFlorals}
                  alt="造景预览"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-faint bg-paper/90 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-ink">点击上传或更换这套造景图片</p>
              </div>
            </button>

            <div>
              <p className="eyebrow mb-4">选择搭配单品</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {products.map((product) => {
                  const isSelected = draft.productIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`grid grid-cols-[72px_1fr_auto] items-center gap-4 border p-3 text-left transition-colors ${
                        isSelected ? 'border-ink bg-paper-soft' : 'border-faint hover:border-ink'
                      }`}
                    >
                      <img src={product.image} alt={product.name} className="h-20 w-[72px] object-cover" />
                      <span>
                        <span className="block text-lg font-medium">{product.name}</span>
                        <span className="mt-1 block text-sm text-muted">{product.category}</span>
                      </span>
                      <span className={`flex h-7 w-7 items-center justify-center border ${isSelected ? 'border-ink bg-ink text-paper' : 'border-faint text-transparent'}`}>
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-20">
        {fallbackConfigs.map((config, index) => renderScene(config, index))}
      </div>
    </div>
  );
}
