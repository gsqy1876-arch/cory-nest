#!/bin/bash

# ============================================================
# NestJS 项目部署脚本
# 
# 功能：自动化部署 NestJS 后端应用
# 用法：chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================
# 1. 环境检查
# ============================================================
log_info "========== 开始环境检查 =========="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装，请先安装 Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 版本过低，需要 >= 18.0.0，当前版本: $(node -v)"
    exit 1
fi
log_info "Node.js 版本: $(node -v) ✓"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    log_warn "pnpm 未安装，正在安装..."
    npm install -g pnpm
fi
log_info "pnpm 版本: $(pnpm -v) ✓"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    log_warn "PM2 未安装，正在安装..."
    npm install -g pm2
fi
log_info "PM2 版本: $(pm2 -v) ✓"

# ============================================================
# 2. 检查环境变量文件
# ============================================================
log_info "========== 检查环境变量 =========="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    log_error "未找到环境变量文件！"
    log_info "请复制 .env.example 并配置："
    log_info "  cp .env.example .env.production"
    exit 1
fi

# 使用 .env.production 如果存在
if [ -f ".env.production" ]; then
    ln -sf .env.production .env
    log_info "使用 .env.production 配置 ✓"
fi

# 检查关键环境变量
source .env 2>/dev/null || true

if [ "$NODE_ENV" != "production" ]; then
    log_warn "NODE_ENV 不是 production，正在设置..."
    echo "NODE_ENV=production" >> .env
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "your-super-secret-key-change-in-production-use-strong-random-string" ]; then
    log_error "请修改 JWT_SECRET 为强随机字符串！"
    exit 1
fi
log_info "环境变量检查通过 ✓"

# ============================================================
# 3. 安装依赖
# ============================================================
log_info "========== 安装依赖 =========="

pnpm install --frozen-lockfile --prod
log_info "依赖安装完成 ✓"

# ============================================================
# 4. 构建项目
# ============================================================
log_info "========== 构建项目 =========="

pnpm run build
log_info "项目构建完成 ✓"

# 检查构建产物
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    log_error "构建失败，dist/main.js 不存在"
    exit 1
fi
log_info "构建产物检查通过 ✓"

# ============================================================
# 5. 数据库初始化（可选）
# ============================================================
log_info "========== 数据库初始化 =========="

read -p "是否运行数据库种子脚本？(y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "运行数据库种子脚本..."
    pnpm run seed:run || log_warn "种子脚本执行失败，可能数据已存在"
    log_info "数据库初始化完成 ✓"
else
    log_info "跳过数据库初始化"
fi

# ============================================================
# 6. PM2 进程管理
# ============================================================
log_info "========== PM2 进程管理 =========="

APP_NAME="user-management-api"

# 检查是否已有运行的进程
if pm2 describe "$APP_NAME" &> /dev/null; then
    log_info "检测到已有进程，正在重启..."
    pm2 restart "$APP_NAME"
else
    log_info "启动新进程..."
    pm2 start dist/main.js --name "$APP_NAME" \
        --max-memory-restart 500M \
        --exp-backoff-restart-delay=100 \
        --time
fi

# 保存 PM2 进程列表
pm2 save
log_info "PM2 进程已保存 ✓"

# ============================================================
# 7. 部署完成
# ============================================================
log_info "=========================================="
log_info "🎉 部署完成！"
log_info "=========================================="
log_info ""
log_info "进程信息："
pm2 show "$APP_NAME" | head -20
log_info ""
log_info "常用命令："
log_info "  查看日志: pm2 logs $APP_NAME"
log_info "  查看状态: pm2 status"
log_info "  重启应用: pm2 restart $APP_NAME"
log_info "  停止应用: pm2 stop $APP_NAME"
log_info ""
