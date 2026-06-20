// =============================================
//  页面：教师 - 章节管理
// =============================================
Router.register('teacher-chapter', function(params) {
  var app = document.getElementById('page-teacher-chapter');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-teacher-chapter';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var grade = App.state.teacherGrade || '3';

  app.innerHTML = `
    <div style="padding:16px;max-width:600px;margin:0 auto;">
      <!-- 顶部导航 -->
      <div style="display:flex;align-items:center;margin-bottom:20px;">
        <button onclick="Router.go('teacher')" style="background:none;border:none;font-size:20px;cursor:pointer;margin-right:12px;">←</button>
        <h1 style="font-size:20px;font-weight:700;color:#333;">章节管理</h1>
      </div>

      <!-- 添加题目表单 -->
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">添加新题目</h3>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">学科</label>
          <select id="tc-subject" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;">
            <option value="语文">语文</option>
            <option value="数学">数学</option>
            <option value="英语">英语</option>
            <option value="物理">物理</option>
            <option value="化学">化学</option>
            <option value="生物">生物</option>
            <option value="历史">历史</option>
            <option value="地理">地理</option>
            <option value="政治">政治</option>
          </select>
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">章节</label>
          <input id="tc-chapter" type="text" placeholder="请输入章节名称" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">难度</label>
          <select id="tc-diff" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;">
            <option value="易">易</option>
            <option value="中">中</option>
            <option value="难">难</option>
          </select>
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">题目</label>
          <textarea id="tc-question" placeholder="请输入题目内容" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;min-height:80px;box-sizing:border-box;"></textarea>
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">选项A</label>
          <input id="tc-opt-a" type="text" placeholder="选项A内容" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">选项B</label>
          <input id="tc-opt-b" type="text" placeholder="选项B内容" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">选项C</label>
          <input id="tc-opt-c" type="text" placeholder="选项C内容" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">选项D</label>
          <input id="tc-opt-d" type="text" placeholder="选项D内容" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">正确答案（A/B/C/D）</label>
          <input id="tc-answer" type="text" placeholder="请输入正确答案字母" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <button onclick="addTeacherQuestion()" style="width:100%;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">添加题目</button>
      </div>

      <!-- 当前年级题目列表 -->
      <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">当前年级题目（${grade}年级）</h3>
      <div id="teacher-question-list">
        <p style="text-align:center;color:#999;padding:20px;">加载中...</p>
      </div>
    </div>
  `;

  // 加载当前年级的题目
  loadTeacherQuestions(grade);
});

// 添加题目（教师）
function addTeacherQuestion() {
  var subject = document.getElementById('tc-subject').value;
  var chapter = document.getElementById('tc-chapter').value.trim();
  var diff = document.getElementById('tc-diff').value;
  var question = document.getElementById('tc-question').value.trim();
  var optA = document.getElementById('tc-opt-a').value.trim();
  var optB = document.getElementById('tc-opt-b').value.trim();
  var optC = document.getElementById('tc-opt-c').value.trim();
  var optD = document.getElementById('tc-opt-d').value.trim();
  var answer = document.getElementById('tc-answer').value.trim().toUpperCase();

  if (!subject || !chapter || !question || !optA || !optB || !optC || !optD || !answer) {
    return Utils.toast('请填写所有字段');
  }
  if (!['A','B','C','D'].includes(answer)) {
    return Utils.toast('正确答案必须是 A/B/C/D');
  }

  // 获取当前题库
  var quizBanks = window.AppData.quizBanks || [];
  var newId = 'tq_' + Date.now();  // 教师添加的题目ID前缀 tq_
  quizBanks.push({
    id: newId,
    grade: App.state.teacherGrade || '3',
    subject: subject,
    chapter: chapter,
    difficulty: diff,
    question: question,
    options: [optA, optB, optC, optD],
    answer: answer,
    explanation: '',
    addedByTeacher: true,
    addedAt: new Date().toISOString()
  });

  // 保存到 localStorage（教师添加的题目）
  var teacherQuiz = JSON.parse(localStorage.getItem('xuexi_teacher_quiz') || '[]');
  teacherQuiz.push({
    id: newId,
    grade: App.state.teacherGrade || '3',
    subject: subject,
    chapter: chapter,
    difficulty: diff,
    question: question,
    options: [optA, optB, optC, optD],
    answer: answer,
    explanation: '',
    addedByTeacher: true,
    addedAt: new Date().toISOString()
  });
  localStorage.setItem('xuexi_teacher_quiz', JSON.stringify(teacherQuiz));

  // 更新 AppData（内存中）
  window.AppData.quizBanks = quizBanks;

  Utils.toast('题目添加成功！');
  // 清空表单
  document.getElementById('tc-chapter').value = '';
  document.getElementById('tc-question').value = '';
  document.getElementById('tc-opt-a').value = '';
  document.getElementById('tc-opt-b').value = '';
  document.getElementById('tc-opt-c').value = '';
  document.getElementById('tc-opt-d').value = '';
  document.getElementById('tc-answer').value = '';

  // 重新加载列表
  loadTeacherQuestions(App.state.teacherGrade || '3');
}

// 加载教师管理的题目列表
function loadTeacherQuestions(grade) {
  var listEl = document.getElementById('teacher-question-list');
  var quizBanks = window.AppData.quizBanks || [];
  var questions = quizBanks.filter(function(q) { return q.grade === grade; });

  if (questions.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">本年级暂无题目，请添加</p>';
    return;
  }

  var html = '';
  questions.forEach(function(q, idx) {
    html += `
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <span style="font-size:12px;color:#999;">${q.subject} · ${q.chapter || ''} · ${q.difficulty || '中'}</span>
          ${q.addedByTeacher ? '<span style="font-size:11px;color:#7B1FA2;background:#F3E5F5;padding:2px 8px;border-radius:10px;">教师添加</span>' : ''}
        </div>
        <div style="font-size:14px;color:#333;margin-bottom:8px;">${idx + 1}. ${q.question}</div>
        <div style="font-size:13px;color:#666;margin-bottom:4px;">A. ${q.options[0] || ''}</div>
        <div style="font-size:13px;color:#666;margin-bottom:4px;">B. ${q.options[1] || ''}</div>
        <div style="font-size:13px;color:#666;margin-bottom:4px;">C. ${q.options[2] || ''}</div>
        <div style="font-size:13px;color:#666;margin-bottom:8px;">D. ${q.options[3] || ''}</div>
        <div style="font-size:13px;color:#4CAF50;font-weight:600;">正确答案：${q.answer}</div>
      </div>
    `;
  });
  listEl.innerHTML = html;
}
