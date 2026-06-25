#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# YAQ-AI 构建脚本 — 委托 npm scripts 执行压缩
# 单一入口：npm run build (bash build.sh)
# 子步骤：npm run build:js / build:css / build:html
# 输出使用原始文件名，dist/ 可直接部署（index.html 路径不变）
# ═══════════════════════════════════════════════════════════════
set -e

echo "🔨 YAQ-AI Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 安装依赖
if [ -n "$CI" ]; then
  echo "📦 CI 环境 — 使用 npm ci（快速+可复现）..."
  npm ci
elif [ ! -d "node_modules" ]; then
  echo "📦 安装构建依赖..."
  npm install --production=false
fi

# 2. 清理并创建 dist 目录
rm -rf dist
mkdir -p dist/js dist/css

# 3. 委托 npm scripts 执行压缩（单一命令定义源）
echo "📜 压缩 JS..."
npm run build:js

echo "🎨 压缩 CSS..."
npm run build:css

# 4. 复制 HTML 和资源文件
echo "📄 复制静态资源..."
npm run build:html

# 5. 输出统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 构建完成！"
ORIG_SIZE=$(find js/ css/ -name "*.js" -o -name "*.css" | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
DIST_SIZE=$(find dist/ -type f | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
echo "   原始 JS/CSS:  $((ORIG_SIZE/1024))KB"
echo "   构建产物:     $((DIST_SIZE/1024))KB"
echo "   节省:         $(((ORIG_SIZE-DIST_SIZE)/1024))KB ($(( (ORIG_SIZE-DIST_SIZE)*100/ORIG_SIZE ))%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
