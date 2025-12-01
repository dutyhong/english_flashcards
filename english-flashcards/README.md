# English Flashcards App

这是一个基于 React Native (Expo) 开发的英语学习应用，具备以下功能：
1. **拍照识别**：识别图片中的英文单词。
2. **智能解析**：自动生成单词的中文含义、音标、例句和解析。
3. **复习列表**：管理生词本，支持发音朗读。

## 快速开始

### 1. 环境准备
确保你的电脑已安装 Node.js (推荐 v18+)。

### 2. 安装依赖
在终端中运行以下命令：

```bash
cd english-flashcards
npm install
```

### 3. 启动应用
运行以下命令启动开发服务器：

```bash
npx expo start
```

### 4. 在手机上运行
1. 在 App Store (iOS) 或 Google Play (Android) 下载 **"Expo Go"** 应用。
2. 确保手机和电脑连接在**同一个 Wi-Fi** 网络下。
3. 使用手机相机 (iOS) 或 Expo Go 应用 (Android) 扫描终端中显示的 QR 码。

## 功能说明

- **演示模式 (Demo Mode)**: 默认开启。无需 API Key 即可体验完整流程，但识别结果和单词解析使用的是模拟数据。
- **真实模式**: 在 "设置" 页面输入你的 OpenAI API Key (需要 GPT-4o 权限)，关闭演示模式开关，即可使用真实的 AI 识别与解析功能。

## 技术栈
- Expo / React Native
- TypeScript
- Zustand (状态管理)
- OpenAI API (后端逻辑)
- Lucide Icons (图标)

