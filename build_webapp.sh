#!/usr/bin/env bash
set -e

echo ">>> 1. 开始编译 Rust WASM 模块..."
cd webapp
wasm-pack build --target bundler --release
cd ..

echo ">>> 2. 开始构建前端生产资源 (Webpack)..."
cd webapp/app
npm install
npm run build
cd ../..

echo ">>> [成功] 构建完成！静态页面已生成在 webapp/app/dist/ 目录中。"
