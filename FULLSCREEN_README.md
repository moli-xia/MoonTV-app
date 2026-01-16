# 月光TV - 全屏播放功能说明

## 功能概述

本项目已成功配置为支持全屏播放和横屏最大化播放功能。当用户点击全屏按钮时，应用将自动切换到横屏全屏模式，提供最佳的观看体验。

## 主要特性

### 🎯 全屏播放
- 点击全屏按钮进入横屏全屏模式
- 自动锁定屏幕方向为横屏
- 隐藏状态栏和导航栏
- 支持触摸手势控制

### 📱 响应式设计
- 自动适应不同屏幕尺寸
- 支持横屏和竖屏切换
- 优化的移动端体验

### 🔧 技术实现
- 基于Capacitor框架
- 原生Android功能支持
- 屏幕方向控制
- 状态栏管理

## 使用方法

### 1. 集成全屏按钮

```tsx
import FullscreenButton from '../components/FullscreenButton';

// 在您的组件中使用
<FullscreenButton
  size={32}
  color="white"
  onFullscreenChange={(isFullscreen) => {
    console.log('全屏状态:', isFullscreen);
  }}
/>
```

### 2. 全屏控制API

```tsx
import { 
  toggleFullscreen, 
  enterFullscreen, 
  exitFullscreen,
  isFullscreen 
} from '../utils/fullscreen';

// 切换全屏
await toggleFullscreen();

// 进入全屏
await enterFullscreen();

// 退出全屏
await exitFullscreen();

// 检查状态
const fullscreenStatus = isFullscreen();
```

## 构建APK

### 自动构建
```bash
# 运行构建脚本
./scripts/build-apk.sh
```

### 手动构建
```bash
# 1. 安装依赖
pnpm install

# 2. 构建Next.js项目
pnpm build

# 3. 同步到Capacitor
npx cap sync android

# 4. 构建Android项目
cd android
./gradlew assembleDebug  # Debug版本
# 或
./gradlew assembleRelease # Release版本
```

## 配置说明

### Capacitor配置
- 服务器URL: `http://129.154.52.248:3000`
- 应用ID: `com.moontv.app`
- 应用名称: `月光TV`

### Android配置
- 支持横屏和竖屏
- 全屏模式支持
- 网络权限配置
- 状态栏管理

## 文件结构

```
src/
├── components/
│   └── FullscreenButton.tsx    # 全屏按钮组件
├── utils/
│   └── fullscreen.ts           # 全屏控制工具
├── styles/
│   └── fullscreen.css          # 全屏样式
└── pages/
    └── fullscreen-demo.tsx     # 演示页面

android/                          # Android项目目录
├── app/
│   └── src/main/
│       ├── java/
│       │   └── MainActivity.java  # 主Activity
│       └── AndroidManifest.xml    # 应用清单
└── build.gradle                  # 构建配置

scripts/
└── build-apk.sh                 # 构建脚本
```

## 注意事项

### 1. 权限要求
- 网络访问权限
- 屏幕方向控制权限
- 状态栏管理权限

### 2. 兼容性
- Android 5.0+ (API 21+)
- 支持横屏和竖屏设备
- 响应式布局适配

### 3. 性能优化
- 全屏模式下的内存管理
- 屏幕方向切换优化
- 触摸事件处理

## 故障排除

### 常见问题

1. **全屏按钮不响应**
   - 检查Capacitor插件是否正确安装
   - 确认Android权限配置

2. **横屏模式不生效**
   - 检查屏幕方向锁定设置
   - 确认设备支持横屏模式

3. **APK构建失败**
   - 检查Java和Android SDK版本
   - 确认Gradle配置正确

### 调试方法

```bash
# 查看Capacitor日志
npx cap run android --livereload

# 检查Android构建日志
cd android && ./gradlew assembleDebug --info
```

## 更新日志

- **v1.0.0**: 初始版本，支持基本全屏功能
- 全屏按钮组件
- 屏幕方向控制
- 横屏播放支持
- 响应式设计

## 技术支持

如有问题，请检查：
1. 依赖版本兼容性
2. Android SDK配置
3. 设备权限设置
4. 网络连接状态

---

**月光TV** - 享受全屏观看体验 🎬
