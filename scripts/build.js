const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('>>> [1/4] 配置 Rust wasm 目标环境...');
try {
  execSync('rustup target add wasm32-unknown-unknown', { stdio: 'inherit' });
} catch (e) {
  console.log('提示: rustup target add 略过 (如已存在或非 rustup 环境)');
}

console.log('>>> [2/4] 编译 Rust WebAssembly 模块 (wasm-pack)...');
const rootDir = path.resolve(__dirname, '..');
const webappDir = path.resolve(rootDir, 'webapp');

try {
  execSync('npx wasm-pack build --target bundler --release', {
    cwd: webappDir,
    stdio: 'inherit',
    env: { ...process.env, PATH: `${process.env.HOME || ''}/.cargo/bin:${process.env.PATH}` }
  });
} catch (err) {
  console.log('尝试通过 curl 安装 wasm-pack...');
  try {
    execSync('curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh', { stdio: 'inherit' });
    execSync('wasm-pack build --target bundler --release', {
      cwd: webappDir,
      stdio: 'inherit',
      env: { ...process.env, PATH: `${process.env.HOME || ''}/.cargo/bin:${process.env.PATH}` }
    });
  } catch (e) {
    console.error('WASM 构建失败:', e);
    process.exit(1);
  }
}

console.log('>>> [3/4] 安装前端依赖并打包前端产物 (Webpack)...');
const appDir = path.resolve(webappDir, 'app');
execSync('npm install', { cwd: appDir, stdio: 'inherit' });
execSync('npm run build', { cwd: appDir, stdio: 'inherit' });

console.log('>>> [4/4] 同步构建产物至根目录 dist/ ...');
const srcDist = path.resolve(appDir, 'dist');
const targetDist = path.resolve(rootDir, 'dist');

if (fs.existsSync(targetDist)) {
  fs.rmSync(targetDist, { recursive: true, force: true });
}
fs.cpSync(srcDist, targetDist, { recursive: true });

console.log('>>> 🎉 [成功] 全部构建完成！产物已输出至根目录 dist/ 与 webapp/app/dist/');
