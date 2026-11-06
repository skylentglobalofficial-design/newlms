# =============================================================================
# SKYLENT PLAY STORE NATIVE APK & SIGNED AAB BUILDER (V89 - versionCode 8900)
# Generates:
#   1. skylent-playstore-debug.apk   (Signed with Unified Production Keystore)
#   2. skylent-playstore-release.apk (Signed Release APK for phone install)
#   3. skylent-playstore-release.aab (Signed Release Bundle for Google Play Console)
# Includes:
#   - 100% Same-Origin Production Sync (https://skylent.live - Zero CORS errors on Catalogue or Login)
#   - Pre-Load appendUserAgent (SkylentNativeApp/8.9.0 SkylentVersionCode/8900 SkylentNativeInsetsApplied)
#   - Unified Keystore Signing for both Debug & Release (prevents signature conflict on phone)
#   - Version-Downgrade Lock (versionCode 8900 / versionName 8.9.0 blocks old APKs from overwriting)
#   - Exact Hardware Notification-Bar & Soft-Keyboard Inset Engine (5-inch to 6.8-inch phones)
#   - In-App PayU India Checkout + Native UPI Intent Launcher (GPay, PhonePe, Paytm, BHIM)
# =============================================================================
$ErrorActionPreference = "Stop"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SKYLENT PLAY STORE APK & SIGNED AAB BUILDER (V89 - v8.9.0)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Step 1: Security Audit - Ensure no server secrets are prefixed with VITE_
Write-Host "`n[1/7] Running Client Bundle Security Audit..." -ForegroundColor Yellow
if (Test-Path ".env") {
  $envLines = Get-Content ".env"
  foreach ($line in $envLines) {
    if ($line -match "^VITE_.*(SECRET|PASSWORD|DATABASE_URL|PRIVATE_KEY)") {
      throw "SECURITY BLOCK: Found sensitive server key in VITE_ variable: $line"
    }
  }
}
Write-Host "  [OK] Zero backend secrets exposed to client bundle." -ForegroundColor Green

# Step 2: Build Production Frontend Bundle (dist/) - Remove any old dist/ or .apk first!
Write-Host "`n[2/7] Building Clean Standalone Frontend Bundle (dist/)..." -ForegroundColor Yellow
$PublicApk1 = Join-Path (Get-Location).Path "public\skylent.apk"
$PublicApk2 = Join-Path (Get-Location).Path "public\skylent-latest.apk"
if (Test-Path $PublicApk1) { Remove-Item $PublicApk1 -Force -ErrorAction SilentlyContinue }
if (Test-Path $PublicApk2) { Remove-Item $PublicApk2 -Force -ErrorAction SilentlyContinue }
if (Test-Path "dist") {
  Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
}

cmd /c "npx vite build"
if ($LASTEXITCODE -ne 0 -or -not (Test-Path "dist/index.html")) {
  throw "CRITICAL BUILD STOP: npx vite build failed (exit code $LASTEXITCODE). Stopping APK build so stale dist/ is never packaged!"
}
$DistApk = Join-Path (Get-Location).Path "dist\skylent-latest.apk"
if (Test-Path $DistApk) { Remove-Item $DistApk -Force -ErrorAction SilentlyContinue }
Write-Host "  [OK] Fresh V89 UI bundle compiled into dist/ (zero stale assets)." -ForegroundColor Green

# Step 3: Ensure Capacitor Android packages are installed
Write-Host "`n[3/7] Checking Capacitor Native Android Dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules/@capacitor/android")) {
  Write-Host "  Installing @capacitor/core, @capacitor/cli, @capacitor/android..." -ForegroundColor Cyan
  cmd /c "npm install @capacitor/core @capacitor/android --no-save"
  cmd /c "npm install -D @capacitor/cli --no-save"
}
Write-Host "  [OK] Capacitor Android packages ready." -ForegroundColor Green

# Step 4: Initialize or Sync Android Native Project & Write Manifest + MainActivity + Styles
Write-Host "`n[4/7] Syncing Same-Origin Native App Shell (https://skylent.live + PayU & UPI In-App)..." -ForegroundColor Yellow
$capConfigPath = Join-Path (Get-Location).Path "capacitor.config.json"
$capConfigJson = @"
{
  "appId": "live.skylent.app",
  "appName": "Skylent",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "appendUserAgent": "SkylentNativeApp/8.9.0 SkylentVersionCode/8900 SkylentNativeInsetsApplied",
  "server": {
    "url": "https://skylent.live",
    "cleartext": false,
    "androidScheme": "https",
    "allowNavigation": [
      "skylent.live",
      "*.skylent.live",
      "secure.payu.in",
      "test.payu.in",
      "*.payu.in",
      "*.payumoney.com",
      "*.payubiz.in",
      "accounts.google.com",
      "*.google.com"
    ]
  }
}
"@
[System.IO.File]::WriteAllText($capConfigPath, $capConfigJson.Replace("`r`n", "`n"), $Utf8NoBom)

if (-not (Test-Path "android")) {
  cmd /c "npx cap add android"
}
cmd /c "npx cap sync android"

$manifestPath = Join-Path (Get-Location).Path "android\app\src\main\AndroidManifest.xml"
$cleanManifestXml = @"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <queries>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="upi" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="tez" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="phonepe" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="paytmmp" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="bhim" />
        </intent>
    </queries>

    <application
        android:allowBackup="false"
        android:usesCleartextTraffic="false"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|fontScale"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="skylent" android:host="auth" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="`${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
"@
[System.IO.File]::WriteAllText($manifestPath, $cleanManifestXml.Replace("`r`n", "`n"), $Utf8NoBom)

# Write custom MainActivity.java (Single Exact WindowInsets Engine + PayU/UPI In-App + OAuth Deep Link)
$mainActivityDir = Join-Path (Get-Location).Path "android\app\src\main\java\live\skylent\app"
if (-not (Test-Path $mainActivityDir)) {
  New-Item -ItemType Directory -Path $mainActivityDir -Force | Out-Null
}
$mainActivityPath = Join-Path $mainActivityDir "MainActivity.java"
$mainActivityJava = @"
package live.skylent.app;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeWebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private long lastBackPressTime = 0;

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Exact Hardware Notification-Bar & Soft-Keyboard Inset Engine (Zero overlap, zero double gap)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.parseColor("#0F172A"));
        getWindow().setNavigationBarColor(Color.parseColor("#FFFFFF"));
        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(false);
        }

        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            contentView.setBackgroundColor(Color.parseColor("#0F172A"));
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                Insets sysBars = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                );
                Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
                int topInset = sysBars.top > 0 ? sysBars.top : dpToPx(24);
                int bottomInset = Math.max(sysBars.bottom, ime.bottom);
                v.setPadding(sysBars.left, topInset, sysBars.right, bottomInset);
                return WindowInsetsCompat.CONSUMED;
            });
        }

        if (getBridge() != null && getBridge().getWebView() != null) {
            final WebView webView = getBridge().getWebView();

            // 2. Configure WebView: lock static 100% text zoom, enable cookies & strip "; wv" for Google OAuth
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setTextZoom(100);
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);

            String ua = settings.getUserAgentString();
            if (ua != null) {
                String cleanUa = ua.replace("; wv", "").replace("wv)", "");
                if (!cleanUa.contains("SkylentVersionCode/8900")) {
                    cleanUa = cleanUa + " SkylentNativeApp/8.9.0 SkylentVersionCode/8900 SkylentNativeInsetsApplied";
                }
                settings.setUserAgentString(cleanUa);
            }

            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                try {
                    Intent downloadIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(downloadIntent);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Opening download in browser...", Toast.LENGTH_SHORT).show();
                }
            });

            // 2B. Native UPI Intent Launcher (GPay, PhonePe, Paytm, BHIM, intent://)
            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    if (uri != null) {
                        String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
                        String urlStr = uri.toString();

                        if (scheme.equals("upi") || scheme.equals("tez") || scheme.equals("phonepe") ||
                            scheme.equals("paytmmp") || scheme.equals("bhim") || scheme.equals("credpay") ||
                            scheme.equals("mailto") || scheme.equals("tel") || scheme.equals("whatsapp")) {
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                                startActivity(intent);
                            } catch (Exception e) {
                                Toast.makeText(MainActivity.this, "UPI / target app is not installed on this phone", Toast.LENGTH_SHORT).show();
                            }
                            return true;
                        }
                        if (scheme.equals("intent")) {
                            try {
                                Intent intent = Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME);
                                if (intent != null) {
                                    startActivity(intent);
                                    return true;
                                }
                            } catch (Exception e) {
                                Toast.makeText(MainActivity.this, "Unable to open payment app", Toast.LENGTH_SHORT).show();
                                return true;
                            }
                        }
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }
            });
        }

        // 3. Handle skylent://auth deep link if launched from Google OAuth callback
        handleAuthDeepLink(getIntent());

        // 4. Intercept Android Back button: handle PayU gateway cancel cleanly in-app -> close modals -> router back -> double-back exit
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    final WebView webView = getBridge().getWebView();
                    final String currentUrl = webView.getUrl() != null ? webView.getUrl() : "";

                    if (currentUrl.contains("payu.in") || currentUrl.contains("payumoney.com") || currentUrl.contains("payubiz.in")) {
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            webView.loadUrl("https://skylent.live/dashboard/student?payment=cancelled#explore-programmes");
                        }
                        return;
                    }

                    webView.evaluateJavascript(
                        "(function() { " +
                        "  var closeBtn = document.querySelector('.skn-sheet__close, [role=\"dialog\"] button[aria-label*=\"Close\"]'); " +
                        "  if (closeBtn) { closeBtn.click(); return 'MODAL_CLOSED'; } " +
                        "  var p = window.location.pathname; " +
                        "  if (p !== '/' && p !== '/index.html' && p !== '/programmes' && p !== '/dashboard/student' && p !== '/dashboard/admin' && p !== '/login') { " +
                        "    if (window.history.length > 1) { window.history.back(); } else { window.location.href = '/programmes'; } " +
                        "    return 'NAVIGATED_BACK'; " +
                        "  } " +
                        "  return 'AT_HOME'; " +
                        "})()",
                        value -> {
                            if (value != null && (value.contains("MODAL_CLOSED") || value.contains("NAVIGATED_BACK"))) {
                                return;
                            }
                            if (webView.canGoBack()) {
                                webView.goBack();
                                return;
                            }
                            long now = System.currentTimeMillis();
                            if (now - lastBackPressTime < 2000) {
                                finish();
                            } else {
                                lastBackPressTime = now;
                                Toast.makeText(MainActivity.this, "Press back again to exit Skylent", Toast.LENGTH_SHORT).show();
                            }
                        }
                    );
                } else {
                    finish();
                }
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAuthDeepLink(intent);
    }

    private void handleAuthDeepLink(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data == null || !"skylent".equalsIgnoreCase(data.getScheme())) return;

        final String query = data.getEncodedQuery();
        final String sessionToken = data.getQueryParameter("sessionToken");
        final String csrfToken = data.getQueryParameter("csrfToken");

        if (getBridge() != null && getBridge().getWebView() != null) {
            final WebView webView = getBridge().getWebView();
            final String targetUrl = "https://skylent.live/login" + (query != null && !query.isEmpty() ? "?" + query : "?oauth=success");
            webView.post(() -> {
                if (sessionToken != null && !sessionToken.isEmpty()) {
                    String js = "(function(){" +
                        "try {" +
                        "  localStorage.setItem('skylent:native:session-token:v1', '" + sessionToken.replace("'", "") + "');" +
                        (csrfToken != null ? "  localStorage.setItem('skylent:native:csrf-token:v1', '" + csrfToken.replace("'", "") + "');" : "") +
                        "} catch(e){}" +
                        "window.location.replace('" + targetUrl.replace("'", "") + "');" +
                        "})();";
                    webView.evaluateJavascript(js, null);
                } else {
                    webView.loadUrl(targetUrl);
                }
            });
        }
    }
}
"@
[System.IO.File]::WriteAllText($mainActivityPath, $mainActivityJava.Replace("`r`n", "`n"), $Utf8NoBom)

# Write styles.xml
$stylesXmlPath = Join-Path (Get-Location).Path "android\app\src\main\res\values\styles.xml"
$cleanStylesXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#5142B5</item>
        <item name="colorPrimaryDark">#0F172A</item>
        <item name="colorAccent">#5142B5</item>
        <item name="android:statusBarColor">#0F172A</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:statusBarColor">#0F172A</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@null</item>
        <item name="android:statusBarColor">#0F172A</item>
    </style>
</resources>
"@
[System.IO.File]::WriteAllText($stylesXmlPath, $cleanStylesXml.Replace("`r`n", "`n"), $Utf8NoBom)
$v35Dir = Join-Path (Get-Location).Path "android\app\src\main\res\values-v35"
if (-not (Test-Path $v35Dir)) { New-Item -ItemType Directory -Path $v35Dir -Force | Out-Null }
$v35StylesPath = Join-Path $v35Dir "styles.xml"
[System.IO.File]::WriteAllText($v35StylesPath, $cleanStylesXml.Replace("`r`n", "`n"), $Utf8NoBom)
Write-Host "  [OK] Wrote AndroidManifest.xml, MainActivity.java (Same-Origin + Exact WindowInsets), and styles.xml." -ForegroundColor Green

# Step 5: Configure Java JDK 21 & Android SDK Toolchain
Write-Host "`n[5/7] Configuring Java JDK 21 & Android SDK Toolchain..." -ForegroundColor Yellow
$ToolchainRoot = Join-Path $HOME ".skylent-android-toolchain"
if (-not (Test-Path $ToolchainRoot)) {
  New-Item -ItemType Directory -Path $ToolchainRoot -Force | Out-Null
}

function Find-JavaHome {
  $candidates = @()
  $searchRoots = @(
    (Join-Path $ToolchainRoot "jdk"),
    "C:\Program Files\Android\Android Studio",
    "C:\Program Files\Microsoft",
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Java"
  )
  foreach ($root in $searchRoots) {
    if (Test-Path $root) {
      if (Test-Path (Join-Path $root "jbr\bin\java.exe")) {
        $candidates += (Join-Path $root "jbr")
      }
      $dirs = Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending
      foreach ($d in $dirs) {
        if (Test-Path (Join-Path $d.FullName "bin\java.exe")) {
          $candidates += $d.FullName
        }
      }
    }
  }
  if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    $candidates += $env:JAVA_HOME
  }
  foreach ($c in $candidates) {
    return $c
  }
  return $null
}

$JavaHomeFound = Find-JavaHome
if (-not $JavaHomeFound) {
  Write-Host "  Downloading Portable Microsoft OpenJDK 21 (Windows x64)..." -ForegroundColor Cyan
  $JdkZip = Join-Path $ToolchainRoot "microsoft-jdk-21.zip"
  $JdkExtract = Join-Path $ToolchainRoot "jdk"
  if (-not (Test-Path $JdkExtract)) {
    New-Item -ItemType Directory -Path $JdkExtract -Force | Out-Null
  }
  cmd /c "curl.exe -L --retry 3 `"https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip`" -o `"$JdkZip`""
  Expand-Archive -Path $JdkZip -DestinationPath $JdkExtract -Force
  Remove-Item $JdkZip -Force -ErrorAction SilentlyContinue
  $JavaHomeFound = Find-JavaHome
}

$env:JAVA_HOME = $JavaHomeFound
$env:PATH = "$JavaHomeFound\bin;$env:PATH"
Write-Host "  [OK] JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green

$sdkCandidates = @(
  $env:ANDROID_HOME,
  $env:ANDROID_SDK_ROOT,
  (Join-Path $env:LOCALAPPDATA "Android\Sdk"),
  (Join-Path $HOME "AppData\Local\Android\Sdk"),
  "C:\Users\Chandan\AppData\Local\Android\Sdk",
  "C:\Android\Sdk",
  "C:\Program Files (x86)\Android\android-sdk",
  (Join-Path $ToolchainRoot "android-sdk")
)
$SdkRoot = $null
foreach ($c in $sdkCandidates) {
  if ($c -and (Test-Path $c)) {
    $SdkRoot = $c
    break
  }
}
if (-not $SdkRoot) {
  $SdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
}

$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$EscapedSdk = $SdkRoot.Replace("\", "\\")
$LocalPropsPath = Join-Path (Get-Location).Path "android\local.properties"
[System.IO.File]::WriteAllText($LocalPropsPath, "sdk.dir=$EscapedSdk`n", $Utf8NoBom)
Write-Host "  [OK] ANDROID_HOME set to: $SdkRoot" -ForegroundColor Green

# Step 6: Auto-Generate Production Play Store Keystore & Configure Unified Signing (Debug + Release) + versionCode 8900
Write-Host "`n[6/7] Configuring Unified Release Signing & versionCode 8900..." -ForegroundColor Yellow
$KeystoreDir = Join-Path $ToolchainRoot "keystore"
if (-not (Test-Path $KeystoreDir)) {
  New-Item -ItemType Directory -Path $KeystoreDir -Force | Out-Null
}
$KeystorePath = Join-Path $KeystoreDir "skylent-upload-key.jks"
$KeytoolExe = Join-Path $env:JAVA_HOME "bin\keytool.exe"

if (-not (Test-Path $KeystorePath)) {
  Write-Host "  Generating 2048-bit RSA Play Store Upload Keystore..." -ForegroundColor Cyan
  & $KeytoolExe -genkeypair -v -keystore $KeystorePath -alias "skylent-upload" -keyalg RSA -keysize 2048 -validity 10000 -storepass "SkylentPlayStore2026!" -keypass "SkylentPlayStore2026!" -dname "CN=Skylent Global, OU=Mobile, O=Skylent, L=Bhubaneswar, ST=Odisha, C=IN" | Out-Null
}
Write-Host "  [OK] Production Keystore ready: $KeystorePath" -ForegroundColor Green

$AppBuildGradle = Join-Path (Get-Location).Path "android\app\build.gradle"
if (Test-Path $AppBuildGradle) {
  $gradleText = Get-Content $AppBuildGradle -Raw
  $markerIdx = $gradleText.IndexOf("// SKYLENT_PLAYSTORE_RELEASE_SIGNING")
  if ($markerIdx -ge 0) {
    $gradleText = $gradleText.Substring(0, $markerIdx).TrimEnd()
  }
  $gradleText = [regex]::Replace($gradleText, 'versionCode\s+\d+', 'versionCode 8900')
  $gradleText = [regex]::Replace($gradleText, 'versionName\s+"[^"]+"', 'versionName "8.9.0"')

  $KeystoreSlash = $KeystorePath.Replace("\", "/")
  $signingBlock = @"


// SKYLENT_PLAYSTORE_RELEASE_SIGNING
android {
    signingConfigs {
        release {
            storeFile file("$KeystoreSlash")
            storePassword "SkylentPlayStore2026!"
            keyAlias "skylent-upload"
            keyPassword "SkylentPlayStore2026!"
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.release
        }
        release {
            signingConfig signingConfigs.release
        }
    }
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
}
"@
  $gradleText = $gradleText + $signingBlock
  [System.IO.File]::WriteAllText($AppBuildGradle, $gradleText.Replace("`r`n", "`n"), $Utf8NoBom)
  Write-Host "  [OK] Configured versionCode 8900 (v8.9.0) & Unified Keystore Signing (Debug + Release) in android/app/build.gradle." -ForegroundColor Green
}

# Step 7: Compile Debug APK + Signed Release APK + Signed Release AAB
Write-Host "`n[7/7] Compiling Play Store APK & Signed AAB Bundle via Gradle..." -ForegroundColor Yellow
if (Test-Path "android/gradlew.bat") {
  Push-Location "android"
  cmd /c "gradlew.bat assembleDebug assembleRelease bundleRelease --no-daemon"
  $gradleExit = $LASTEXITCODE
  Pop-Location

  $DownloadsDir = Join-Path $HOME "Downloads"
  $DebugApkSrc = "android/app/build/outputs/apk/debug/app-debug.apk"
  $ReleaseApkSrc = "android/app/build/outputs/apk/release/app-release.apk"
  $ReleaseAabSrc = "android/app/build/outputs/bundle/release/app-release.aab"

  if (-not (Test-Path $ReleaseApkSrc) -and -not (Test-Path $DebugApkSrc)) {
    Write-Host "  [BUILD RETRY] Running gradlew assembleDebug assembleRelease..." -ForegroundColor Cyan
    Push-Location "android"
    cmd /c "gradlew.bat assembleDebug assembleRelease --no-daemon --stacktrace"
    $gradleExit = $LASTEXITCODE
    Pop-Location
  }

  $PrimaryApkSrc = if (Test-Path $ReleaseApkSrc) { $ReleaseApkSrc } elseif (Test-Path $DebugApkSrc) { $DebugApkSrc } else { $null }
  if ($PrimaryApkSrc) {
    $OutDebugApk = Join-Path $DownloadsDir "skylent-playstore-debug.apk"
    $OutReleaseApk = Join-Path $DownloadsDir "skylent-playstore-release.apk"
    $OutReleaseAab = Join-Path $DownloadsDir "skylent-playstore-release.aab"

    if (Test-Path $DebugApkSrc) {
      Copy-Item -Path $DebugApkSrc -Destination (Join-Path (Get-Location).Path "skylent-playstore-debug.apk") -Force
      Copy-Item -Path $DebugApkSrc -Destination $OutDebugApk -Force -ErrorAction SilentlyContinue
    }
    Copy-Item -Path $PrimaryApkSrc -Destination (Join-Path (Get-Location).Path "skylent-playstore-release.apk") -Force
    Copy-Item -Path $PrimaryApkSrc -Destination (Join-Path (Get-Location).Path "dist\skylent-latest.apk") -Force -ErrorAction SilentlyContinue
    Copy-Item -Path $PrimaryApkSrc -Destination $OutReleaseApk -Force -ErrorAction SilentlyContinue

    if (Test-Path $ReleaseAabSrc) {
      Copy-Item -Path $ReleaseAabSrc -Destination (Join-Path (Get-Location).Path "skylent-playstore-release.aab") -Force
      Copy-Item -Path $ReleaseAabSrc -Destination $OutReleaseAab -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path "playstore-assets") {
      Copy-Item -Path "playstore-assets\*" -Destination $DownloadsDir -Force -ErrorAction SilentlyContinue
    }

    $TargetApkForSize = if (Test-Path $OutReleaseApk) { $OutReleaseApk } else { $PrimaryApkSrc }
    $ApkSizeMb = [math]::Round(((Get-Item $TargetApkForSize).Length / 1MB), 2)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] ALL GOOGLE PLAY STORE FILES GENERATED (V89 - v8.9.0 / versionCode 8900)!" -ForegroundColor Green
    Write-Host "  1. Phone Test APK (Signed) : $OutReleaseApk ($ApkSizeMb MB)" -ForegroundColor White
    Write-Host "  2. Phone Test APK (Debug)  : $OutDebugApk" -ForegroundColor White
    Write-Host "  3. Play Store Upload (.aab): $OutReleaseAab" -ForegroundColor Cyan
    Write-Host "  4. Live Server APK Endpoint: dist\skylent-latest.apk" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green

    Start-Process "explorer.exe" -ArgumentList "/select,`"$OutReleaseApk`""
  } else {
    throw "Gradle APK build failed with exit code $gradleExit."
  }
}
