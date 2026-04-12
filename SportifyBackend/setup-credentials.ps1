# Setup Google Cloud Credentials for Vertex AI
# Run this script before starting the application

$credPath = "D:\Doan\Khoa_Luan_Tot_Nghiep\SportifyBackend\credentials\vertex-ai-key.json"

if (Test-Path $credPath) {
    $env:GOOGLE_APPLICATION_CREDENTIALS = $credPath
    Write-Host "✅ Google Cloud credentials set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "GOOGLE_APPLICATION_CREDENTIALS = " -NoNewline -ForegroundColor Cyan
    Write-Host $env:GOOGLE_APPLICATION_CREDENTIALS -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📊 Project Info:" -ForegroundColor Cyan
    Write-Host "  - Project ID: gen-lang-client-0873999672"
    Write-Host "  - Model: gemini-2.0-flash-exp"
    Write-Host "  - Location: us-central1"
    Write-Host ""
    Write-Host "🚀 Ready to run application!" -ForegroundColor Green
    Write-Host "   Press F5 in VS Code or run: mvn spring-boot:run"
} else {
    Write-Host "❌ Error: Credentials file not found!" -ForegroundColor Red
    Write-Host "   Expected path: $credPath" -ForegroundColor Yellow
    Write-Host "   Please ensure the vertex-ai-key.json file exists in credentials folder."
}

# Pause to show output
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
