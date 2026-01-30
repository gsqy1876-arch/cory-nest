#!/bin/bash
# NestJS 部署脚本
set -e

APP_NAME="nest-api"

log() { printf "\033[0;32m[INFO]\033[0m %s\n" "$1"; }
err() { printf "\033[0;31m[ERROR]\033[0m %s\n" "$1"; exit 1; }

# 进入项目目录
cd "$(dirname "$0")/.."

# 环境检查
log "检查环境..."
command -v node >/dev/null 2>&1 || err "Node.js 未安装"
command -v pnpm >/dev/null 2>&1 || npm install -g pnpm
command -v pm2 >/dev/null 2>&1 || npm install -g pm2

# 检查配置
[ -f .env ] || err "缺少 .env 文件，请先创建"
. ./.env
[ -z "$DB_PASSWORD" ] && err "DB_PASSWORD 未配置"
[ "$JWT_SECRET" = "your-jwt-secret-change-in-production" ] && err "请修改 JWT_SECRET"

# 安装依赖（包含 devDependencies 用于构建）
log "安装依赖..."
pnpm install

# 构建
log "构建项目..."
if ! pnpm run build; then
    err "构建失败，请检查 TypeScript 编译错误"
fi
[ -f dist/src/main.js ] || err "构建产物不存在: dist/src/main.js"

# PM2 管理
log "启动应用..."
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME"
else
    pm2 start dist/src/main.js --name "$APP_NAME" --max-memory-restart 500M --time
fi
pm2 save

log "==========================================="
log "部署完成！"
log "==========================================="
log "查看状态: pm2 status"
log "查看日志: pm2 logs $APP_NAME"
log "API 地址: http://localhost:${PORT:-3000}/api/v1/health"
