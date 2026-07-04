param(
    [string]$BaseUrl = "http://localhost:5000"
)

$script:passed = 0
$script:failed = 0

function Test-Case {
    param($Name, $ScriptBlock)
    try {
        & $ScriptBlock
        Write-Host "  PASS: $Name" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "  FAIL: $Name - $_" -ForegroundColor Red
        $script:failed++
    }
}

function Get-StatusCode {
    param($ErrorObj)
    try { return [int]$ErrorObj.Exception.Response.StatusCode.value__ } catch { return $null }
}

function Sleep-ABit { Start-Sleep -Milliseconds 300 }

# ---------- SESSION ----------
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MERN QA Test Suite" -ForegroundColor Cyan
Write-Host "  Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# =========================================================
# HEALTH (1)
# =========================================================
Write-Host "[HEALTH]" -ForegroundColor Yellow

Test-Case -Name "GET /api/health returns success" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/health" -WebSession $session -Method Get
    if (-not $res.success) { throw "health success=false" }
}

# =========================================================
# AUTH (6)
# =========================================================
Write-Host "[AUTH]" -ForegroundColor Yellow

Test-Case -Name "Login as admin" -ScriptBlock {
    $body = @{ email = "admin@merabachamerishan.com"; password = "Admin@123" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -WebSession $session -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "login failed: $($res.message)" }
    $script:adminData = $res.data
    Write-Host "    (Admin: $($res.data.name) / $($res.data.role))" -ForegroundColor Gray
}

Test-Case -Name "GET /api/v1/auth/me returns current user" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/me" -WebSession $session -Method Get
    if (-not $res.success) { throw "getMe failed: $($res.message)" }
    if (-not $res.data._id) { throw "no user _id in response" }
}

Test-Case -Name "Register a new user" -ScriptBlock {
    $email = "qa_$(Get-Random -Minimum 10000 -Maximum 99999)@test.com"
    $body = @{ name = "QA User"; email = $email; password = "QaPass123!" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -WebSession $session -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "register failed: $($res.message)" }
    $script:testUserEmail = $email
    Write-Host "    (Registered: $email)" -ForegroundColor Gray
}

Test-Case -Name "Logout clears session" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/logout" -WebSession $session -Method Post
    if (-not $res.success) { throw "logout failed: $($res.message)" }
}

Test-Case -Name "Protected route returns 401 without auth" -ScriptBlock {
    $fresh = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    try { $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/me" -WebSession $fresh -Method Get; throw "NoError" }
    catch { $code = Get-StatusCode $_; if ($code -ne 401) { throw "Expected 401 got $code" } }
}

Test-Case -Name "Re-login for subsequent tests" -ScriptBlock {
    $body = @{ email = "admin@merabachamerishan.com"; password = "Admin@123" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -WebSession $session -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "re-login failed: $($res.message)" }
}

Sleep-ABit

# =========================================================
# VIDEOS (4)
# =========================================================
Write-Host "[VIDEOS]" -ForegroundColor Yellow

Test-Case -Name "GET /api/v1/videos returns array" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/videos" -WebSession $session -Method Get
    if ($res.data -isnot [System.Array]) { throw "data is not an array" }
    Write-Host "    ($($res.data.Count) videos)" -ForegroundColor Gray
}

Test-Case -Name "POST /api/v1/videos without file returns 400" -ScriptBlock {
    try {
        $body = @{ title = "No-File Video"; description = "Should fail" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/videos" -WebSession $session -Method Post `
            -Body $body -ContentType "application/json"
        throw "NoError"
    } catch { $code = Get-StatusCode $_; if ($code -ne 400) { throw "Expected 400 got $code" } }
}

Test-Case -Name "GET /api/v1/videos/bad-id returns 404" -ScriptBlock {
    try { $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/videos/000000000000000000000000" -WebSession $session -Method Get; throw "NoError" }
    catch { $code = Get-StatusCode $_; if ($code -ne 404) { throw "Expected 404 got $code" } }
}

Test-Case -Name "POST /api/v1/videos without auth returns 401" -ScriptBlock {
    $fresh = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    try {
        $body = @{ title = "No-Auth Vid"; description = "x" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/videos" -WebSession $fresh -Method Post `
            -Body $body -ContentType "application/json"
        throw "NoError"
    } catch { $code = Get-StatusCode $_; if ($code -ne 401) { throw "Expected 401 got $code" } }
}

Sleep-ABit

# =========================================================
# CATEGORIES (3)
# =========================================================
Write-Host "[CATEGORIES]" -ForegroundColor Yellow

$script:catId = $null

Test-Case -Name "GET /api/v1/categories returns array" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/categories" -WebSession $session -Method Get
    if ($res.data -isnot [System.Array]) { throw "data is not an array" }
    Write-Host "    ($($res.data.Count) categories)" -ForegroundColor Gray
}

Test-Case -Name "POST /api/v1/categories creates category" -ScriptBlock {
    $name = "QA-Cat-$(Get-Random -Minimum 100 -Maximum 999)"
    $body = @{ name = $name; description = "QA test" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/categories" -WebSession $session -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "create failed: $($res.message)" }
    $script:catId = $res.data._id
    if (-not $script:catId) { throw "no _id returned" }
    Write-Host "    (Created: $name -> $script:catId)" -ForegroundColor Gray
}

Test-Case -Name "DELETE /api/v1/categories/:id deletes category" -ScriptBlock {
    if (-not $script:catId) { throw "no catId to delete" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/categories/$script:catId" -WebSession $session -Method Delete
    if (-not $res.success) { throw "delete failed: $($res.message)" }
}

Sleep-ABit

# =========================================================
# QUOTES (3)
# =========================================================
Write-Host "[QUOTES]" -ForegroundColor Yellow

$script:quoteId = $null

Test-Case -Name "GET /api/v1/quotes/daily returns a quote" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/quotes/daily" -WebSession $session -Method Get
    if (-not $res.success) { throw "daily quote failed: $($res.message)" }
    if (-not $res.data._id) { throw "no quote _id" }
    Write-Host "    (Daily quote: $($res.data._id))" -ForegroundColor Gray
}

Test-Case -Name "POST /api/v1/quotes creates a quote" -ScriptBlock {
    $body = @{ content = "QA test quote $(Get-Random)"; author = "QA Tester" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/quotes" -WebSession $session -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "create quote failed: $($res.message)" }
    $script:quoteId = $res.data._id
    if (-not $script:quoteId) { throw "no quote _id" }
    Write-Host "    (Created: $script:quoteId)" -ForegroundColor Gray
}

Test-Case -Name "DELETE /api/v1/quotes/:id deletes quote" -ScriptBlock {
    if (-not $script:quoteId) { throw "no quoteId to delete" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/quotes/$script:quoteId" -WebSession $session -Method Delete
    if (-not $res.success) { throw "delete quote failed: $($res.message)" }
}

Sleep-ABit

# =========================================================
# CONTACT (2)
# =========================================================
Write-Host "[CONTACT]" -ForegroundColor Yellow

Test-Case -Name "POST /api/v1/contact (no auth) submits form" -ScriptBlock {
    $fresh = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $body = @{ name = "QA Tester"; email = "qa_$(Get-Random)@test.com"; message = "QA test message" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/contact" -WebSession $fresh -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "contact submit failed: $($res.message)" }
}

Test-Case -Name "GET /api/v1/contact as admin returns messages" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/contact" -WebSession $session -Method Get
    if (-not $res.success) { throw "list contact failed: $($res.message)" }
    if ($res.data -isnot [System.Array]) { throw "data is not an array" }
    Write-Host "    ($($res.data.Count) messages)" -ForegroundColor Gray
}

Sleep-ABit

# =========================================================
# USERS (3)
# =========================================================
Write-Host "[USERS]" -ForegroundColor Yellow

Test-Case -Name "GET /api/v1/users as admin returns array" -ScriptBlock {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/users" -WebSession $session -Method Get
    if (-not $res.success) { throw "list users failed: $($res.message)" }
    if ($res.data -isnot [System.Array]) { throw "data is not an array" }
    Write-Host "    ($($res.data.Count) users)" -ForegroundColor Gray
}

Test-Case -Name "PUT /api/v1/users/profile/update updates name" -ScriptBlock {
    $body = @{ name = "QA Updated Admin" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/users/profile/update" -WebSession $session -Method Put `
        -Body $body -ContentType "application/json"
    if (-not $res.success) { throw "update profile failed: $($res.message)" }
    # Revert
    $body2 = @{ name = "Admin" } | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/users/profile/update" -WebSession $session -Method Put `
        -Body $body2 -ContentType "application/json"
}

Test-Case -Name "Non-admin GET /api/v1/users returns 403" -ScriptBlock {
    $email2 = "nonadmin_$(Get-Random -Minimum 10000 -Maximum 99999)@test.com"
    $body = @{ name = "Non Admin"; email = $email2; password = "QaPass123!" } | ConvertTo-Json
    $ns = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $reg = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -WebSession $ns -Method Post `
        -Body $body -ContentType "application/json"
    if (-not $reg.success) { throw "register for non-admin failed" }
    try { $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/users" -WebSession $ns -Method Get; throw "NoError" }
    catch { $code = Get-StatusCode $_; if ($code -ne 403 -and $code -ne 401) { throw "Expected 403/401 got $code" } }
    Write-Host "    (Non-admin blocked correctly)" -ForegroundColor Gray
}

# =========================================================
# EDGE CASES (4)
# =========================================================
Write-Host "[EDGE CASES]" -ForegroundColor Yellow

Sleep-ABit

Test-Case -Name "Invalid login returns 401 (or 429 if rate limited)" -ScriptBlock {
    try {
        $body = @{ email = "nobody@nowhere.com"; password = "badpass" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method Post `
            -Body $body -ContentType "application/json"
        throw "NoError"
    } catch { $code = Get-StatusCode $_; if ($code -notin @(401,429)) { throw "Expected 401/429 got $code" } }
}

Sleep-ABit

Test-Case -Name "Duplicate email registration returns 400 (or 429)" -ScriptBlock {
    try {
        $body = @{ name = "Dup"; email = "admin@merabachamerishan.com"; password = "QaPass123!" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/register" -Method Post `
            -Body $body -ContentType "application/json"
        throw "NoError"
    } catch { $code = Get-StatusCode $_; if ($code -notin @(400,409,429)) { throw "Expected 400/409/429 got $code" } }
}

Sleep-ABit

Test-Case -Name "Invalid ObjectId returns 400/404/500" -ScriptBlock {
    try { $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/categories/invalid-id-here" -WebSession $session -Method Get; throw "NoError" }
    catch { $code = Get-StatusCode $_; if ($code -notin @(404,400,500,429)) { throw "Expected 4xx/5xx got $code" } }
}

Sleep-ABit

Test-Case -Name "Non-existent route returns 404 (or 429)" -ScriptBlock {
    try { $null = Invoke-RestMethod -Uri "$BaseUrl/api/v1/nonexistent" -WebSession $session -Method Get; throw "NoError" }
    catch { $code = Get-StatusCode $_; if ($code -notin @(404,429)) { throw "Expected 404/429 got $code" } }
}

# =========================================================
# SUMMARY
# =========================================================
$total = $script:passed + $script:failed
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Passed: $($script:passed)" -ForegroundColor Green
Write-Host "  Failed: $($script:failed)" -ForegroundColor Red
Write-Host "  Total:  $total" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor Cyan

if ($script:failed -eq 0) {
    Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "  SOME TESTS FAILED!" -ForegroundColor Red
}
Write-Host "=====================================" -ForegroundColor Cyan

exit $script:failed
