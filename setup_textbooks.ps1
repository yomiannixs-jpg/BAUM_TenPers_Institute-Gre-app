$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dest = Join-Path $Root "textbooks"
$Sources = @(
    (Join-Path $Root "testmaterials"),
    (Join-Path $Root "textbooks")
)

if (!(Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest | Out-Null
}

function Find-Pdf {
    param(
        [string[]]$Patterns
    )

    foreach ($Source in $Sources) {
        if (!(Test-Path $Source)) { continue }

        $pdfs = Get-ChildItem -Path $Source -File -Filter *.pdf -ErrorAction SilentlyContinue
        foreach ($Pattern in $Patterns) {
            $match = $pdfs | Where-Object { $_.Name -like $Pattern } | Select-Object -First 1
            if ($match) { return $match.FullName }
        }
    }
    return $null
}

$Books = @(
    @{
        Target = "ETS_Official_Guide_GRE_Third_Edition.pdf"
        Patterns = @(
            "*Official Guide*GRE*Third*Edition*.pdf",
            "*ETS*Official*Guide*.pdf",
            "*Official Guide to the GRE*.pdf"
        )
    },
    @{
        Target = "Manhattan_5lb_GRE_Practice_Problems.pdf"
        Patterns = @(
            "*5 lb*GRE*Practice*.pdf",
            "*Manhattan*5*lb*.pdf",
            "*Manhattan*GRE*.pdf"
        )
    },
    @{
        Target = "GRE_Big_Book.pdf"
        Patterns = @(
            "*GRE*big*book*.pdf",
            "*GRE_Big_Book*.pdf",
            "*Big Book*.pdf"
        )
    }
)

Write-Host ""
Write-Host "BAUM TenPers GRE textbook setup" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host ""

$missing = @()

foreach ($Book in $Books) {
    $targetPath = Join-Path $Dest $Book.Target
    $sourcePath = Find-Pdf -Patterns $Book.Patterns

    if ($sourcePath) {
        # Avoid copying a file onto itself.
        if ((Resolve-Path $sourcePath).Path -ne (Resolve-Path -LiteralPath $targetPath -ErrorAction SilentlyContinue).Path) {
            Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
        }
        Write-Host "[OK] $($Book.Target)" -ForegroundColor Green
        Write-Host "     from: $sourcePath"
    }
    elseif (Test-Path $targetPath) {
        Write-Host "[OK] $($Book.Target) already exists." -ForegroundColor Green
    }
    else {
        Write-Host "[MISSING] $($Book.Target)" -ForegroundColor Yellow
        $missing += $Book.Target
    }
}

Write-Host ""
if ($missing.Count -eq 0) {
    Write-Host "All textbook links are ready." -ForegroundColor Green
    Write-Host "Open: http://localhost:8080/textbooks.html"
} else {
    Write-Host "Some PDFs were not found automatically." -ForegroundColor Yellow
    Write-Host "Put the missing PDF(s) in testmaterials or textbooks, then rerun this script."
    $missing | ForEach-Object { Write-Host " - $_" }
}
Write-Host ""
