# 部署到 Vercel 指南

## 第一步：初始化 Git 仓库

在项目根目录下运行：

```bash
git init
git add .
git commit -m "Initial commit"
```

## 第二步：推送到 GitHub

1. 在 GitHub 上创建一个新仓库
2. 然后运行：

```bash
git remote add origin <你的GitHub仓库地址>
git branch -M main
git push -u origin main
```

## 第三步：在 Vercel 上部署

1. 访问 [Vercel.com](https://vercel.com) 并使用 GitHub 账户登录
2. 点击 **"New Project"**
3. 选择你刚才上传的 GitHub 仓库
4. 点击 **"Import"**

## 第四步：配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

```
VITE_SUPABASE_URL=https://gikzztsahvhzryrawrng.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpa3p6dHNhaHZoenJ5cmF3cm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTc1MDIsImV4cCI6MjA5NDc3MzUwMn0.92ovtRXYs48aMZvqqL2WwrHGR65jwfY4JGQTDZrD_oM
```

**重要**：确保环境变量名称以 `VITE_` 开头，这样 Vite 才能正确读取它们。

## 第五步：部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常只需要1-2分钟）

## 第六步：配置域名 (www.g-moon.top)

### 1. 在 Vercel 中添加域名

1. 进入你的 Vercel 项目
2. 点击 **"Settings"** 标签
3. 选择 **"Domains"**
4. 输入 `www.g-moon.top`
5. 点击 **"Add"**

### 2. 在你的域名注册商处配置 DNS

前往你的域名注册商（如 GoDaddy、阿里云、Cloudflare 等），添加以下 DNS 记录：

```
类型: CNAME
主机: www
值: cname.vercel-dns.com
TTL: 自动
```

### 3. 配置根域名 (可选)

如果你想让 `g-moon.top` 也能访问：

```
类型: A
主机: @
值: 76.76.21.21
TTL: 自动
```

然后在 Vercel 中也添加 `g-moon.top` 这个域名，Vercel 会自动将其重定向到 `www.g-moon.top`。

### 4. 等待 DNS 生效

DNS 生效通常需要几分钟到几小时。

## 验证部署

部署完成后，你可以通过以下地址访问你的网站：
- Vercel 自动分配的地址：`https://<项目名>.vercel.app`
- 你的自定义域名：`https://www.g-moon.top`

## 以后的更新

每次你将代码推送到 GitHub 的 main 分支，Vercel 都会自动重新部署你的网站！

## 有用的链接

- [Vercel 文档](https://vercel.com/docs)
- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Supabase 文档](https://supabase.com/docs)
