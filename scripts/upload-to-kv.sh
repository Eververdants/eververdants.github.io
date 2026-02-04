#!/bin/bash

# Cloudflare KV 上传脚本
# 使用方法: ./scripts/upload-to-kv.sh

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Cloudflare KV 数据上传工具 ===${NC}\n"

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}错误: wrangler 未安装${NC}"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
echo -e "${BLUE}检查 Cloudflare 登录状态...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}未登录 Cloudflare${NC}"
    echo "请运行: wrangler login"
    exit 1
fi

echo -e "${GREEN}✓ 已登录 Cloudflare${NC}\n"

# KV Namespace ID (需要替换为你的实际 ID)
NAMESPACE_ID="YOUR_NAMESPACE_ID"

echo -e "${BLUE}请输入你的 KV Namespace ID:${NC}"
read -p "Namespace ID: " NAMESPACE_ID

if [ -z "$NAMESPACE_ID" ]; then
    echo -e "${RED}错误: Namespace ID 不能为空${NC}"
    exit 1
fi

# 上传数据
echo -e "\n${BLUE}开始上传数据到 KV...${NC}\n"

# 上传 projects
echo -e "${BLUE}上传 projects.json...${NC}"
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "projects" --path="public/data/projects.json"
echo -e "${GREEN}✓ projects.json 上传成功${NC}\n"

# 上传 photography
echo -e "${BLUE}上传 photography.json...${NC}"
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "photography" --path="public/data/photography.json"
echo -e "${GREEN}✓ photography.json 上传成功${NC}\n"

# 上传 calligraphy
echo -e "${BLUE}上传 calligraphy.json...${NC}"
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "calligraphy" --path="public/data/calligraphy.json"
echo -e "${GREEN}✓ calligraphy.json 上传成功${NC}\n"

# 上传 blog
echo -e "${BLUE}上传 blog.json...${NC}"
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "blog" --path="public/data/blog.json"
echo -e "${GREEN}✓ blog.json 上传成功${NC}\n"

echo -e "${GREEN}=== 所有数据上传完成！===${NC}"
echo -e "\n${BLUE}提示: 数据可能需要几秒钟才能在全球 CDN 上生效${NC}"
