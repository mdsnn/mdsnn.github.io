param (
    [switch]$Push = $false,
    [int]$PollIntervalSeconds = 2
)

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         MwikoOS / Instant Git Auto-Watcher               " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Watching: $RepoRoot" -ForegroundColor Gray
if ($Push) {
    Write-Host "Auto-Push: ENABLED (pushing to origin/main immediately)" -ForegroundColor Yellow
} else {
    Write-Host "Auto-Push: DISABLED (local commits only, use -Push to enable)" -ForegroundColor Yellow
}
Write-Host "Execution Mode: INSTANT (no debounce delay)" -ForegroundColor Green
Write-Host "Poll Interval: $($PollIntervalSeconds)s" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop watching." -ForegroundColor DarkGray
Write-Host ""

while ($true) {
    try {
        $statusRaw = git status --porcelain
        
        if ($statusRaw) {
            $changedFiles = @()
            foreach ($line in $statusRaw) {
                if ($line.Length -gt 3) {
                    $changedFiles += $line.Substring(3).Trim()
                }
            }
            
            $firstFew = ($changedFiles | Select-Object -First 3) -join ", "
            if ($changedFiles.Count -gt 3) {
                $firstFew += " (+$($changedFiles.Count - 3) more)"
            }
            
            $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            $commitMsg = "auto-commit: $firstFew [$timestamp]"
            $nowStr = (Get-Date).ToString("HH:mm:ss")

            Write-Host "`n----------------------------------------------------------" -ForegroundColor DarkGray
            Write-Host "[$nowStr] Change detected! Staging files immediately..." -ForegroundColor Cyan
            git add -A

            Write-Host "[$nowStr] Committing: '$commitMsg'" -ForegroundColor Green
            git commit -m "$commitMsg"

            if ($Push) {
                Write-Host "[$nowStr] Pushing to remote repository..." -ForegroundColor Magenta
                git push
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[$nowStr] Successfully pushed to remote!" -ForegroundColor Green
                } else {
                    Write-Host "[$nowStr] Push exited with code $LASTEXITCODE" -ForegroundColor Red
                }
            }

            Write-Host "[$nowStr] Repository clean. Resuming watch..." -ForegroundColor DarkCyan
            Write-Host "----------------------------------------------------------`n" -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds $PollIntervalSeconds
}
