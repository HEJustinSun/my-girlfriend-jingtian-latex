# 孙哥桥 Windows 一键安装脚本（实验性）
#   irm <站点>/install.ps1 | iex
# 只做三件事：下载单文件 bridge.mjs 到 ~\.sunge、生成 sunge.cmd 启动命令、提示如何运行。
# 幂等：重复执行即覆盖升级。
$ErrorActionPreference = 'Stop'

$SITE = '__SITE_ORIGIN__'
if ($SITE.StartsWith('__')) {
  Write-Host '错误：安装脚本需要从站点在线获取（站点会注入下载地址），不要直接从仓库运行。'
  exit 1
}

# 1) 运行时：需要 Node.js >= 18
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host '未找到 Node.js (>=18)。请先安装：https://nodejs.org/'
  exit 1
}
$major = [int](node -e "console.log(process.versions.node.split('.')[0])")
if ($major -lt 18) {
  Write-Host "Node.js 版本过低（v$major），需要 >= 18：https://nodejs.org/"
  exit 1
}

# 2) 下载单文件桥（tmp + move 原子替换）
$dir = Join-Path $env:USERPROFILE '.sunge'
$binDir = Join-Path $dir 'bin'
New-Item -ItemType Directory -Force -Path $binDir | Out-Null
Write-Host "· 正在下载孙哥桥 → $dir\bridge.mjs"
Invoke-WebRequest -Uri "$SITE/bridge.mjs" -OutFile (Join-Path $dir 'bridge.mjs.tmp') -UseBasicParsing
Move-Item -Force (Join-Path $dir 'bridge.mjs.tmp') (Join-Path $dir 'bridge.mjs')

# 3) 生成启动命令 sunge.cmd
$launcher = Join-Path $binDir 'sunge.cmd'
"@echo off`r`nnode `"%USERPROFILE%\.sunge\bridge.mjs`" %*" | Set-Content -Encoding ASCII $launcher

# 4) 把 ~\.sunge\bin 加进用户 PATH（已存在则跳过）
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$binDir*") {
  [Environment]::SetEnvironmentVariable('Path', "$userPath;$binDir", 'User')
  Write-Host "· 已把 $binDir 加入用户 PATH（新开的终端生效）"
}

$version = node (Join-Path $dir 'bridge.mjs') --version
Write-Host ''
Write-Host "✅ 孙哥桥 v$version 安装完成"
Write-Host ''
Write-Host "启动命令：  sunge      （本窗口可先用：& `"$launcher`"）"
Write-Host "启动后回到网页即可开聊：$SITE"
Write-Host '（Windows 支持为实验性；遇到问题欢迎提 issue，或用 WSL 走 install.sh）'
