# MoonTV-app - 影视资源聚合平台app版
- 本项目来源:
- https://github.com/LunaTechLab/MoonTV
- 一个基于 Next.js 构建的现代化影视资源聚合平台，支持多种视频源，提供流畅的观影体验。
- 本项目仅修改了页面样式，使页面顶部留出足够空间，避免了手机端与顶部手机状态栏重叠的问题。
- 使用您的服务器搭建好本项目，使用AI编程工具，将项目地址设为http://你的服务器IP:3000 即可直接打包为安卓应用。
- 项目运行在3000端口，记得开启端口访问。
- 版本已经提供了成品apk文件，默认访问密码为654321
./demo.png
## 功能特性

- 🎬 多源影视资源聚合
- 📱 响应式设计，支持移动端
- 🌙 深色/浅色主题切换
- 🔍 智能搜索功能
- 📺 在线播放支持
- 💾 观看历史记录
- 🔐 用户认证系统
- 📊 管理后台

## 技术栈

- **前端框架**: Next.js 14
- **UI 组件**: React 18, Tailwind CSS
- **视频播放**: Artplayer, HLS.js
- **状态管理**: React Hooks
- **数据存储**: Redis/Upstash
- **部署**: Docker, PM2

## 快速开始

### 使用自动化部署脚本（推荐）

```bash
# Docker 部署
./deploy.sh docker

# 本机部署
./deploy.sh local
```

## 部署方式

### 方式一：Docker 部署（推荐）

#### 前提条件
- Docker
- Docker Compose

#### 部署步骤

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd Moontv
   ```

2. **配置环境变量（可选）**
   ```bash
   cp .env.local .env.production
   # 编辑 .env.production 文件，修改相关配置
   ```

3. **构建并启动**
   ```bash
   docker-compose up -d
   ```

4. **查看日志**
   ```bash
   docker-compose logs -f
   ```

5. **停止服务**
   ```bash
   docker-compose down
   ```

### 方式二：本机部署

#### 系统要求
- Node.js 18+
- pnpm (推荐) 或 npm
- PM2 (可选，用于生产环境)

#### 安装依赖

```bash
# 安装 Node.js (如果未安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2 (可选)
npm install -g pm2
```

#### 部署步骤

1. **克隆并配置项目**
   ```bash
   git clone <your-repo-url>
   cd Moontv
   
   # 安装依赖
   pnpm install
   
   # 配置环境变量
   cp .env.local .env.production
   # 根据需要修改 .env.production 文件
   ```

2. **构建项目**
   ```bash
   pnpm build
   ```

3. **启动服务**

   **开发模式：**
   ```bash
   pnpm dev
   ```

   **生产模式（直接启动）：**
   ```bash
   pnpm start
   ```

   **生产模式（使用 PM2）：**
   ```bash
   # 使用 PM2 启动
   pm2 start ecosystem.config.js
   
   # 查看状态
   pm2 status
   
   # 查看日志
   pm2 logs moontv
   
   # 重启服务
   pm2 restart moontv
   
   # 停止服务
   pm2 stop moontv
   ```

## 配置说明

### 环境变量

在 `.env.local` 或 `.env.production` 文件中配置：

```env
# 管理员密码
PASSWORD=654321

# 存储类型
NEXT_PUBLIC_STORAGE_TYPE=localstorage

# 站点名称
SITE_NAME=MoonTV

# 服务端口
PORT=3000

# 运行环境
NODE_ENV=production
```

### 视频源配置

编辑 `config.json` 文件来配置视频源：

```json
{
  "cache_time": 7200,
  "api_site": {
    "source_name": {
      "api": "https://api.example.com/api.php/provide/vod",
      "name": "源名称",
      "detail": "https://example.com"
    }
  }
}
```

## 访问应用

部署完成后，通过以下地址访问：

- **主页**: http://localhost:3000
- **登录页面**: http://localhost:3000/login
- **管理后台**: http://localhost:3000/admin

**默认管理员密码**: `654321`（建议部署后立即修改）

## 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :3000

# 杀死占用进程
sudo kill -9 <PID>
```

### 2. 权限问题

```bash
# 给予执行权限
chmod +x start.js

# 修改文件所有者
sudo chown -R $USER:$USER .
```

### 3. 内存不足

在 `ecosystem.config.js` 中调整内存限制：

```javascript
max_memory_restart: '2G'  // 根据服务器配置调整
```

### 4. 日志查看

```bash
# PM2 日志
pm2 logs moontv

# 应用日志
tail -f logs/combined.log

# Docker 日志
docker-compose logs -f
```

## 更新部署

### Docker 部署更新

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

### 本机部署更新

```bash
# 拉取最新代码
git pull

# 安装新依赖
pnpm install

# 重新构建
pnpm build

# 重启服务
pm2 restart moontv
```

## Docker 配置文件

### Dockerfile

项目已包含优化的 Dockerfile，支持多阶段构建：

- 基于 Node.js 18 Alpine
- 多阶段构建优化镜像大小
- 非 root 用户运行
- 健康检查支持

### docker-compose.yml

```yaml
version: '3.8'

services:
  moontv:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - PASSWORD=654321
      - NEXT_PUBLIC_STORAGE_TYPE=localstorage
      - SITE_NAME=MoonTV
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/login || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 性能优化

1. **启用 Redis 缓存**: 配置 Redis 来提高数据查询性能
2. **CDN 加速**: 使用 CDN 来加速静态资源加载
3. **反向代理**: 使用 Nginx 作为反向代理
4. **负载均衡**: 多实例部署时使用负载均衡

## 安全建议

1. 修改默认管理员密码
2. 使用 HTTPS 部署
3. 配置防火墙规则
4. 定期更新依赖包
5. 监控系统资源使用情况

## 项目结构

```
Moontv/
├── src/                    # 源代码目录
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   ├── lib/              # 工具库和配置
│   └── styles/           # 样式文件
├── public/               # 静态资源
├── scripts/              # 构建脚本
├── logs/                 # 日志文件
├── config.json           # 视频源配置
├── ecosystem.config.js   # PM2 配置
├── docker-compose.yml    # Docker Compose 配置
├── Dockerfile           # Docker 镜像配置
└── deploy.sh           # 自动化部署脚本
```

## 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

### 构建生产版本

```bash
# 生成运行时配置
pnpm gen:runtime

# 生成 manifest
pnpm gen:manifest

# 构建项目
pnpm build
```

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 支持

如果您在部署过程中遇到问题，请：

1. 查看本文档的常见问题部分
2. 检查项目的 Issue 页面
3. 提交新的 Issue 描述您的问题

## 更新日志

### v0.1.0
- 初始版本发布
- 支持多源视频聚合
- Docker 部署支持
- 管理后台功能

---

**注意**: 本项目仅供学习和研究使用，请遵守相关法律法规。
