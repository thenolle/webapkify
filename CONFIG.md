# WebAPKify Configuration

`webapkify.config.ts` is the single source of truth for how WebAPKify turns a built web app into an Android project and APK. Only `appName` and `appId` are required; everything else is optional and receives a runtime default when the config is loaded.

## Quick start

Either use `webapkify init` to generate a config interactively, or create `webapkify.config.ts` in your project root and export a typed config object. WebAPKify resolves the file from `process.cwd()`, imports its default export, then applies defaults before generating the Android project.

```ts
import type { WebAPKifyConfig } from 'webapkify'

export default {
  appName: 'My App',
  appId: 'com.example.myapp',
  webDir: './dist',
} satisfies WebAPKifyConfig
```

A minimal config is usually the best starting point because WebAPKify already fills in versioning, Android SDK levels, WebView defaults, permissions defaults, and build defaults automatically.

## How config loading works

When you run `webapkify build`, WebAPKify looks for `webapkify.config.ts` in the current working directory. If the file does not exist or cannot be imported, the command exits with an error.

After import, WebAPKify normalizes the config with `applyDefaults()`. This means the generated Android project always receives a complete config object, even if your file only contains a few fields.

## Mental model

Think of the config in 4 layers:

- **Identity**: app name, package ID, versions, artifact name.
- **Input**: where your built web app lives.
- **Android wrapper**: manifest, theme, icons, WebView, permissions, signing.
- **Build system**: Gradle, Kotlin, JVM target, minification, extra properties.

If a field changes Android behavior directly, it usually ends up in one of these generated files: `AndroidManifest.xml`, `MainActivity.kt`, `app/build.gradle.kts`, `build.gradle.kts`, resource XML files, or `network_security_config.xml`.

## Required fields

### `appName`

Human-readable app name. This is written into `strings.xml` as `app_name` and is also used as the Gradle root project name.

Example:

```ts
appName: 'My App'
```

### `appId`

Android application ID, also used as the Kotlin package/namespace and manifest package identity. WebAPKify converts dots in `appId` into the native Kotlin directory structure when generating `MainActivity.kt`.

Example:

```ts
appId: 'com.example.myapp'
```

## Common fields

These are the fields most projects actually need to touch first.

### `webDir`

Path to the built web app folder that WebAPKify copies into `app/src/main/assets/www`. The path is resolved from the current working directory, not from the config file location.

Default: `'./dist'`.

Examples:

```ts
webDir: './dist'
webDir: './build'
webDir: './apps/web/dist'
```

If this directory does not exist at build time, WebAPKify exits with an error and tells you to build your web app first.

### `icon`

Path to the main launcher icon source. This is optional in the type, but in practice it is one of the first fields most real apps should set because it controls the app launcher branding.

Example:

```ts
icon: './icon.png'
```

### `artifact`

Base file name for generated APKs. If omitted, WebAPKify slugifies `appName` by lowercasing it, replacing non-alphanumeric runs with `-`, and trimming leading/trailing dashes.

Default: `slugify(appName)`.

Examples:

```ts
artifact: 'my-app'
```

Output examples:

- `my-app-debug.apk`
- `my-app-release.apk`

### `versionCode`

Internal Android version number used by the package manager and Play-style upgrade flows.

Default: `1`.

### `versionName`

Human-readable version string written into the Android build config.

Default: `'1.0.0'`.

## Runtime defaults

The following defaults are applied automatically when your config is loaded.

### Core app defaults

| Field | Default |
|---|---|
| `versionCode` | `1`  |
| `versionName` | `'1.0.0'`  |
| `artifact` | `slugify(appName)`  |
| `webDir` | `'./dist'`  |
| `minSdk` | `26`  |
| `compileSdk` | `35`  |
| `targetSdk` | `35`  |
| `buildToolsVersion` | `'35.0.0'`  |
| `adaptiveIconBackground` | `'#FFFFFF'`  |
| `orientation` | `'unspecified'`  |
| `statusBar` | `'default'`  |
| `themeColor` | `'#FFFFFF'`  |
| `backgroundColor` | `'#FFFFFF'`  |
| `allowBackup` | `true`  |
| `hardwareAccelerated` | `true`  |
| `keepScreenOn` | `false`  |
| `supportsRtl` | `false`  |
| `restoreAnyVersion` | `true`  |
| `clearTextDomains` | `[]`  |
| `allowAllClearText` | `false`  |

### WebView defaults

| Field | Default |
|---|---|
| `javaScriptEnabled` | `true`  |
| `javaScriptCanOpenWindowsAutomatically` | `false`  |
| `domStorageEnabled` | `true`  |
| `databaseEnabled` | `false`  |
| `geolocationEnabled` | `false`  |
| `allowMixedContent` | `false`  |
| `builtInZoomControls` | `true`  |
| `displayZoomControls` | `false`  |
| `userAgentString` | `undefined`  |
| `allowFileAccessFromFileURLs` | `false`  |
| `allowUniversalAccessFromFileURLs` | `false`  |
| `textZoom` | `100`  |
| `loadsImagesAutomatically` | `true`  |
| `blockNetworkImage` | `false`  |
| `blockNetworkLoads` | `false`  |
| `cacheMode` | `'DEFAULT'`  |
| `loadWithOverviewMode` | `false`  |
| `useWideViewPort` | `true`  |
| `mediaPlaybackRequiresUserGesture` | `true`  |
| `safeBrowsingEnabled` | `true`  |
| `forceDark` | `'AUTO'`  |
| `algorithmicDarkeningAllowed` | `false`  |
| `acceptCookies` | `true`  |
| `acceptThirdPartyCookies` | `false`  |

### Permission defaults

By default, only basic networking permissions are enabled. `internet` and `networkState` default to `true`; every other permission defaults to `false`.

## Generated files mapping

This is the quickest way to understand what each config section actually affects.

| Config area | Generated output |
|---|---|
| `appName` | `strings.xml`, Gradle root project name  |
| `appId` | Kotlin package path, namespace, `applicationId`, manifest identity  |
| `webDir` | copied into `app/src/main/assets/www`  |
| `themeColor`, `backgroundColor` | `colors.xml`, theme values  |
| `statusBar` | `styles.xml` theme parent and runtime `MainActivity.kt` window/status-bar code  |
| `webview.*` | `MainActivity.kt` WebView settings and cookie manager setup  |
| `permissions.*` | `<uses-permission>` entries in `AndroidManifest.xml`  |
| `clearTextDomains`, `allowAllClearText` | `res/xml/network_security_config.xml` plus manifest `android:networkSecurityConfig`  |
| `signing.*` | `app/build.gradle.kts` signing config for release builds  |
| `build.*` | `app/build.gradle.kts`, root `build.gradle.kts`, `gradle.properties`  |
| `artifact` | output APK file names  |

## Field reference

### Identity

#### `appName`
Human-readable app label. Written into `res/values/strings.xml` and used as the Gradle root project name.

#### `appId`
Unique Android app ID, Kotlin package name, and Gradle namespace/application ID. It also determines where `MainActivity.kt` is generated.

#### `versionCode`
Integer version used by Android for upgrades. Goes into `defaultConfig.versionCode` in `app/build.gradle.kts`.

#### `versionName`
Display version string written into `defaultConfig.versionName`.

#### `artifact`
Controls the APK output file names for all build variants in `applicationVariants.all`.

### Android SDK and build tooling

#### `minSdk`
Minimum Android SDK level allowed to install the app. Written into Gradle `defaultConfig.minSdk`.

#### `compileSdk`
SDK level used to compile the app. Written into `android.compileSdk`.

#### `targetSdk`
Target SDK level declared by the app. Written into `defaultConfig.targetSdk`.

#### `buildToolsVersion`
Android Build Tools version used in `app/build.gradle.kts`.

### Icons

#### `icon`
Primary launcher icon source path.

#### `adaptiveIconForeground`
Foreground layer for adaptive icons.

#### `monochromeIcon`
Monochrome icon source for newer Android launcher/themed icon support.

#### `adaptiveIconBackground`
Solid background color used with the adaptive foreground asset. Default is `'#FFFFFF'`.

### App behavior

#### `orientation`
Written directly to `android:screenOrientation` on `MainActivity` in the manifest.

Example values:

```ts
orientation: 'unspecified'
orientation: 'portrait'
orientation: 'landscape'
```

#### `statusBar`
Controls both theme selection and runtime window/status bar behavior.

Supported values:

- `'default'`: no special runtime status-bar override.
- `'light'`: applies light status-bar system UI visibility in `MainActivity.kt`.
- `'dark'`: switches the generated theme parent to `Theme.AppCompat.NoActionBar` instead of `Theme.AppCompat.Light.NoActionBar`.
- `'transparent'`: enables fullscreen/edge-like layout flags with `FLAG_LAYOUT_NO_LIMITS`.

#### `themeColor`
Written to `colorPrimary` and `colorPrimaryDark` in `colors.xml`. If omitted, both become `'#FFFFFF'`.

#### `backgroundColor`
Written to `windowBackground` in `colors.xml`.

#### `allowBackup`
Written to `android:allowBackup` in the manifest.

#### `hardwareAccelerated`
Written to `android:hardwareAccelerated` in the manifest. The generated `MainActivity` uses a WebView-centric setup, so leaving this enabled is usually the correct choice.

#### `keepScreenOn`
If enabled, `MainActivity.kt` adds `FLAG_KEEP_SCREEN_ON` at runtime.

#### `supportsRtl`
Written to `android:supportsRtl` in the manifest.

#### `restoreAnyVersion`
This value is defaulted in config loading, but based on the provided generator code it is not currently written into any generated file. Treat it as reserved unless another part of the codebase uses it later.

### Cleartext traffic

#### `clearTextDomains`
Creates `res/xml/network_security_config.xml` with one `<domain-config cleartextTrafficPermitted="true">` block per listed domain, including subdomains. If any domains are present, the manifest receives `android:networkSecurityConfig="@xml/network_security_config"`.

Example:

```ts
clearTextDomains: ['localhost', '10.0.2.2']
```

This is the targeted way to allow local dev servers or specific HTTP-only endpoints.

#### `allowAllClearText`
Instead of per-domain entries, this generates a `<base-config cleartextTrafficPermitted="true" />` network security config and attaches it in the manifest.

Use this only when you truly need all HTTP traffic allowed. For best UX and safer defaults, prefer `clearTextDomains` whenever possible.

### WebView

Every `webview` field is applied in the generated `MainActivity.kt` through `webView.settings`, cookie manager setup, or feature-gated AndroidX WebKit calls.

#### Core behavior

- `javaScriptEnabled`: enables JavaScript.
- `domStorageEnabled`: enables DOM storage such as `localStorage`.
- `databaseEnabled`: enables legacy database APIs.
- `geolocationEnabled`: enables WebView geolocation support and adds a permissive `WebChromeClient` geolocation callback in the generated activity.

Important: enabling geolocation in WebView does not by itself add Android location permissions. If your web app needs location, also enable `permissions.coarseLocation` and/or `permissions.fineLocation`.

#### Security-sensitive toggles

- `allowMixedContent`: switches WebView `mixedContentMode` between `MIXED_CONTENT_ALWAYS_ALLOW` and `MIXED_CONTENT_NEVER_ALLOW`.
- `allowFileAccessFromFileURLs`: written directly to WebSettings.
- `allowUniversalAccessFromFileURLs`: written directly to WebSettings.
- `acceptThirdPartyCookies`: applied through `CookieManager.setAcceptThirdPartyCookies()`.

These should stay at their defaults unless you know the exact compatibility problem you are solving.

#### Layout/media/caching

- `textZoom`: sets `settings.textZoom`.
- `loadsImagesAutomatically`: controls automatic image loading.
- `blockNetworkImage`: blocks remote image loading.
- `blockNetworkLoads`: blocks all network loads.
- `loadWithOverviewMode`: scales content to fit screen width when useful.
- `useWideViewPort`: enables responsive viewport behavior.
- `mediaPlaybackRequiresUserGesture`: controls autoplay-style media behavior.
- `safeBrowsingEnabled`: written directly to WebSettings.

#### `cacheMode`

Mapped to Android constants in `MainActivity.kt`:

| Config value | Android constant |
|---|---|
| `'DEFAULT'` | `WebSettings.LOAD_DEFAULT`  |
| `'CACHE_ELSE_NETWORK'` | `WebSettings.LOAD_CACHE_ELSE_NETWORK`  |
| `'NO_CACHE'` | `WebSettings.LOAD_NO_CACHE`  |
| `'CACHE_ONLY'` | `WebSettings.LOAD_CACHE_ONLY`  |

#### `userAgentString`

If set, WebAPKify writes `settings.userAgentString = '...'`. If omitted, the generated activity keeps the system default user agent.

#### `forceDark` and `algorithmicDarkeningAllowed`

`algorithmicDarkeningAllowed` is applied only if `WebViewFeature.ALGORITHMIC_DARKENING` is supported by the device WebView implementation. `forceDark` exists in the config/defaults, but based on the provided generator code, it is not currently written into `MainActivity.kt` and therefore appears reserved or unfinished in the current implementation.

#### Cookies and navigation

- `acceptCookies`: applied through `CookieManager.setAcceptCookie()`.
- `acceptThirdPartyCookies`: applied through `CookieManager.setAcceptThirdPartyCookies()`.
- the generated app restores WebView state on recreation and falls back to `file:///android_asset/www/index.html` on first launch.
- back button behavior is overridden so the WebView navigates back before the Activity closes.

### Permissions

`permissions` only affects manifest permission declarations in the provided code. It does not automatically implement Android runtime permission request flows for dangerous permissions.

That means if you enable something like camera, microphone, notifications, or location, your app code or web/native integration still needs to handle the actual permission request UX if Android requires it.

Supported permission mappings:

| Config field | Manifest permission |
|---|---|
| `internet` | `android.permission.INTERNET`  |
| `networkState` | `android.permission.ACCESS_NETWORK_STATE`  |
| `wifiState` | `android.permission.ACCESS_WIFI_STATE`  |
| `coarseLocation` | `android.permission.ACCESS_COARSE_LOCATION`  |
| `fineLocation` | `android.permission.ACCESS_FINE_LOCATION`  |
| `camera` | `android.permission.CAMERA`  |
| `recordAudio` | `android.permission.RECORD_AUDIO`  |
| `readExternalStorage` | `android.permission.READ_EXTERNAL_STORAGE`  |
| `writeExternalStorage` | `android.permission.WRITE_EXTERNAL_STORAGE`  |
| `readMediaImages` | `android.permission.READ_MEDIA_IMAGES`  |
| `readMediaVideo` | `android.permission.READ_MEDIA_VIDEO`  |
| `readMediaAudio` | `android.permission.READ_MEDIA_AUDIO`  |
| `vibrate` | `android.permission.VIBRATE`  |
| `receiveBootCompleted` | `android.permission.RECEIVE_BOOT_COMPLETED`  |
| `postNotifications` | `android.permission.POST_NOTIFICATIONS`  |
| `bluetooth` | `android.permission.BLUETOOTH`, `android.permission.BLUETOOTH_CONNECT`, `android.permission.BLUETOOTH_SCAN`  |
| `nfc` | `android.permission.NFC`  |
| `biometric` | `android.permission.USE_BIOMETRIC`  |
| `fingerprint` | `android.permission.USE_FINGERPRINT`  |
| `flashlight` | `android.permission.FLASHLIGHT`  |
| `wakeLock` | `android.permission.WAKE_LOCK`  |
| `foregroundService` | `android.permission.FOREGROUND_SERVICE`  |
| `scheduleExactAlarm` | `android.permission.SCHEDULE_EXACT_ALARM`  |

### Signing

If `signing` is provided, WebAPKify generates a Gradle `signingConfigs { create("release") { ... } }` block and attaches it to the release build type.

If `signing` is omitted, WebAPKify still creates the release build type, but the generated comment explicitly says no signing config was provided and the result is an unsigned release APK.

Fields:

- `storeFile`
- `storePassword`
- `keyAlias`
- `keyPassword`
- `v1SigningEnabled` default fallback in generator: `true`.
- `v2SigningEnabled` default fallback in generator: `true`.
- `v3SigningEnabled` default fallback in generator: `true`.
- `v4SigningEnabled` default fallback in generator: `false`.

Note the nuance: these v1-v4 defaults are not set in `applyDefaults()`. They are applied later, inside Gradle generation, only when a `signing` block exists.

### Build

#### `minifyEnabled`
Written to the release build type as `isMinifyEnabled`.

Default: `false`.

#### `shrinkResources`
Written to the release build type as `isShrinkResources`.

Default: `false`.

#### `jvmTarget`
Normalized before writing to Gradle. Supported normalized outputs are `21`, `17`, `11`, or `1.8`; invalid or too-new values fall back to `21`.

Normalization behavior:

- missing or invalid -> `21`
- `24` or higher -> `21`
- `21` to `23` -> `21`
- `17` to `20` -> `17`
- `11` to `16` -> `11`
- anything lower -> `1.8`

Default before normalization: `'21'`.

#### `kotlinVersion`
Written into the root `build.gradle.kts` plugin version for `org.jetbrains.kotlin.android`.

Default: `'2.0.21'`.

#### `agpVersion`
Written into the root `build.gradle.kts` plugin version for `com.android.application`.

Default: `'8.7.3'`.

#### `extraProperties`
Written to `gradle.properties` as raw `key=value` lines and also converted into `buildConfigField("String", key, value)` entries inside `defaultConfig`.

Default: `{}`.

This means these values affect both Gradle properties and generated `BuildConfig` constants. Use string-safe values and stable keys.

## Best-practice examples

### 1. Small default setup

```ts
import type { WebAPKifyConfig } from 'webapkify'

export default {
  appName: 'My App',
  appId: 'com.example.myapp',
  webDir: './dist',
} satisfies WebAPKifyConfig
```

This is enough for a normal bundled SPA that builds into `./dist` and does not need custom permissions, custom signing, or HTTP exceptions.

### 2. Local dev API over HTTP

```ts
import type { WebAPKifyConfig } from 'webapkify'

export default {
  appName: 'My App',
  appId: 'com.example.myapp',
  webDir: './dist',
  clearTextDomains: ['10.0.2.2', 'localhost'],
} satisfies WebAPKifyConfig
```

This allows targeted cleartext traffic for local development endpoints without opening HTTP for every host.

### 3. App that needs camera and notifications

```ts
import type { WebAPKifyConfig } from 'webapkify'

export default {
  appName: 'My App',
  appId: 'com.example.myapp',
  webDir: './dist',
  permissions: {
    camera: true,
    postNotifications: true,
  },
} satisfies WebAPKifyConfig
```

This adds the manifest permissions, but you still need runtime permission handling where Android requires it.

### 4. Signed release build

```ts
import type { WebAPKifyConfig } from 'webapkify'

export default {
  appName: 'My App',
  appId: 'com.example.myapp',
  signing: {
    storeFile: './release.jks',
    storePassword: 'storePass',
    keyAlias: 'keyAlias',
    keyPassword: 'keyPass',
  },
} satisfies WebAPKifyConfig
```

This produces a release signing config in Gradle instead of leaving the release APK unsigned.

## Gotchas

- `webDir` must already contain your built web app before `webapkify build` runs.
- WebAPKify always loads `file:///android_asset/www/index.html` on first launch, so your built output must include `index.html` at the root of `webDir`.
- `statusBar: 'dark'` changes the generated theme parent, while `statusBar: 'light'` adds a runtime light-status-bar UI flag; these are not symmetrical settings.
- `build.extraProperties` is injected into both `gradle.properties` and `BuildConfig`, so treat it as a native build input, not just metadata.

## Recommended authoring style

For best DX and UX, keep the config small and only add fields when you have a concrete need. WebAPKify is already designed so the default path works for a normal SPA build, a standard WebView setup, and a debug-first Android wrapper.

A good rule is:

- start with `appName`, `appId`, and `webDir`
- add `icon` when branding matters
- add `clearTextDomains` only for HTTP exceptions
- add `permissions` only when the web app actually uses them
- add `signing` when you move to release distribution
- touch `webview` and `build` only when you need specific native behavior or tooling control.