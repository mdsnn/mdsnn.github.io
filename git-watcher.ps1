param (
    [switch]$Push = $false,
    [int]$DebounceSeconds = 5,
    [int]$PollIntervalSeconds = 3
)

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         MwikoOS / Git Auto-Watcher Initialized           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Watching: $RepoRoot" -ForegroundColor Gray
if ($Push) {
    Write-Host "Auto-Push: ENABLED (pushing to origin/main on commit)" -ForegroundColor Yellow
} else {
    Write-Host "Auto-Push: DISABLED (local commits only, use -Push to enable)" -ForegroundColor Yellow
}
Write-Host "Poll Interval: $($PollIntervalSeconds)s | Debounce: $($DebounceSeconds)s" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop watching." -ForegroundColor DarkGray
Write-Host ""

$pendingChange = $false
$lastChangeTime = [DateTime]::MinValue

while ($true) {
    try {
        $statusRaw = git status --porcelain
        
        if ($statusRaw) {
            if (-not $pendingChange) {
                $pendingChange = $true
                $lastChangeTime = [DateTime]::Now
                $nowStr = (Get-Date).ToString("HH:mm:ss")
                Write-Host "[$nowStr] Change detected. Waiting $($DebounceSeconds)s for file saves to settle..." -ForegroundColor DarkYellow
            } else {
                $elapsed = ([DateTime]::Now - $lastChangeTime).TotalSeconds
                if ($elapsed -ge $DebounceSeconds) {
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
                    Write-Host "[$nowStr] Staging files..." -ForegroundColor Cyan
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
                    
                    $pendingChange = $false
                }
            }
        } else {
            if ($pendingChange) {
                $pendingChange = $false
            }
        }
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds $PollIntervalSeconds
}
