#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# YAQ-AI 构建脚本 — JS/CSS 压缩 + 资源部署
# ═══════════════════════════════════════════════════════════════
set -e

echo "🔨 YAQ-AI Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 安装依赖（如果缺失）
if [ ! -d "node_modules" ]; then
  echo "📦 安装构建依赖..."
  npm install --production=false
fi

# 2. 清理 dist 目录
rm -rf dist
mkdir -p dist/js dist/css

# 3. 压缩 JS
echo "📜 压缩 JS..."
npx terser js/app.js -o dist/js/app.min.js --compress --mangle --comments false 2>/dev/null
echo "   app.js        $(wc -c < js/app.js | tr -d ' ')B → $(wc -c < dist/js/app.min.js | tr -d ' ')B"

npx terser js/agent-init.js -o dist/js/agent-init.min.js --compress --mangle --comments false 2>/dev/null
echo "   agent-init.js $(wc -c < js/agent-init.js | tr -d ' ')B → $(wc -c < dist/js/agent-init.min.js | tr -d ' ')B"

npx terser js/rules.js -o dist/js/rules.min.js --compress --mangle --comments false 2>/dev/null
echo "   rules.js      $(wc -c < js/rules.js | tr -d ' ')B → $(wc -c < dist/js/rules.min.js | tr -d ' ')B"

# 4. 压缩 CSS
echo "🎨 压缩 CSS..."
npx cleancss -o dist/css/style.min.css css/style.css 2>/dev/null
echo "   style.css     $(wc -c < css/style.css | tr -d ' ')B → $(wc -c < dist/css/style.min.css | tr -d ' ')B"

npx cleancss -o dist/css/agent-init.min.css css/agent-init.css 2>/dev/null
echo "   agent-init.css $(wc -c < css/agent-init.css | tr -d ' ')B → $(wc -c < dist/css/agent-init.min.css | tr -d ' ')B"

# 5. 复制 HTML 文件
echo "📄 复制 HTML..."
cp index.html dist/
cp ai-vs-traditional-comparison.html dist/ 2>/dev/null || true
cp special-inspection-prototype.html dist/ 2>/dev/null || true

# 6. 输出统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 构建完成！"
ORIG_SIZE=$(find js/ css/ -name "*.js" -o -name "*.css" | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
DIST_SIZE=$(find dist/ -type f | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
echo "   原始大小: $((ORIG_SIZE/1024))KB"
echo "   构建大小: $((DIST_SIZE/1024))KB"
echo "   节省: $(((ORIG_SIZE-DIST_SIZE)/1024))KB ($(( (ORIG_SIZE-DIST_SIZE)*100/ORIG_SIZE ))%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
