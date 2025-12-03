# iOS 低成本发布指南 (使用 Expo Go)

如果你没有苹果开发者账号 ($99/年)，这是唯一能让朋友**远程试用**你的 App 且**不需要你一直开着电脑**的方法。

---

## 原理说明
这种方式**不生成独立的 App**（如 .ipa 文件），而是将你的代码发布到 Expo 的云端服务器。用户通过安装 **Expo Go** 这个官方 App 来加载运行你的代码。

*   **优点**：完全免费，即时生效，无需审核。
*   **缺点**：用户必须先安装 Expo Go，且不能上架 App Store。

---

## 操作步骤

### 1. 准备工作
确保你的代码已经保存并提交到本地 Git 仓库：
```bash
git add .
git commit -m "Ready for release"
```

### 2. 发布代码到云端
在你的项目根目录下，运行以下命令：
```bash
eas update --branch preview --message "Initial Release"
```
*   `--branch preview`: 指定发布到预览分支（通常我们用这个来测试）。
*   `--message`: 这次更新的备注（比如“修复了登录Bug”）。

等待命令执行完成，你会看到 Successfully published 的提示。

### 3. 获取分享链接
发布成功后，去 [expo.dev](https://expo.dev) 网站：
1.  登录你的 Expo 账号。
2.  点击你的项目 (english-flashcards)。
3.  在 Dashboard 中，你会看到一个 **Project URL** (通常是 `exp://u.expo.dev/update/...`)。
4.  或者是点击左侧 **Updates**，找到最新的一次 Update，点击进去查看详情。

### 4. 分享给朋友
把上面的 URL 链接发给你的朋友。

---

## 用户(朋友)如何使用

### 第一步：安装载体
让朋友在 App Store 搜索并下载 **"Expo Go"**。

### 第二步：打开应用
有以下几种方式：

1.  **扫码 (最推荐)**：
    *   你去 Expo 网站上把那个 URL 生成一个二维码（或者截个图）。
    *   朋友打开 iPhone **系统自带相机**，扫描二维码。
    *   顶部会弹出提示 "Open in Expo Go"，点击即可。

2.  **Safari 打开**：
    *   把链接 (`exp://...`) 发给朋友。
    *   朋友复制链接，在 Safari 浏览器地址栏粘贴并访问。
    *   网页会自动询问是否打开 Expo Go，确认即可。

3.  **Expo Go 内打开**：
    *   如果朋友登录了同一个 Expo 账号（不推荐），他可以直接在 Projects 里看到。
    *   通常推荐用上面两种方法。

---

## 后续更新
如果你修改了代码，想让朋友用到新功能：
1.  在你自己电脑上：
    ```bash
    git add .
    git commit -m "Add new feature"
    eas update --branch preview --message "Add status filter"
    ```
2.  通知朋友：
    *   让朋友**完全关闭并重启** Expo Go App。
    *   或者在 Expo Go 里重新加载你的项目。
    *   他们就能立刻看到新功能了！

