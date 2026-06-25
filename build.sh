#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# YAQ-AI 构建脚本 — JS/CSS 压缩 + 资源收集到 dist/
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

# 3. 压缩 JS（输出原始文件名，dist/ 可直接引用）
echo "📜 压缩 JS..."
npx terser js/app.js -o dist/js/app.js --compress --mangle --comments false 2>/dev/null
echo "   app.js        $(wc -c < js/app.js | tr -d ' ')B → $(wc -c < dist/js/app.js | tr -d ' ')B"

npx terser js/rules.js -o dist/js/rules.js --compress --mangle --comments false 2>/dev/null
echo "   rules.js      $(wc -c < js/rules.js | tr -d ' ')B → $(wc -c < dist/js/rules.js | tr -d ' ')B"

npx terser js/agent-init.js -o dist/js/agent-init.js --compress --mangle --comments false 2>/dev/null
echo "   agent-init.js $(wc -c < js/agent-init.js | tr -d ' ')B → $(wc -c < dist/js/agent-init.js | tr -d ' ')B"

# 4. 压缩 CSS（全部 11 个模块文件）
echo "🎨 压缩 CSS..."
for cssfile in css/*.css; do
  name=$(basename "$cssfile")
  npx cleancss -o "dist/css/$name" "$cssfile" 2>/dev/null
  echo "   $name $(wc -c < "$cssfile" | tr -d ' ')B → $(wc -c < "dist/css/$name" | tr -d ' ')B"
done

# 5. 复制 HTML 和资源文件
echo "📄 复制静态资源..."
cp index.html dist/
cp ai-vs-traditional-comparison.html dist/ 2>/dev/null || true
cp special-inspection-prototype.html dist/ 2>/dev/null || true
cp favicon.svg dist/ 2>/dev/null || true

# 6. 输出统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 构建完成！"
ORIG_SIZE=$(find js/ css/ -name "*.js" -o -name "*.css" | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
DIST_SIZE=$(find dist/ -type f | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
echo "   原始 JS/CSS:  $((ORIG_SIZE/1024))KB"
echo "   构建产物:     $((DIST_SIZE/1024))KB"
echo "   节省:         $(((ORIG_SIZE-DIST_SIZE)/1024))KB ($(( (ORIG_SIZE-DIST_SIZE)*100/ORIG_SIZE ))%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
