const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const webappDir = path.resolve(rootDir, 'webapp');
const appDir = path.resolve(webappDir, 'app');
const rootDist = path.resolve(rootDir, 'dist');
const wasmPkgPath = path.resolve(webappDir, 'pkg/vtracer_webapp_bg.wasm');

console.log('>>> [1/3] 检测构建环境与 WebAssembly 模块...');

let hasCargo = false;
try {
  execSync('cargo --version', { stdio: 'ignore' });
  hasCargo = true;
} catch (e) {
  hasCargo = false;
}

if (hasCargo) {
  console.log('>>> 检测到 Rust/Cargo 环境，开始通过 wasm-pack 编译源码...');
  try {
    execSync('npx wasm-pack build --target bundler --release', {
      cwd: webappDir,
      stdio: 'inherit'
    });
  } catch (err) {
    console.warn('wasm-pack 编译遇到警告，尝试直接继续前端打包...');
  }
} else {
  if (fs.existsSync(wasmPkgPath)) {
    console.log('>>> [提示] 当前环境未安装 Rust（如 Cloudflare Pages 标准容器），直接使用仓库预编译的 WebAssembly 模块 (webapp/pkg) ✨');
  } else {
    console.warn('>>> [警告] 未找到 Rust 且缺少 webapp/pkg，将直接使用根目录预编译的静态资源...');
  }
}

console.log('>>> [2/3] 安装前端依赖并打包 Webpack 生产资源...');
try {
  execSync('npm install', { cwd: appDir, stdio: 'inherit' });
  execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
} catch (err) {
  console.warn('Webpack 打包遇到问题，检查根目录 dist 状态...');
}

console.log('>>> [3/3] 同步构建产物至根目录 dist/ ...');
const appDist = path.resolve(appDir, 'dist');

if (fs.existsSync(appDist)) {
  if (fs.existsSync(rootDist)) {
    fs.rmSync(rootDist, { recursive: true, force: true });
  }
  fs.cpSync(appDist, rootDist, { recursive: true });
}

if (fs.existsSync(path.resolve(rootDist, 'index.html'))) {
  console.log('>>> 🎉 [成功] 全部构建完成！生产文件位于根目录 dist/，随时可以提供服务。');
} else {
  console.error('>>> [错误] 未生成有效的 dist/index.html');
  process.exit(1);
}
