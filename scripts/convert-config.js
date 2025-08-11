#!/usr/bin/env node
/* eslint-disable */
// AUTO-GENERATED SCRIPT: Converts config.json to TypeScript definition.
// Usage: node scripts/convert-config.js

const fs = require('fs');
const path = require('path');

// Resolve project root (one level up from scripts folder)
const projectRoot = path.resolve(__dirname, '..');

// Paths
const configPath = path.join(projectRoot, 'config.json');
const libDir = path.join(projectRoot, 'src', 'lib');
const oldRuntimePath = path.join(libDir, 'runtime.ts');
const newRuntimePath = path.join(libDir, 'runtime.ts');

// Delete the old runtime.ts file if it exists
if (fs.existsSync(oldRuntimePath)) {
  fs.unlinkSync(oldRuntimePath);
  console.log('旧的 runtime.ts 已删除');
}

// Read and parse config.json
let rawConfig;
try {
  rawConfig = fs.readFileSync(configPath, 'utf8');
} catch (err) {
  console.error(`无法读取 ${configPath}:`, err);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(rawConfig);
} catch (err) {
  console.error('config.json 不是有效的 JSON:', err);
  process.exit(1);
}

// Prepare TypeScript file content
const tsContent =
  `// 该文件由 scripts/convert-config.js 自动生成，请勿手动修改\n` +
  `/* eslint-disable */\n\n` +
  `export const config = ${JSON.stringify(config, null, 2)} as const;\n\n` +
  `export type RuntimeConfig = typeof config;\n\n` +
  `export default config;\n`;

// Ensure lib directory exists
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Write to runtime.ts
try {
  fs.writeFileSync(newRuntimePath, tsContent, 'utf8');
  console.log('已生成 src/lib/runtime.ts');
} catch (err) {
  console.error('写入 runtime.ts 失败:', err);
  process.exit(1);
}
