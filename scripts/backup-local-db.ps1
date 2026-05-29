# Сделать дамп локальной БД (контейнер postgres должен быть запущен)
# Запуск из корня проекта: .\scripts\backup-local-db.ps1
#
# Важно: не используем PowerShell pipe в файл — он ломает кириллицу (???).
# Дамп пишется внутри контейнера и копируется docker cp (UTF-8 сохраняется).

$ErrorActionPreference = "Stop"

$user = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "myuser" }
$db   = if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "mydatabase" }
$out  = "backup-$db-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').sql"
$tmp  = "/tmp/pg-backup.sql"

Write-Host "Exporting $db from local Docker postgres -> $out"

docker compose exec -T postgres pg_dump `
  -U $user -d $db `
  --clean --if-exists --no-owner --no-acl `
  --encoding=UTF8 `
  -f $tmp

docker compose cp "postgres:$tmp" $out
docker compose exec -T postgres rm -f $tmp

Write-Host "Done: $out"
Write-Host "Next: .\scripts\restore-to-railway.ps1 -BackupFile $out -RemoteUrl 'postgresql://...'"
