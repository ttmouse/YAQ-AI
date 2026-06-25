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

# 合并 CSS（减少生产环境 HTTP 请求数）(#88)
echo "📦 合并 CSS..."
# 排除 mobile.css（响应式单独加载），其余全部合并为 app.css
cat dist/css/style.css dist/css/agent-init.css dist/css/tokens.css dist/css/base.css dist/css/layout.css dist/css/blocks.css dist/css/detail.css dist/css/modal.css dist/css/work-items.css dist/css/assistant.css dist/css/utilities.css > dist/css/app.css 2>/dev/null
echo "   $(wc -c < dist/css/app.css | tr -d ' ')B — app.css（11 个文件合并）"

# 4. 复制 HTML 和资源文件
echo "📄 复制静态资源..."
npm run build:html

# 替换 dist/index.html 中的 CSS 引用（12 个文件 → 2 个）
echo "🔗 更新 index.html CSS 引用..."
# 删除所有 <link rel="stylesheet" href="css/..."> 行
sed -i '' '/<link rel="stylesheet" href="css\/.*">/d' dist/index.html
# 在 <title> 后插入合并后的 CSS 引用（保持 head 中合理位置）
sed -i '' 's|<title>站长每日监管闭环工作台</title>|<title>站长每日监管闭环工作台</title>\n  <link rel="stylesheet" href="css/app.css">\n  <link rel="stylesheet" href="css/mobile.css">|' dist/index.html
echo "   12 个 CSS 引用 → 2 个 (app.css + mobile.css)"

# 5. 输出统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 构建完成！"
ORIG_SIZE=$(find js/ css/ -name "*.js" -o -name "*.css" | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
DIST_SIZE=$(find dist/ -type f | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
echo "   原始 JS/CSS:  $((ORIG_SIZE/1024))KB"
echo "   构建产物:     $((DIST_SIZE/1024))KB"
echo "   节省:         $(((ORIG_SIZE-DIST_SIZE)/1024))KB ($(( (ORIG_SIZE-DIST_SIZE)*100/ORIG_SIZE ))%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
