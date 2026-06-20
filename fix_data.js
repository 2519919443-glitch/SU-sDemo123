const fs = require('fs');
const f = 'C:/Users/BeEverYoung/WorkBuddy/2026-06-19-14-08-25/miniapp/src/data.js';
let c = fs.readFileSync(f, 'utf8');

// 找到所有 appreciation: "..." 模式，将其中的值用反引号包裹
// 匹配 appreciation: "任意内容" （跨行）
const result = c.replace(/appreciation:\s*"([^"]*)"/g, (match, p1) => {
  return 'appreciation: `' + p1 + '`';
});

fs.writeFileSync(f, result, 'utf8');
console.log('Fixed appreciation fields');

// 验证语法
try {
  new Function(result);
  console.log('✅ JS syntax OK');
} catch(e) {
  console.log('❌ Still has syntax error:', e.message);
}
