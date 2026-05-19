-- 产品图片更新脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 百度图片 CDN（国内可访问）
UPDATE products 
SET image = 'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
WHERE id = '1';

UPDATE products 
SET image = 'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
WHERE id = '2';

UPDATE products 
SET image = 'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
WHERE id = '3';

UPDATE products 
SET image = 'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
WHERE id = '4';

UPDATE products 
SET image = 'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
WHERE id = '5';

-- 如果产品 ID 不同，可以根据名称更新
-- UPDATE products 
-- SET image = 'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
-- WHERE name = '北欧丝绒玫瑰';
