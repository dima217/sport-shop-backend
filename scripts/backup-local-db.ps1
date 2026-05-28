# Сделать дамп локальной БД (контейнер postgres должен быть запущен)
# Запуск из корня проекта: .\scripts\backup-local-db.ps1

$ErrorActionPreference = "Stop"

$user = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "myuser" }
$db   = if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "mydatabase" }
$out  = "backup-$db-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').sql"

Write-Host "Exporting $db from local Docker postgres -> $out"

docker compose exec -T postgres pg_dump -U $user -d $db --clean --if-exists --no-owner --no-acl | Out-File -FilePath $out -Encoding utf8

Write-Host "Done: $out"
Write-Host "Next: restore with .\scripts\restore-to-railway.ps1 -BackupFile $out -RemoteUrl '<postgresql://...>'"
