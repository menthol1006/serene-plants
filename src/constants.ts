import { ActivityLog, Product } from './types';

// 使用 Picsum Photos 作为图片源
const PRODUCT_IMAGES = [
  'https://picsum.photos/seed/rose/800/600',
  'https://picsum.photos/seed/monstera/800/600',
  'https://picsum.photos/seed/fiddle/800/600',
  'https://picsum.photos/seed/succulent/800/600',
  'https://picsum.photos/seed/tree/800/600',
  'https://picsum.photos/seed/flower/800/600',
  'https://picsum.photos/seed/plant/800/600',
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '北欧丝绒玫瑰',
    category: '丝绸花卉',
    material: '高级丝绸 / 聚合物',
    supplier: '翡翠苗圃有限公司',
    description: '具有深红色的色调和天鹅绒般的质感。',
    costPrice: 45.00,
    marketPrice: 189.00,
    stock: 120,
    image: PRODUCT_IMAGES[0],
    status: 'In Stock',
    sku: 'PE-ROSE-001'
  },
  {
    id: '2',
    name: '特级龟背竹叶',
    category: '稀有天南星科',
    material: '耐用聚乙烯',
    supplier: '热带绿植行',
    description: '巨大的分瓣叶片，具有极高的装饰性。',
    costPrice: 85.00,
    marketPrice: 245.00,
    stock: 45,
    image: PRODUCT_IMAGES[1],
    status: 'In Stock',
    sku: 'PE-MONS-002'
  },
  {
    id: '3',
    name: '琴叶榕大型盆栽',
    category: '大型绿植',
    material: '涂层织物 / 环保塑料',
    supplier: '艺境花卉',
    description: '经典的室内装饰绿植，形态优美。',
    costPrice: 120.00,
    marketPrice: 480.00,
    stock: 8,
    image: PRODUCT_IMAGES[2],
    status: 'Low Stock',
    sku: 'PE-FIG-003'
  },
  {
    id: '4',
    name: '荒漠宝石多肉',
    category: '多肉植物',
    material: '柔性树脂',
    supplier: '沙地园艺',
    description: '紧凑的莲座状结构，呈现出迷人的灰绿色。',
    costPrice: 12.50,
    marketPrice: 98.00,
    stock: 2,
    image: PRODUCT_IMAGES[3],
    status: 'Out of Stock',
    sku: 'PE-SUCC-004'
  },
  {
    id: '5',
    name: '香樟木景观树',
    category: '硬木乔木',
    material: '真实原木杆 / 聚酰亚胺叶片',
    supplier: '艺境花卉',
    description: '真实触感的树皮，经久耐用。',
    costPrice: 350.50,
    marketPrice: 1200.00,
    stock: 45,
    image: PRODUCT_IMAGES[4],
    status: 'In Stock',
    sku: 'PE-ROOT-005'
  }
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  {
    id: '1',
    productName: '北欧丝绒玫瑰',
    action: '已添加库存',
    amount: '+ ¥2,268.00',
    time: new Date(Date.now() - 7200000).toISOString(),
    type: 'inventory'
  },
  {
    id: '2',
    productName: '特级龟背竹叶',
    action: '手动调整了市场参考价',
    time: new Date(Date.now() - 18000000).toISOString(),
    type: 'price'
  },
  {
    id: '3',
    productName: '荒漠宝石多肉',
    action: '低库存警报 - 剩余 12 单位',
    time: new Date(Date.now() - 86400000).toISOString(),
    type: 'alert'
  }
];
