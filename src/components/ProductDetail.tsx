import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Save, ShoppingCart } from 'lucide-react';
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
    console.log('💾 保存产品:', editedProduct);
    onSave(editedProduct);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个产品吗？')) {
      onDelete(product.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {!isVisitor && (
          <div className="flex gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  快速编辑
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  详细编辑
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-12">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Product Info */}
      <div className="space-y-8">
        {/* Name & Category */}
        <div className="space-y-2">
          {isEditing ? (
            <input
              type="text"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
              className="text-4xl font-light w-full border-b border-gray-200 pb-2 focus:outline-none focus:border-black"
            />
          ) : (
            <h1 className="text-4xl font-light">{product.name}</h1>
          )}
          <p className="text-gray-400">{product.category}</p>
        </div>

        {/* Price Section */}
        <div className="grid grid-cols-2 gap-6">
          {!isVisitor && (
            <div className="p-6 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-400 mb-1">成本价格</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProduct.costPrice}
                  onChange={(e) => setEditedProduct({ ...editedProduct, costPrice: Number(e.target.value) })}
                  className="text-2xl font-light w-full bg-transparent focus:outline-none"
                />
              ) : (
                <p className="text-2xl font-light">¥{product.costPrice.toFixed(0)}</p>
              )}
            </div>
          )}
          <div className="p-6 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-400 mb-1">{isVisitor ? '销售价格' : '市场价格'}</p>
            {isEditing ? (
              <input
                type="number"
                value={editedProduct.marketPrice}
                onChange={(e) => setEditedProduct({ ...editedProduct, marketPrice: Number(e.target.value) })}
                className="text-2xl font-light w-full bg-transparent focus:outline-none"
              />
            ) : (
              <p className="text-2xl font-light">¥{product.marketPrice.toFixed(0)}</p>
            )}
          </div>
        </div>

        {/* Add to Quote Button */}
        <div className="pt-4">
          <button
            onClick={() => onAddToQuote(product)}
            className="w-full py-4 bg-primary text-white rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            添加到报价单
          </button>
        </div>

        {/* Details */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-sm text-gray-400 uppercase tracking-wider">产品详情</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">材质</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProduct.material}
                  onChange={(e) => setEditedProduct({ ...editedProduct, material: e.target.value })}
                  className="w-full py-1 border-b border-gray-200 focus:outline-none focus:border-black"
                />
              ) : (
                <p className="mt-1">{product.material}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400">供应商</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProduct.supplier}
                  onChange={(e) => setEditedProduct({ ...editedProduct, supplier: e.target.value })}
                  className="w-full py-1 border-b border-gray-200 focus:outline-none focus:border-black"
                />
              ) : (
                <p className="mt-1">{product.supplier}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400">SKU</p>
              <p className="mt-1">{product.sku}</p>
            </div>
            <div>
              <p className="text-gray-400">库存状态</p>
              {isEditing ? (
                <select
                  value={editedProduct.status}
                  onChange={(e) => setEditedProduct({ ...editedProduct, status: e.target.value as any })}
                  className="w-full py-1 border-b border-gray-200 focus:outline-none focus:border-black bg-transparent"
                >
                  <option value="In Stock">有货</option>
                  <option value="Low Stock">低库存</option>
                  <option value="Out of Stock">缺货</option>
                </select>
              ) : (
                <p className="mt-1">{product.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-sm text-gray-400 uppercase tracking-wider">描述</h3>
          {isEditing ? (
            <textarea
              value={editedProduct.description}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
              className="w-full h-32 p-4 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
