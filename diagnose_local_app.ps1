$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "BAUM TenPers GRE local diagnostics" -ForegroundColor Cyan
Write-Host "App root: $Root"
$tb = Join-Path $Root "textbooks"
if (!(Test-Path $tb)) { Write-Host "[ERROR] textbooks folder does not exist." -ForegroundColor Red; exit 1 }
$pdfs = Get-ChildItem -LiteralPath $tb -File -Filter *.pdf
Write-Host "PDF files found in textbooks: $($pdfs.Count)"
$pdfs | ForEach-Object { Write-Host " - $($_.Name)" -ForegroundColor Green }
Write-Host ""
Write-Host "Start the server from THIS exact folder:" -ForegroundColor Yellow
Write-Host "cd `"$Root`""
Write-Host "python -m http.server 8080"
Write-Host "Then open: http://localhost:8080/"
