param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,

  [Parameter(Mandatory = $true)]
  [string]$RemoteUrl
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
  throw "Backup file not found: $BackupFile"
}

# Docker volume mount — без PowerShell pipe, чтобы не ломать UTF-8 / кириллицу
$fullPath = (Resolve-Path $BackupFile).Path -replace '\\', '/'

Write-Host "Restoring $BackupFile to remote Postgres (UTF-8)..."

docker run --rm `
  -v "${fullPath}:/backup.sql:ro" `
  -e PGCLIENTENCODING=UTF8 `
  postgres:16 `
  psql $RemoteUrl -v ON_ERROR_STOP=1 -f /backup.sql

Write-Host "Restore finished."
