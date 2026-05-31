# E2E smoke test MVP: register, boutique, branding, produits, checkout, dashboard
$ErrorActionPreference = "Stop"
$base = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3001/api/v1" }
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "smoke-$ts@ecompilot.tn"
$password = "Test123456"
$sessionId = "smoke-sess-$ts"
$failures = 0

function Auth-Headers($token) {
  return @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
}

function Step($title, [scriptblock]$action) {
  Write-Host ""
  Write-Host "=== $title ===" -ForegroundColor Cyan
  try {
    & $action
  } catch {
    $script:failures++
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
    throw
  }
}

function Warn-Step($title, [scriptblock]$action) {
  Write-Host ""
  Write-Host "=== $title ===" -ForegroundColor Cyan
  try {
    & $action
  } catch {
    Write-Host "WARN: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

function Save-TinyPng($path) {
  $b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($b64))
}

function Upload-Multipart($uri, $token, $fieldName, $filePath) {
  if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
    $out = curl.exe -s -X POST $uri -H "Authorization: Bearer $token" -F "${fieldName}=@$filePath" 2>&1
    return $out | ConvertFrom-Json
  }
  return Invoke-RestMethod -Uri $uri -Method POST -Headers @{ Authorization = "Bearer $token" } -Form @{ $fieldName = Get-Item $filePath }
}

Step "1. REGISTER" {
  $regBody = @{
    email = $email
    password = $password
    firstName = "Smoke"
    lastName = "Test"
    companyName = "Boutique Smoke $ts"
    country = "TN"
    phone = "+21655123456"
  } | ConvertTo-Json
  $script:reg = Invoke-RestMethod -Uri "$base/auth/register" -Method POST -Body $regBody -ContentType "application/json"
  $script:token = $reg.access_token
  Write-Host "OK user=$($reg.user.email)"
}

Step "2. CREATE BOUTIQUE" {
  $shopBody = @{
    companyName = "Boutique Smoke $ts"
    business = @{
      industry = "ecommerce"
      description = "Boutique test COD"
      primaryGoal = "Vendre COD"
    }
    contact = @{
      email = $email
      phone = "+21655123456"
      city = "Tunis"
      country = "Tunisie"
    }
    branding = @{
      primaryColor = "#2563eb"
      secondaryColor = "#7c3aed"
      slogan = "Paiement a la livraison"
    }
  } | ConvertTo-Json -Depth 5
  $script:shop = Invoke-RestMethod -Uri "$base/website/generate" -Method POST -Body $shopBody -Headers (Auth-Headers $token)
  Write-Host "OK slug=$($shop.slug) name=$($shop.name)"
}

Step "3. BRANDING SLOGAN" {
  $brandBody = @{ slogan = "Livraison rapide COD Tunisie $ts" } | ConvertTo-Json
  $brand = Invoke-RestMethod -Uri "$base/website/branding" -Method PATCH -Body $brandBody -Headers (Auth-Headers $token)
  Write-Host "OK slogan=$($brand.theme.slogan)"
}

Step "4. BRANDING UPLOAD LOGO COVER" {
  $pngPath = Join-Path $env:TEMP "smoke-$ts.png"
  Save-TinyPng $pngPath
  try {
    $logoUp = Upload-Multipart "$base/upload/logo" $token "logo" $pngPath
    $coverUp = Upload-Multipart "$base/upload/cover" $token "cover" $pngPath
    $patchBody = @{
      logo = $logoUp.url
      coverImage = $coverUp.url
    } | ConvertTo-Json
    $patched = Invoke-RestMethod -Uri "$base/website/branding" -Method PATCH -Body $patchBody -Headers (Auth-Headers $token)
    Write-Host "OK logo=$($patched.theme.logo) cover=$($patched.theme.coverImage)"
  } finally {
    Remove-Item $pngPath -ErrorAction SilentlyContinue
  }
}

Step "5. GET WEBSITE CONFIG" {
  $config = Invoke-RestMethod -Uri "$base/website/config" -Method GET -Headers (Auth-Headers $token)
  Write-Host "OK storeTemplate=$($config.storeTemplate) published=$($config.published)"
}

Step "6. CREATE PRODUCT" {
  $prodBody = @{
    title = "Article Test $ts"
    description = "Produit test COD Tunisie"
    category = "Accessoires"
    status = "active"
    variants = @(
      @{
        sku = "SKU-$ts-001"
        name = "Default"
        price = 49.99
        inventory = 100
      }
    )
    images = @()
    tags = @("test", "cod")
  } | ConvertTo-Json -Depth 5
  $script:product = Invoke-RestMethod -Uri "$base/products" -Method POST -Body $prodBody -Headers (Auth-Headers $token)
  $script:productId = $product._id
  Write-Host "OK productId=$productId title=$($product.title)"
}

Step "7. LIST UPDATE GET PRODUCT" {
  $list = Invoke-RestMethod -Uri "$base/products" -Method GET -Headers (Auth-Headers $token)
  $count = if ($list.products) { $list.products.Count } else { $list.Count }
  Write-Host "OK list count=$count"
  $updateBody = @{
    title = "Article Test Modifie $ts"
    description = "Description mise a jour"
    variants = @(
      @{
        sku = "SKU-$ts-001"
        name = "Default"
        price = 79.99
        inventory = 25
      }
    )
  } | ConvertTo-Json -Depth 5
  $updated = Invoke-RestMethod -Uri "$base/products/$productId" -Method PATCH -Body $updateBody -Headers (Auth-Headers $token)
  Write-Host "OK updated title=$($updated.title) price=$($updated.variants[0].price) stock=$($updated.variants[0].inventory)"
}

Step "8. PUBLIC STOREFRONT" {
  $storefront = Invoke-RestMethod -Uri "$base/public/storefront/$($shop.slug)" -Method GET
  if (-not $storefront.store.theme.slogan) { throw "Slogan absent du storefront" }
  Write-Host "OK store=$($storefront.store.name) products=$($storefront.productCount) slogan=$($storefront.store.theme.slogan)"
}

Step "9. PUBLIC CHECKOUT COD" {
  $syncBody = @{
    sessionId = $sessionId
    items = @(
      @{
        productId = $productId
        name = $product.title
        price = 79.99
        quantity = 1
      }
    )
  } | ConvertTo-Json -Depth 5
  Invoke-RestMethod -Uri "$base/public/checkout/$($shop.slug)/cart/sync" -Method POST -Body $syncBody -ContentType "application/json" | Out-Null

  $address = @{
    fullName = "Client Smoke"
    phone = "+21698765432"
    address = "12 rue test"
    governorate = "Tunis"
    delegation = "La Marsa"
  }
  $quoteBody = @{ sessionId = $sessionId; address = $address } | ConvertTo-Json -Depth 5
  $quote = Invoke-RestMethod -Uri "$base/public/checkout/$($shop.slug)/quote" -Method POST -Body $quoteBody -ContentType "application/json"
  Write-Host "OK quote total=$($quote.totals.total)"

  $submit = Invoke-RestMethod -Uri "$base/public/checkout/$($shop.slug)/submit" -Method POST -Body $quoteBody -ContentType "application/json"
  $orderRef = if ($submit.orderId) { $submit.orderId } elseif ($submit.order._id) { $submit.order._id } else { $submit._id }
  Write-Host "OK order=$orderRef"
}

Warn-Step "10. DASHBOARD ANALYTICS" {
  $dash = Invoke-RestMethod -Uri "$base/analytics/dashboard" -Method GET -Headers (Auth-Headers $token)
  Write-Host "OK revenue=$($dash.sales.totalRevenue) orders=$($dash.sales.totalOrders)"
}

Step "11. ORDERS LIST" {
  $orders = Invoke-RestMethod -Uri "$base/orders?limit=5" -Method GET -Headers (Auth-Headers $token)
  $orderCount = if ($orders -is [System.Array]) {
    $orders.Count
  } elseif ($orders.orders) {
    $orders.orders.Count
  } elseif ($orders.data) {
    $orders.data.Count
  } else {
    0
  }
  if ($orderCount -lt 1) { throw "Aucune commande apres checkout (count=$orderCount)" }
  Write-Host "OK orders=$orderCount"
}

Step "12. DELETE PRODUCT" {
  Invoke-RestMethod -Uri "$base/products/$productId" -Method DELETE -Headers (Auth-Headers $token) | Out-Null
  Write-Host "OK deleted"
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Green
Write-Host "Email: $email"
Write-Host "Password: $password"
Write-Host "Store URL: http://localhost:5173/store/$($shop.slug)"
Write-Host "Checkout: http://localhost:5173/store/$($shop.slug)/checkout"
Write-Host "Dashboard: http://localhost:5173/dashboard"
Write-Host "Boutique admin: http://localhost:5173/website"
Write-Host "Failures: $failures"

if ($failures -gt 0) { exit 1 }
