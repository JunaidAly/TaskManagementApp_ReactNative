# 📱 Android Emulator Setup Guide for VS Code

This guide will help you set up and run your React Native app on an Android emulator directly from VS Code.

## 🔧 Prerequisites Installation

### Step 1: Install Android Studio

1. **Download Android Studio**
   - Go to: https://developer.android.com/studio
   - Download the latest version for Windows
   - File size: ~1 GB

2. **Install Android Studio**
   - Run the installer
   - Choose "Standard" installation
   - This will install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)
   - Installation takes ~10 minutes

3. **Complete Setup Wizard**
   - Launch Android Studio
   - Click "Next" through the setup wizard
   - Let it download the required SDK components
   - This may take 15-30 minutes depending on your internet speed

### Step 2: Set Up Environment Variables

**Option A: Automatic Setup (Recommended)**

Run this in PowerShell as Administrator:
```powershell
# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')

# Add platform-tools to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\tools\bin"
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')

Write-Host "✓ Environment variables set! Please restart VS Code and PowerShell." -ForegroundColor Green
```

**Option B: Manual Setup**

1. Press `Windows + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab → "Environment Variables"
3. Under "User variables", click "New":
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
4. Edit "Path" variable, add these entries:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`
5. Click OK on all dialogs
6. **Restart VS Code and PowerShell**

### Step 3: Create an Android Virtual Device (AVD)

1. **Open Android Studio**
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create Virtual Device"
4. **Select Hardware**:
   - Recommended: "Pixel 5" or "Pixel 6"
   - Click "Next"
5. **Select System Image**:
   - Recommended: "Tiramisu" (Android 13) or latest
   - If not downloaded, click "Download" next to it
   - Click "Next"
6. **Configure AVD**:
   - Name: Keep default or change (e.g., "Pixel_5_API_33")
   - Graphics: "Hardware - GLES 2.0" (faster)
   - Click "Finish"

## 🚀 Running Your App on Emulator

### Method 1: Using VS Code Commands (Easiest)

1. **Open VS Code** in your project folder
2. Press `Ctrl + Shift + P` to open Command Palette
3. Type "React Native" and select:
   - "React Native: Run Android on Emulator"
   - Or "React Native: Run Android on Device"

### Method 2: Using Terminal

1. **Start the Emulator First**:
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start an emulator (replace with your AVD name)
   emulator -avd Pixel_5_API_33
   ```

2. **In a New Terminal**, navigate to frontend and run:
   ```bash
   cd frontend
   npm run android
   ```

### Method 3: Using the Android iOS Emulator Extension

After installing the "Android iOS Emulator" extension:

1. Press `Ctrl + Shift + P`
2. Type "Emulate" and select "Emulate: Start Android"
3. Select your emulator from the list
4. Once started, run:
   ```bash
   cd frontend
   npm run android
   ```

## 🔍 Verify Installation

Run these commands in PowerShell (after restarting):

```powershell
# Check Android SDK
echo $env:ANDROID_HOME

# Check adb (Android Debug Bridge)
adb --version

# List connected devices/emulators
adb devices

# List available emulators
emulator -list-avds
```

Expected output:
```
✓ ANDROID_HOME: C:\Users\YourName\AppData\Local\Android\Sdk
✓ adb version 1.0.41
✓ List of devices attached
  emulator-5554   device
```

## ⚡ Quick Start Commands

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Expo and Android
cd frontend
npm run android
```

The `npm run android` command will:
1. Start Expo Dev Server
2. Launch Android emulator (if not running)
3. Build and install the app
4. Open the app on the emulator

## 🎯 Using React Native Debugger in VS Code

### 1. Install React Native Tools Extension
Already installed! ✓

### 2. Create Debug Configuration

Create `.vscode/launch.json` in your project root:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Android: Debug",
      "cwd": "${workspaceFolder}/frontend",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    },
    {
      "name": "Android: Attach",
      "cwd": "${workspaceFolder}/frontend",
      "type": "reactnative",
      "request": "attach",
      "platform": "android"
    }
  ]
}
```

### 3. Start Debugging

1. Press `F5` or click Run → Start Debugging
2. Select "Android: Debug" configuration
3. Emulator will launch and app will install
4. Set breakpoints in your code
5. Debug like a pro! 🐛

## 🛠️ Troubleshooting

### Issue: "adb: command not found"
**Solution**: 
- Restart VS Code and PowerShell after setting environment variables
- Verify `$env:ANDROID_HOME` is set correctly

### Issue: Emulator is slow
**Solutions**:
- Enable Hardware Acceleration:
  - Open Android Studio → AVD Manager
  - Edit your emulator → Show Advanced Settings
  - Set Graphics to "Hardware - GLES 2.0"
- Increase RAM allocation (4GB recommended)
- Close other applications

### Issue: "Could not connect to development server"
**Solutions**:
```bash
# 1. Reverse the port
adb reverse tcp:8081 tcp:8081

# 2. Or use your computer's IP in frontend/.env
API_URL=http://YOUR_COMPUTER_IP:3000/api
```

### Issue: App doesn't refresh when code changes
**Solutions**:
- Enable Fast Refresh: Shake the device → "Enable Fast Refresh"
- Or reload: Press `R` twice in the terminal running Expo

### Issue: Emulator won't start
**Solutions**:
```bash
# Kill any running emulator processes
taskkill /F /IM qemu-system-x86_64.exe

# Start fresh
emulator -avd Pixel_5_API_33 -no-snapshot-load
```

## 📋 Useful Commands

```bash
# List running emulators
adb devices

# Install APK manually
adb install app.apk

# View device logs
adb logcat

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# Record screen
adb shell screenrecord /sdcard/demo.mp4

# Clear app data
adb shell pm clear com.taskmaster

# Restart adb server
adb kill-server
adb start-server
```

## 🎨 VS Code Shortcuts for React Native Development

- `Ctrl + Shift + P` → Command Palette
- `F5` → Start Debugging
- `Shift + F5` → Stop Debugging
- `Ctrl + Shift + D` → Debug Panel
- `Ctrl + '` → Toggle Terminal

## 📚 Additional Resources

- [React Native Debugging Guide](https://reactnative.dev/docs/debugging)
- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [Expo Development Builds](https://docs.expo.dev/development/introduction/)

## ✅ Checklist

Before running the app, ensure:

- [ ] Android Studio installed
- [ ] At least one AVD created
- [ ] Environment variables set (ANDROID_HOME)
- [ ] VS Code restarted
- [ ] Backend running (`cd backend && npm run dev`)
- [ ] Dependencies installed in frontend
- [ ] React Native Tools extension installed

---

**Ready to develop!** 🎉

Run `npm run android` from the frontend folder and watch your app come to life on the emulator!
