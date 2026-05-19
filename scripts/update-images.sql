-- 产品图片更新脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- 使用方法：复制以下内容到 Supabase -> SQL Editor -> Run

-- 国内可访问的产品图片 URL
UPDATE products SET image = 'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '1';
UPDATE products SET image = 'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '2';
UPDATE products SET image = 'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '3';
UPDATE products SET image = 'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '4';
UPDATE products SET image = 'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600' WHERE id = '5';

-- 如果想给所有产品随机分配图片，使用以下脚本：
-- UPDATE products SET image = 
--   CASE (RANDOM() * 5)::int
--     WHEN 0 THEN 'https://img1.baidu.com/it/u=3892940927,2494704274&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
--     WHEN 1 THEN 'https://img2.baidu.com/it/u=2436975488,4263995780&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
--     WHEN 2 THEN 'https://img1.baidu.com/it/u=2072520014,3880287849&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
--     WHEN 3 THEN 'https://img1.baidu.com/it/u=1393827213,3994754569&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
--     WHEN 4 THEN 'https://img2.baidu.com/it/u=2808363011,1246026832&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=600'
--   END;
