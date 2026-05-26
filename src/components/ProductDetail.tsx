import { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Save, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { User } from '../types/user';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onAddToQuote: (product: Product) => void;
  currentUser: User | null;
}

export default function ProductDetail({ product, onClose, onSave, onDelete, onEdit, onAddToQuote, currentUser }: ProductDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const isVisitor = !currentUser || currentUser.isAnonymous;

  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  const handleSave = () => {
    onSave(editedProduct);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个产品吗？')) {
      onDelete(product.id);
    }
  };

  return (
    <div className="editorial-page space-y-10">
      <div className="flex flex-col justify-between gap-6 border-b border-faint pb-6 md:flex-row md:items-center">
        <button onClick={onClose} className="text-link w-fit">
          <ArrowLeft className="h-4 w-4" />
          返回图库
        </button>

        {!isVisitor && (
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <button onClick={handleSave} className="editorial-button">
                <Save className="h-4 w-4" />
                保存
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="ghost-button">
                  <Edit2 className="h-4 w-4" />
                  快速编辑
                </button>
                <button onClick={onEdit} className="editorial-button">
                  详细编辑
                </button>
              </>
            )}
            <button onClick={handleDelete} className="ghost-button text-accent">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="sticky top-24 overflow-hidden bg-surface-container-low">
            <img src={product.image} alt={product.name} className="h-full max-h-[760px] w-full object-cover" />
          </div>
        </div>

        <div className="space-y-10 lg:col-span-5">
          <div>
            <p className="eyebrow mb-5">{product.category}</p>
            {isEditing ? (
              <input
                type="text"
                value={editedProduct.name}
                onChange={(event) => setEditedProduct({ ...editedProduct, name: event.target.value })}
                className="w-full border-b border-faint bg-transparent pb-4 text-5xl font-medium leading-none md:text-7xl"
              />
            ) : (
              <h1 className="text-5xl font-medium leading-none md:text-7xl">{product.name}</h1>
            )}
            <p className="mt-8 text-lg leading-relaxed text-muted">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 border-y border-faint">
            {!isVisitor && (
              <div className="border-r border-faint py-6 pr-6">
                <p className="eyebrow mb-3">成本价</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedProduct.costPrice}
                    onChange={(event) => setEditedProduct({ ...editedProduct, costPrice: Number(event.target.value) })}
                    className="w-full bg-transparent text-3xl font-medium"
                  />
                ) : (
                  <p className="text-3xl font-medium">¥{product.costPrice.toFixed(0)}</p>
                )}
              </div>
            )}
            <div className="py-6 pl-6">
              <p className="eyebrow mb-3">{isVisitor ? '销售价' : '市场价'}</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProduct.marketPrice}
                  onChange={(event) => setEditedProduct({ ...editedProduct, marketPrice: Number(event.target.value) })}
                  className="w-full bg-transparent text-3xl font-medium"
                />
              ) : (
                <p className="text-3xl font-medium">¥{product.marketPrice.toFixed(0)}</p>
              )}
            </div>
          </div>

          <button onClick={() => onAddToQuote(product)} className="editorial-button w-full">
            <ShoppingCart className="h-4 w-4" />
            加入报价单
          </button>

          <div className="space-y-0">
            <p className="eyebrow mb-4">产品详情</p>
            {[
              ['材质', product.material, 'material'],
              ['供应商', product.supplier, 'supplier'],
              ['SKU', product.sku, 'sku'],
              ['库存状态', product.status, 'status'],
            ].map(([label, value, key]) => (
              <div key={key} className="grid grid-cols-3 border-t border-faint py-4 text-sm">
                <p className="text-muted">{label}</p>
                <div className="col-span-2">
                  {isEditing && key !== 'sku' ? (
                    key === 'status' ? (
                      <select
                        value={editedProduct.status}
                        onChange={(event) => setEditedProduct({ ...editedProduct, status: event.target.value as Product['status'] })}
                        className="w-full bg-transparent"
                      >
                        <option value="In Stock">有货</option>
                        <option value="Low Stock">低库存</option>
                        <option value="Out of Stock">缺货</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={String(editedProduct[key as keyof Product] || '')}
                        onChange={(event) => setEditedProduct({ ...editedProduct, [key]: event.target.value })}
                        className="w-full bg-transparent"
                      />
                    )
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="border-t border-faint pt-6">
              <p className="eyebrow mb-4">描述</p>
              <textarea
                value={editedProduct.description}
                onChange={(event) => setEditedProduct({ ...editedProduct, description: event.target.value })}
                className="min-h-36 w-full border border-faint bg-paper-soft p-4 text-sm leading-relaxed"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
