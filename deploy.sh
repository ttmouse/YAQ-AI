#!/bin/bash

# --- 配置区 ---
SERVER_IP="38.55.192.139"
SERVER_USER="root"
SSH_KEY="${SSH_KEY:-~/.ssh/id_ed25519}"
REMOTE_DIR="/root/yaq-ai"
# ⚠ 密码已从代码中移除！
# 请使用 SSH 密钥认证，或通过 SSH_KEY 环境变量指定密钥路径
# 部署方式：ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP
# --------------

cd "$(dirname "$0")"

# 先构建压缩版本
echo "🔨 执行构建（JS/CSS 压缩）..."
bash build.sh

echo "📦 打包站点文件（使用构建产物）..."
tar -czf dist.tar.gz \
  -C dist \
  index.html \
  css/style.min.css css/agent-init.min.css \
  js/app.min.js js/rules.min.js js/agent-init.min.js \
  ai-vs-traditional-comparison.html \
  special-inspection-prototype.html

echo "🚚 上传到服务器..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no dist.tar.gz $SERVER_USER@$SERVER_IP:/root/

echo "🏗️ 服务器解压..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR && tar -xzf /root/dist.tar.gz -C $REMOTE_DIR && rm /root/dist.tar.gz"

echo "✨ 清理本地临时文件..."
rm -rf dist dist.tar.gz

echo "✅ 部署完成！"
echo "🌐 访问地址: https://ttmouse.com/yaq-ai/"
