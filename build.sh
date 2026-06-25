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

# 1. 安装依赖（如果缺失）
if [ ! -d "node_modules" ]; then
  echo "📦 安装构建依赖..."
  npm install --production=false
fi

# 2. 清理并创建 dist 目录
rm -rf dist
mkdir -p dist/js dist/css

# 3. 委托 npm scripts 执行压缩（单一命令定义源）
echo "📜 压缩 JS..."
npm run build:js

# 压缩动态 import 的 ES 模块文件（js/data.js, js/state.js, js/modules.js, js/render/*.js）
echo "📦 压缩动态 ES 模块..."
for jsfile in js/data.js js/state.js js/modules.js js/render/*.js; do
  [ -f "$jsfile" ] || continue
  # 保持相对路径，如 js/render/header.js → dist/js/render/header.js
  dir="dist/$(dirname "$jsfile")"
  mkdir -p "$dir"
  npx terser "$jsfile" -o "$dir/$(basename "$jsfile")" --compress --mangle --comments false 2>/dev/null
  echo "   $(basename "$jsfile") $(wc -c < "$jsfile" | tr -d ' ')B → $(wc -c < "$dir/$(basename "$jsfile")" | tr -d ' ')B"
done

echo "🎨 压缩 CSS..."
npm run build:css

# 4. 复制 HTML 和资源文件
echo "📄 复制静态资源..."
cp index.html dist/
cp ai-vs-traditional-comparison.html dist/ 2>/dev/null || true
cp special-inspection-prototype.html dist/ 2>/dev/null || true
cp favicon.svg dist/ 2>/dev/null || true
# 复制 .nojekyll — 防止 GitHub Pages 用 Jekyll 处理站点
cp .nojekyll dist/ 2>/dev/null || touch dist/.nojekyll

# 5. 输出统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 构建完成！"
ORIG_SIZE=$(find js/ css/ -name "*.js" -o -name "*.css" | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
DIST_SIZE=$(find dist/ -type f | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
echo "   原始 JS/CSS:  $((ORIG_SIZE/1024))KB"
echo "   构建产物:     $((DIST_SIZE/1024))KB"
echo "   节省:         $(((ORIG_SIZE-DIST_SIZE)/1024))KB ($(( (ORIG_SIZE-DIST_SIZE)*100/ORIG_SIZE ))%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
