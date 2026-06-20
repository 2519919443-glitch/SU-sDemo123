// 给 data.js 添加 AppData 辅助方法
const fs = require('fs');
const path = require('path');

const dataPath = 'C:/Users/BeEverYoung/WorkBuddy/2026-06-19-14-08-25/miniapp/src/data.js';
let code = fs.readFileSync(dataPath, 'utf8');

// 辅助方法代码
const helpers = `
// ============ AppData 辅助方法 ============
// 获取某年级可选的学科列表
window.AppData.getSubjectsByGrade = function(grade) {
  var subs = {};
  (window.AppData.quizBanks || []).forEach(function(q) {
    if (q.grade === grade) subs[q.subject] = true;
  });
  (window.AppData.knowledgePoints || []).forEach(function(kp) {
    if (kp.grade === grade) subs[kp.subject] = true;
  });
  var result = Object.keys(subs);
  // 按固定顺序排序
  var order = ['语文','数学','英语','物理','化学','生物','历史','地理','政治','道德与法治'];
  result.sort(function(a, b) { return order.indexOf(a) - order.indexOf(b); });
  return result;
};

// 获取某年级某学科的章节列表
window.AppData.getChaptersBySubject = function(grade, subject) {
  var chs = {};
  (window.AppData.quizBanks || []).forEach(function(q) {
    if (q.grade === grade && q.subject === subject) chs[q.chapter] = true;
  });
  (window.AppData.knowledgePoints || []).forEach(function(kp) {
    if (kp.grade === grade && kp.subject === subject) chs[kp.chapter] = true;
  });
  return Object.keys(chs);
};

// 获取某章节的知识点
window.AppData.getKnowledgeByChapter = function(grade, subject, chapter) {
  return (window.AppData.knowledgePoints || []).filter(function(kp) {
    return kp.grade === grade && kp.subject === subject && kp.chapter === chapter;
  });
};
`;

// 追加到 data.js 末尾
fs.writeFileSync(dataPath, code.trimEnd() + '\n' + helpers);
console.log('✅ 辅助方法已添加到 data.js');
