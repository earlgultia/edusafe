# Building a release APK (Android)

This project includes an Android wrapper that packages the Vite-built web app into an APK. Follow these steps locally to produce a signed `app-release.apk`.

1) Install a Java JDK (recommended: Temurin / Adoptium JDK 17)

  - Windows installer: https://adoptium.net/
  - After install, set `JAVA_HOME` to the JDK install path and add `%JAVA_HOME%\bin` to `PATH`.

2) Build the web app

```powershell
npm run build
```

3) Create a release keystore (if you don't have one)

```powershell
keytool -genkeypair -v -keystore android/release-keystore.jks -alias edusafe_key -keyalg RSA -keysize 2048 -validity 10000
```

4) Create `android/key.properties` (do not commit this file)

Use `android/key.properties.template` as a starting point and fill in the values. Example:

```
storeFile=android/release-keystore.jks
storePassword=your_store_password
keyAlias=edusafe_key
keyPassword=your_key_password
```

5) Run the Gradle release build

```powershell
cd android
.\gradlew.bat assembleRelease
```

Or use the helper script from project root:

```powershell
.\scripts\build-android.ps1
```

6) Find the APK

`android/app/build/outputs/apk/release/app-release.apk`

Troubleshooting
- If the build fails due to Java not found, ensure `JAVA_HOME` is set and `java -version` works.
- If you prefer to sign with Google Play signing, you can upload an unsigned APK/AAB to the Play Console and use Play App Signing.
