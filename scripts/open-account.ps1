# Open one seller account in its own isolated Chrome profile.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\open-account.ps1 -Account homevista
# Accounts are defined in config\accounts\<name>.json

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('levelup', 'homevista', 'noon')]
  [string]$Account
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$cfgPath = Join-Path $root "config\accounts\$Account.json"
if (-not (Test-Path $cfgPath)) { throw "Account config not found: $cfgPath" }

$cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json

$chrome = $cfg.chrome
if (-not (Test-Path $chrome)) {
  $chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
}
if (-not (Test-Path $chrome)) { throw "Chrome not found for account '$Account'" }

if (-not (Test-Path $cfg.profile)) { throw "Profile folder not found: $($cfg.profile)" }

$busy = Test-NetConnection -ComputerName 127.0.0.1 -Port $cfg.cdpPort -InformationLevel Quiet -WarningAction SilentlyContinue
if ($busy) {
  Write-Host "$($cfg.title): browser already running on port $($cfg.cdpPort) - nothing to do."
  exit 0
}

Start-Process -FilePath $chrome -ArgumentList @(
  "--user-data-dir=$($cfg.profile)",
  "--remote-debugging-port=$($cfg.cdpPort)",
  '--no-first-run',
  '--no-default-browser-check',
  '--start-maximized',
  $cfg.portal
)

Write-Host "$($cfg.title) started"
Write-Host "  profile : $($cfg.profile)"
Write-Host "  CDP     : http://127.0.0.1:$($cfg.cdpPort)"
