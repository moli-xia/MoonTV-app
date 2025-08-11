#!/bin/bash

# MoonTV 部署脚本
# 使用方法: ./deploy.sh [docker|local]

set -e

DEPLOY_TYPE=${1:-"local"}
PROJECT_NAME="moontv"

echo "🚀 开始部署 MoonTV..."
echo "部署类型: $DEPLOY_TYPE"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色消息
print_message() {
    echo -e "${2}${1}${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_message "警告: 端口 $port 已被占用" "$YELLOW"
        read -p "是否要停止占用端口的进程? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo kill -9 $(lsof -ti:$port) 2>/dev/null || true
            print_message "已停止占用端口 $port 的进程" "$GREEN"
        fi
    fi
}

# Docker 部署
deploy_docker() {
    print_message "🐳 开始 Docker 部署..." "$BLUE"
    
    # 检查 Docker 是否安装
    if ! command_exists docker; then
        print_message "错误: Docker 未安装" "$RED"
        print_message "请先安装 Docker: https://docs.docker.com/get-docker/" "$YELLOW"
        exit 1
    fi
    
    # 检查 docker-compose 是否安装
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_message "错误: docker-compose 未安装" "$RED"
        print_message "请先安装 docker-compose" "$YELLOW"
        exit 1
    fi
    
    # 检查端口
    check_port 3000
    
    # 停止现有容器
    print_message "停止现有容器..." "$YELLOW"
    docker-compose down 2>/dev/null || true
    
    # 构建并启动
    print_message "构建并启动容器..." "$BLUE"
    if docker compose version >/dev/null 2>&1; then
        docker compose up -d --build
    else
        docker-compose up -d --build
    fi
    
    # 等待服务启动
    print_message "等待服务启动..." "$YELLOW"
    sleep 10
    
    # 检查服务状态
    if curl -f http://localhost:3000/login >/dev/null 2>&1; then
        print_message "✅ Docker 部署成功!" "$GREEN"
        print_message "访问地址: http://localhost:3000" "$GREEN"
    else
        print_message "❌ 服务启动失败，请检查日志" "$RED"
        if docker compose version >/dev/null 2>&1; then
            docker compose logs
        else
            docker-compose logs
        fi
        exit 1
    fi
}

# 本机部署
deploy_local() {
    print_message "💻 开始本机部署..." "$BLUE"
    
    # 检查 Node.js
    if ! command_exists node; then
        print_message "错误: Node.js 未安装" "$RED"
        print_message "请先安装 Node.js 18+: https://nodejs.org/" "$YELLOW"
        exit 1
    fi
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_message "错误: Node.js 版本过低 (当前: $(node -v), 需要: 18+)" "$RED"
        exit 1
    fi
    
    # 检查包管理器
    if command_exists pnpm; then
        PKG_MANAGER="pnpm"
    elif command_exists yarn; then
        PKG_MANAGER="yarn"
    elif command_exists npm; then
        PKG_MANAGER="npm"
    else
        print_message "错误: 未找到包管理器" "$RED"
        exit 1
    fi
    
    print_message "使用包管理器: $PKG_MANAGER" "$BLUE"
    
    # 检查端口
    check_port 3000
    
    # 安装依赖
    print_message "安装依赖..." "$YELLOW"
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm install
    elif [ "$PKG_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
    
    # 构建项目
    print_message "构建项目..." "$YELLOW"
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm build
    elif [ "$PKG_MANAGER" = "yarn" ]; then
        yarn build
    else
        npm run build
    fi
    
    # 检查 PM2
    if command_exists pm2; then
        print_message "使用 PM2 启动服务..." "$BLUE"
        pm2 stop $PROJECT_NAME 2>/dev/null || true
        pm2 delete $PROJECT_NAME 2>/dev/null || true
        pm2 start ecosystem.config.js
        print_message "✅ 本机部署成功 (PM2)!" "$GREEN"
        print_message "访问地址: http://localhost:3000" "$GREEN"
        print_message "查看状态: pm2 status" "$BLUE"
        print_message "查看日志: pm2 logs $PROJECT_NAME" "$BLUE"
    else
        print_message "直接启动服务..." "$BLUE"
        print_message "✅ 本机部署成功!" "$GREEN"
        print_message "访问地址: http://localhost:3000" "$GREEN"
        print_message "启动服务: $PKG_MANAGER start" "$BLUE"
        
        # 询问是否立即启动
        read -p "是否立即启动服务? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            if [ "$PKG_MANAGER" = "pnpm" ]; then
                pnpm start
            elif [ "$PKG_MANAGER" = "yarn" ]; then
                yarn start
            else
                npm start
            fi
        fi
    fi
}

# 显示帮助信息
show_help() {
    echo "MoonTV 部署脚本"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  docker    使用 Docker 部署"
    echo "  local     本机部署 (默认)"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh docker    # Docker 部署"
    echo "  ./deploy.sh local     # 本机部署"
    echo "  ./deploy.sh           # 默认本机部署"
}

# 主逻辑
case $DEPLOY_TYPE in
    "docker")
        deploy_docker
        ;;
    "local")
        deploy_local
        ;;
    "help" | "-h" | "--help")
        show_help
        ;;
    *)
        print_message "错误: 未知的部署类型 '$DEPLOY_TYPE'" "$RED"
        show_help
        exit 1
        ;;
esac

print_message "🎉 部署完成!" "$GREEN"