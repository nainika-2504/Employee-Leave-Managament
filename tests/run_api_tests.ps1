# ==============================================================================
# ELMS - Automated API Demonstration & Verification Script
# Executes end-to-end HTTP tests against local or deployed ELMS REST APIs
# ==============================================================================

param (
    [string]$BaseUrl = "http://localhost:8085"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS) - API TEST SUITE      " -ForegroundColor Cyan
Write-Host "   Target URL: $BaseUrl                                          " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$PassedCount = 0
$FailedCount = 0

function Execute-Test {
    param (
        [string]$TestId,
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{ "Content-Type" = "application/json" },
        [string]$Body = $null,
        [int]$ExpectedStatus = 200,
        [scriptblock]$CustomValidation = $null
    )

    $Url = "$BaseUrl$Endpoint"
    Write-Host "[$TestId] $TestName" -ForegroundColor White
    Write-Host "       $Method $Url" -ForegroundColor DarkGray

    try {
        $Params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        if ($Body) {
            $Params.Body = $Body
        }

        $Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $Response = Invoke-RestMethod @Params
        $Stopwatch.Stop()
        $ElapsedMs = $Stopwatch.ElapsedMilliseconds

        $ValidationPassed = $true
        $ValidationMessage = ""
        if ($CustomValidation) {
            try {
                & $CustomValidation $Response
            } catch {
                $ValidationPassed = $false
                $ValidationMessage = $_.Exception.Message
            }
        }

        if ($ValidationPassed) {
            Write-Host "       [PASS] Status: 200 OK (${ElapsedMs}ms)" -ForegroundColor Green
            $script:PassedCount++
        } else {
            Write-Host "       [FAIL] Validation Failed: $ValidationMessage" -ForegroundColor Red
            $script:FailedCount++
        }
    } catch {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        if ($StatusCode -eq $ExpectedStatus) {
            Write-Host "       [PASS] Expected Status Caught: $StatusCode (${ExpectedStatus})" -ForegroundColor Green
            $script:PassedCount++
        } else {
            Write-Host "       [FAIL] HTTP Error: $StatusCode (Expected: $ExpectedStatus)" -ForegroundColor Red
            Write-Host "              Message: $($_.Exception.Message)" -ForegroundColor DarkRed
            $script:FailedCount++
        }
    }
    Write-Host ""
}

# --- TEST SCENARIO 1: Authentication ---
Execute-Test -TestId "TC-01" `
    -TestName "POST /api/auth/login - Valid Employee Authentication" `
    -Method "POST" `
    -Endpoint "/api/auth/login" `
    -Body '{"email":"nainika@company.com","password":"password"}' `
    -CustomValidation {
        param($res)
        if (-not $res.id -or $res.role -ne "EMPLOYEE") {
            throw "Expected employee profile with role EMPLOYEE"
        }
    }

# --- TEST SCENARIO 2: Negative Authentication ---
Execute-Test -TestId "TC-02" `
    -TestName "POST /api/auth/login - Invalid Credentials Rejection" `
    -Method "POST" `
    -Endpoint "/api/auth/login" `
    -Body '{"email":"fake.user@company.com","password":"wrongpassword"}' `
    -ExpectedStatus 400

# --- TEST SCENARIO 3: Get All Users ---
Execute-Test -TestId "TC-03" `
    -TestName "GET /api/users - Retrieve All Registered User Accounts" `
    -Method "GET" `
    -Endpoint "/api/users" `
    -CustomValidation {
        param($res)
        if ($res.Count -lt 1) {
            throw "Expected non-empty list of users"
        }
    }

# --- TEST SCENARIO 4: Get Leave Balances for User ---
Execute-Test -TestId "TC-04" `
    -TestName "GET /api/users/1/balances - Retrieve User Leave Quota Balances" `
    -Method "GET" `
    -Endpoint "/api/users/1/balances" `
    -CustomValidation {
        param($res)
        if (-not $res.ANNUAL -or -not $res.SICK -or -not $res.CASUAL) {
            throw "Missing required balance categories (ANNUAL, SICK, CASUAL)"
        }
    }

# --- TEST SCENARIO 5: Get All Team Balances ---
Execute-Test -TestId "TC-05" `
    -TestName "GET /api/users/all-balances - Retrieve Team-Wide Balance Matrix" `
    -Method "GET" `
    -Endpoint "/api/users/all-balances" `
    -CustomValidation {
        param($res)
        if ($res.psobject.Properties.Count -lt 1) {
            throw "Expected team balances dictionary"
        }
    }

# --- TEST SCENARIO 6: Get Applications for Employee ---
Execute-Test -TestId "TC-06" `
    -TestName "GET /api/leaves - Filter Applications for Employee" `
    -Method "GET" `
    -Endpoint "/api/leaves?userId=1&role=EMPLOYEE" `
    -CustomValidation {
        param($res)
        if ($null -eq $res) {
            throw "Expected JSON array response"
        }
    }

# --- TEST SCENARIO 7: Get All Applications (Manager) ---
Execute-Test -TestId "TC-07" `
    -TestName "GET /api/leaves - Retrieve Department Applications (Manager View)" `
    -Method "GET" `
    -Endpoint "/api/leaves?role=MANAGER" `
    -CustomValidation {
        param($res)
        if ($null -eq $res) {
            throw "Expected JSON array response"
        }
    }

# --- TEST SCENARIO 8: Submit Leave with Exceeded Quota ---
Execute-Test -TestId "TC-08" `
    -TestName "POST /api/leaves - Reject Application Exceeding Quota" `
    -Method "POST" `
    -Endpoint "/api/leaves?queryUserId=1" `
    -Body '{"leaveType":"CASUAL","startDate":"2026-11-01","endDate":"2026-11-20","daysCount":50,"reason":"Excessive leave test"}' `
    -ExpectedStatus 400

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                       TEST RESULTS SUMMARY                      " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Total Tests Executed : $($PassedCount + $FailedCount)" -ForegroundColor White
Write-Host "   Tests Passed         : $PassedCount" -ForegroundColor Green
Write-Host "   Tests Failed         : $FailedCount" -ForegroundColor $(if ($FailedCount -gt 0) { "Red" } else { "Green" })
Write-Host "   Pass Percentage      : $([Math]::Round(($PassedCount / ($PassedCount + $FailedCount)) * 100, 1))%" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
