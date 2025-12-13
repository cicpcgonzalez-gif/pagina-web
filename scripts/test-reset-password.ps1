param(
    [string]$BaseUrl = $env:NEXT_PUBLIC_API_BASE_URL,
    [string]$Email,
    [string]$Token,
    [string]$Password,
    [string]$CaptchaToken
)

if (-not $BaseUrl) {
    $BaseUrl = "https://pagina-web-j7di.onrender.com"
}

function Invoke-RequestPasswordReset {
    param(
        [Parameter(Mandatory = $true)] [string]$Email,
        [string]$CaptchaToken
    )

    $payload = @{ email = $Email }
    if ($CaptchaToken) { $payload.captchaToken = $CaptchaToken }

    try {
        $resp = Invoke-RestMethod -Uri "$BaseUrl/auth/forgot-password" -Method Post -ContentType "application/json" -Body ($payload | ConvertTo-Json -Depth 4)
        Write-Host "[OK] Request sent" -ForegroundColor Green
        $resp | ConvertTo-Json -Depth 6
    } catch {
        Write-Host "[ERROR]" $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            Write-Host $reader.ReadToEnd()
        }
    }
}

function Invoke-ResetPassword {
    param(
        [Parameter(Mandatory = $true)] [string]$Token,
        [Parameter(Mandatory = $true)] [string]$Password,
        [string]$CaptchaToken
    )

    $payload = @{ token = $Token; password = $Password }
    if ($CaptchaToken) { $payload.captchaToken = $CaptchaToken }

    try {
        $resp = Invoke-RestMethod -Uri "$BaseUrl/auth/reset-password" -Method Post -ContentType "application/json" -Body ($payload | ConvertTo-Json -Depth 4)
        Write-Host "[OK] Password updated" -ForegroundColor Green
        $resp | ConvertTo-Json -Depth 6
    } catch {
        Write-Host "[ERROR]" $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            Write-Host $reader.ReadToEnd()
        }
    }
}

if ($Email -and -not $Token -and -not $Password) {
    Invoke-RequestPasswordReset -Email $Email -CaptchaToken $CaptchaToken
} elseif ($Token -and $Password) {
    Invoke-ResetPassword -Token $Token -Password $Password -CaptchaToken $CaptchaToken
} else {
    Write-Host "Usage examples:" -ForegroundColor Yellow
    Write-Host "  # Request code" -ForegroundColor Cyan
    Write-Host "  ./test-reset-password.ps1 -Email user@example.com -CaptchaToken <recaptcha-token>" -ForegroundColor White
    Write-Host "" 
    Write-Host "  # Reset password" -ForegroundColor Cyan
    Write-Host "  ./test-reset-password.ps1 -Token <token> -Password <NewPass123> -CaptchaToken <recaptcha-token>" -ForegroundColor White
    Write-Host "Env override: set NEXT_PUBLIC_API_BASE_URL or pass -BaseUrl" -ForegroundColor Yellow
}
