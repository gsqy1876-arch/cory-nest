#!/bin/bash
set -e

# ================= 配置 =================
APP_NAME="nest-api"
# 假设脚本在项目根目录运行，例如 /var/www/cory-nest
PROJECT_ROOT=$(pwd)
# 发布目录放在项目同级，避免污染源码目录
RELEASES_DIR="$PROJECT_ROOT/../${APP_NAME}-releases"
CURRENT_DIR="$PROJECT_ROOT/../${APP_NAME}-current"
RELEASE_VERSION=$(date +%Y%m%d_%H%M%S)
NEW_RELEASE_PATH="$RELEASES_DIR/$RELEASE_VERSION"

log() { printf "\033[0;32m[INFO]\033[0m %s\n" "$1"; }
err() { printf "\033[0;31m[ERROR]\033[0m %s\n" "$1"; exit 1; }
# =======================================

log "🚀 开始部署 $APP_NAME ..."
log "📍 项目路径: $PROJECT_ROOT"
log "📂 发布路径: $NEW_RELEASE_PATH"

# 1. 更新源码
log "📥 1. 拉取最新代码..."
git fetch origin master
git reset --hard origin/master

# 2. 安装构建依赖
log "📦 2. 安装构建依赖..."
# 确保安装所有依赖(包括 devDependencies)用于构建
pnpm install --frozen-lockfile

# 3. 构建项目
log "🔨 3. 构建项目..."
pnpm run build

# 检查构建产物
if [ ! -f "dist/src/main.js" ]; then
    err "❌ 构建失败：dist/src/main.js 不存在"
fi

# 4. 准备发布包
log "📂 4. 准备发布目录..."
mkdir -p "$NEW_RELEASE_PATH"

# 复制运行时必要文件 (dist, package.json, pnpm-lock.yaml)
cp -r dist "$NEW_RELEASE_PATH/"
cp package.json "$NEW_RELEASE_PATH/"
cp pnpm-lock.yaml "$NEW_RELEASE_PATH/"

# 5. 安装生产依赖
log "📦 5. 安装生产运行时依赖..."
cd "$NEW_RELEASE_PATH"
pnpm install --prod --frozen-lockfile

# 6. 配置环境变量
log "🔗 6. 链接环境变量..."
# 假设 .env 文件在项目根目录，链接到当前发布版本
if [ -f "$PROJECT_ROOT/.env" ]; then
    ln -sf "$PROJECT_ROOT/.env" .env
else
    log "⚠️ 未找到 .env 文件，请确保在 $PROJECT_ROOT/.env 存在配置文件"
fi

# 7. 更新 current 软链接
log "🔗 7. 切换当前版本..."
ln -sfn "$NEW_RELEASE_PATH" "$CURRENT_DIR"

# 8. 生成 PM2 配置
log "⚙️ 8. 生成 PM2 配置..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: './dist/src/main.js',
    cwd: '$CURRENT_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 9. 重启服务
log "🔄 9. 重启 PM2 服务..."
# 使用 startOrReload 实现零停机重启
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# 10. 清理旧版本
log "🧹 10. 清理旧版本 (保留最近 5 个)..."
cd "$RELEASES_DIR"
# 列出所有版本，按时间倒序，跳过前5个，剩下的删除
ls -t | tail -n +6 | xargs -r rm -rf

log "✅ 部署完成！当前版本: $RELEASE_VERSION"
log "👉 API地址: http://localhost:3000/api/v1/health"
