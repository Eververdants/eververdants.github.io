# Cloudflare KV 上传脚本 (PowerShell)
# 使用方法: .\scripts\upload-to-kv.ps1

Write-Host "=== Cloudflare KV 数据上传工具 ===" -ForegroundColor Blue
Write-Host ""

# 检查 wrangler 是否安装
try {
    $null = Get-Command wrangler -ErrorAction Stop
    Write-Host "✓ wrangler 已安装" -ForegroundColor Green
} catch {
    Write-Host "错误: wrangler 未安装" -ForegroundColor Red
    Write-Host "请运行: npm install -g wrangler"
    exit 1
}

# 检查是否已登录
Write-Host "检查 Cloudflare 登录状态..." -ForegroundColor Blue
try {
    $whoami = wrangler whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "未登录"
    }
    Write-Host "✓ 已登录 Cloudflare" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "未登录 Cloudflare" -ForegroundColor Red
    Write-Host "请运行: wrangler login"
    exit 1
}

# 获取 Namespace ID
$NAMESPACE_ID = Read-Host "请输入你的 KV Namespace ID"

if ([string]::IsNullOrWhiteSpace($NAMESPACE_ID)) {
    Write-Host "错误: Namespace ID 不能为空" -ForegroundColor Red
    exit 1
}

# 上传数据
Write-Host ""
Write-Host "开始上传数据到 KV..." -ForegroundColor Blue
Write-Host ""

# 上传 projects
Write-Host "上传 projects.json..." -ForegroundColor Blue
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "projects" --path="public/data/projects.json"
Write-Host "✓ projects.json 上传成功" -ForegroundColor Green
Write-Host ""

# 上传 photography
Write-Host "上传 photography.json..." -ForegroundColor Blue
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "photography" --path="public/data/photography.json"
Write-Host "✓ photography.json 上传成功" -ForegroundColor Green
Write-Host ""

# 上传 calligraphy
Write-Host "上传 calligraphy.json..." -ForegroundColor Blue
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "calligraphy" --path="public/data/calligraphy.json"
Write-Host "✓ calligraphy.json 上传成功" -ForegroundColor Green
Write-Host ""

# 上传 blog
Write-Host "上传 blog.json..." -ForegroundColor Blue
wrangler kv:key put --namespace-id="$NAMESPACE_ID" "blog" --path="public/data/blog.json"
Write-Host "✓ blog.json 上传成功" -ForegroundColor Green
Write-Host ""

Write-Host "=== 所有数据上传完成！===" -ForegroundColor Green
Write-Host ""
Write-Host "提示: 数据可能需要几秒钟才能在全球 CDN 上生效" -ForegroundColor Blue
