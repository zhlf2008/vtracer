# VTracer (中文版) - 高性能位图转矢量 SVG 在线工具

> 基于 Rust + WebAssembly 构建的开源高性能光栅转矢量工具（位图转 SVG）。支持全彩图像、分层聚类、样条曲线拟合及一键导出/复制代码。

![VTracer Banner](docs/images/visioncortex-banner.png)

---

## ✨ 核心特性

- 🚀 **毫秒级极速转换**：核心算法完全基于 Rust 编写，通过 WebAssembly 运行在浏览器本地，数据 100% 不离机，无需上传服务器。
- 🎨 **全彩与图层支持**：支持高保真真彩色提取、智能颜色分层（堆叠/无缝拼接模式），不同于传统工具只支持黑白图。
- 〰️ **平滑样条拟合**：支持贝塞尔样条（Spline）、直线多边形（Polygon）和像素阶梯（Pixel）三种拟合模式，并可精简控制节点。
- ⚡ **快捷场景预设**：一键切换【彩色插画】、【黑白线稿/书法印章】、【像素艺术】、【扁平海报】、【细腻照片】等。
- 📋 **实用交互**：支持直接拖拽、文件上传、**剪贴板 Ctrl+V 粘贴**、一键复制 SVG 源码及一键下载 `.svg`。

---

## 🌐 Cloudflare Pages 部署指引

你可以通过以下两种方式将本项目轻松部署到 **Cloudflare Pages**：

### 方式 1：Cloudflare Pages 控制台直接连接 GitHub 仓库（最简单）

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 进入 **Workers 与 Pages** > **创建应用程序** > 选择 **Pages** 选项卡。
3. 点击 **连接到 Git**（Connect to Git），授权并选择本仓库（`zhlf2008/vtracer`）。
4. 在构建配置（Build settings）中填入：
   - **框架预设 (Framework preset)**: `None`
   - **构建命令 (Build command)**: 
     ```bash
     curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh && cd webapp && wasm-pack build --target bundler --release && cd app && npm install && npm run build
     ```
   - **构建输出目录 (Build output directory)**: `webapp/app/dist`
5. 点击 **保存并部署** 即可！以后每次向仓库 `git push` 代码，Cloudflare Pages 都会自动构建并上线最新版本。

---

### 方式 2：使用 GitHub Actions 自动构建与部署

本仓库已内置 GitHub Actions 工作流（`.github/workflows/deploy-pages.yml`）。

1. 在 GitHub 仓库进入 **Settings** > **Secrets and variables** > **Actions**。
2. 添加以下两个 Repository secrets：
   - `CLOUDFLARE_API_TOKEN`：你的 Cloudflare API 令牌（需具备 Cloudflare Pages 部署权限）。
   - `CLOUDFLARE_ACCOUNT_ID`：你的 Cloudflare 账户 ID。
3. 推送代码到 `master` / `main` 分支，GitHub Actions 会自动编译 Rust WASM、打包前端并部署到你的 Cloudflare Pages 项目。

---

## 💻 本地运行与构建

### 环境要求
- [Rust & Cargo](https://www.rust-lang.org/) (附带 `wasm32-unknown-unknown` target)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Node.js](https://nodejs.org/) (v18+)

### 一键构建
```bash
# Windows PowerShell
./build_webapp.ps1

# Linux / macOS
./build_webapp.sh
```

### 开发模式运行
```bash
# 1. 编译 WASM
cd webapp
npx wasm-pack build --target bundler

# 2. 启动前端热重载服务器
cd app
npm install
npm run start
# 浏览器访问 http://localhost:8080
```

---

## 📜 开源协议

本项目继承上游项目的 [MIT License](LICENSE) 与 [Apache 2.0 License](LICENSE-APACHE)。
原作者：Chris Tsang / Visioncortex
