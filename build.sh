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

# 合并 CSS — 先合并源文件再压缩，跨文件重复规则被去重 (#91 #92)
echo "📦 合并 CSS（源文件合并→单次压缩，跨文件去重）..."
# 排除 mobile.css（响应式单独加载），其余合并为 app.css
cat css/style.css css/agent-init.css css/tokens.css css/base.css css/layout.css css/blocks.css css/detail.css css/modal.css css/work-items.css css/assistant.css css/utilities.css > /tmp/app-merged.css 2>/dev/null
npx cleancss -o dist/css/app.css /tmp/app-merged.css 2>/dev/null
rm -f /tmp/app-merged.css
echo "   $(wc -c < dist/css/app.css | tr -d ' ')B — app.css（11 个源文件合并+去重压缩）"

# 4. 复制 HTML 和资源文件
echo "📄 复制静态资源..."
npm run build:html

# 更新所有 dist/*.html 的 CSS 引用（12 个文件 → 2 个）
echo "🔗 更新 HTML CSS 引用..."
for html in dist/*.html; do
  # 删除所有 <link rel="stylesheet" href="css/..."> 行
  sed -i '' '/<link rel="stylesheet" href="css\/.*">/d' "$html"
  # 在 </head> 前插入合并后的 CSS 引用
  sed -i '' 's|</head>|  <link rel="stylesheet" href="css/app.css">\n  <link rel="stylesheet" href="css/mobile.css">\n</head>|' "$html"
done
echo "   $(ls dist/*.html | wc -l | tr -d ' ') 个 HTML 文件已更新"

# 5. 输出统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 构建完成！"
ORIG_SIZE=$(find js/ css/ -name "*.js" -o -name "*.css" | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
DIST_SIZE=$(find dist/ -type f | xargs wc -c 2>/dev/null | tail -1 | awk '{print $1}')
echo "   原始 JS/CSS:  $((ORIG_SIZE/1024))KB"
echo "   构建产物:     $((DIST_SIZE/1024))KB"
echo "   节省:         $(((ORIG_SIZE-DIST_SIZE)/1024))KB ($(( (ORIG_SIZE-DIST_SIZE)*100/ORIG_SIZE ))%)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
