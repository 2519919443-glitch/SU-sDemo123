/**
 * admin-quiz.js - 题库管理页面
 */
Router.register('admin-quiz', function(params) {
  if (!Admin.isLoggedIn()) { Router.go('admin-login'); return; }

  var app = document.getElementById('page-admin-quiz');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-admin-quiz';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var gradeMap = { '1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级',
                   '7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三' };
  var allQuiz = window.AppData && window.AppData.quizBanks ? window.AppData.quizBanks : [];

  // 获取教师添加的题目（存在 localStorage）
  var teacherQuiz = [];
  try {
    teacherQuiz = JSON.parse(localStorage.getItem('xuexi_teacher_quiz') || '[]');
  } catch(e){}

  var allQuestions = allQuiz.concat(teacherQuiz);

  var html = `
    <div style="padding:16px 16px 80px;">
      <!-- 顶部导航 -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <button onclick="Router.go('admin');" style="background:none;border:none;font-size:22px;cursor:pointer;padding:0;">←</button>
        <h1 style="font-size:20px;font-weight:700;margin:0;">题库管理</h1>
      </div>

      <!-- 统计 -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
        <div style="background:#fff;border-radius:12px;padding:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:22px;font-weight:700;color:var(--primary);">${allQuestions.length}</div>
          <div style="font-size:11px;color:#888;margin-top:2px;">总题数</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:22px;font-weight:700;color:#1976D2;">${allQuiz.length}</div>
          <div style="font-size:11px;color:#888;margin-top:2px;">系统题目</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:22px;font-weight:700;color:#43A047;">${teacherQuiz.length}</div>
          <div style="font-size:11px;color:#888;margin-top:2px;">教师添加</div>
        </div>
      </div>

      <!-- 筛选 -->
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
        <select id="filter-grade" style="padding:7px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;">
          <option value="">全部年级</option>
          <option value="1">一年级</option><option value="2">二年级</option>
          <option value="3">三年级</option><option value="4">四年级</option>
          <option value="5">五年级</option><option value="6">六年级</option>
          <option value="7">七年级</option><option value="8">八年级</option>
          <option value="9">九年级</option>
          <option value="10">高一</option><option value="11">高二</option>
          <option value="12">高三</option>
        </select>
        <select id="filter-subject" style="padding:7px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;">
          <option value="">全部学科</option>
          <option value="语文">语文</option><option value="数学">数学</option>
          <option value="英语">英语</option><option value="物理">物理</option>
          <option value="化学">化学</option><option value="生物">生物</option>
          <option value="历史">历史</option><option value="地理">地理</option>
          <option value="政治">政治</option>
        </select>
        <button id="btn-add-question" style="padding:7px 14px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;margin-left:auto;">＋ 添加题目</button>
      </div>

      <!-- 题目列表 -->
      <div id="question-list">
  `;

  if (allQuestions.length === 0) {
    html += '<div style="text-align:center;color:#aaa;padding:40px 0;">暂无题目数据</div>';
  } else {
    allQuestions.forEach(function(q, i) {
      var isTeacher = q.addedBy === 'teacher';
      html += `
        <div class="quiz-item" data-grade="${q.grade||''}" data-subject="${q.subject||''}" style="background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);${isTeacher?'border-left:4px solid #43A047;':''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:500;margin-bottom:4px;">${q.question}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11px;color:#888;">
                <span style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${gradeMap[q.grade]||q.grade||''}</span>
                <span style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${q.subject||''}</span>
                <span style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${q.chapter||''}</span>
                <span style="background:${q.difficulty==='易'?'#E8F5E9':'#FFF3E0'};padding:2px 6px;border-radius:4px;">${q.difficulty||'中'}</span>
                ${isTeacher ? '<span style="background:#E8F5E9;color:#43A047;padding:2px 6px;border-radius:4px;">教师添加</span>' : ''}
              </div>
            </div>
            ${isTeacher ? '<button onclick="if(confirm(\'确定删除此题？\')){ var d=JSON.parse(localStorage.getItem(\'xuexi_teacher_quiz\')||\'[]\'); d.splice('+ teacherQuiz.indexOf(q) +'); localStorage.setItem(\'xuexi_teacher_quiz\',JSON.stringify(d)); Utils.toast(\'已删除\'); setTimeout(function(){Router.refresh();},300); }" style="padding:4px 8px;background:#fff;color:#e74c3c;border:1px solid #e74c3c;border-radius:6px;font-size:11px;cursor:pointer;white-space:nowrap;">删除</button>' : ''}
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>

    <!-- 添加题目弹窗 -->
    <div id="add-quiz-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:16px;width:95%;max-width:500px;max-height:90vh;overflow-y:auto;padding:20px;">
        <div style="font-size:18px;font-weight:700;margin-bottom:14px;text-align:center;">添加新题目</div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">年级</label>
          <select id="aq-grade" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
            <option value="1">一年级</option><option value="2">二年级</option>
            <option value="3" selected>三年级</option><option value="4">四年级</option>
            <option value="5">五年级</option><option value="6">六年级</option>
            <option value="7">七年级</option><option value="8">八年级</option>
            <option value="9">九年级</option><option value="10">高一</option>
            <option value="11">高二</option><option value="12">高三</option>
          </select>
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">学科</label>
          <select id="aq-subject" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
            <option value="语文">语文</option><option value="数学" selected>数学</option>
            <option value="英语">英语</option><option value="物理">物理</option>
            <option value="化学">化学</option><option value="生物">生物</option>
            <option value="历史">历史</option><option value="地理">地理</option>
            <option value="政治">政治</option>
          </select>
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">章节</label>
          <input id="aq-chapter" type="text" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">难度</label>
          <select id="aq-diff" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
            <option value="易">易</option><option value="中" selected>中</option>
            <option value="难">难</option>
          </select>
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">题目</label>
          <textarea id="aq-question" placeholder="请输入题目" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;min-height:60px;resize:vertical;"></textarea>
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">选项A</label>
          <input id="aq-opt-a" type="text" placeholder="选项A" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">选项B</label>
          <input id="aq-opt-b" type="text" placeholder="选项B" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">选项C</label>
          <input id="aq-opt-c" type="text" placeholder="选项C" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">选项D</label>
          <input id="aq-opt-d" type="text" placeholder="选项D" style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">正确答案（A/B/C/D）</label>
          <input id="aq-answer" type="text" placeholder="A" maxlength="1" style="width:60px;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;text-align:center;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;color:#666;display:block;margin-bottom:3px;">解析（可选）</label>
          <textarea id="aq-exp" placeholder="题目解析..." style="width:100%;padding:9px 10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;min-height:50px;resize:vertical;"></textarea>
        </div>
        <div id="aq-error" style="color:#e74c3c;font-size:12px;margin-bottom:8px;display:none;"></div>
        <div style="display:flex;gap:10px;">
          <button id="aq-cancel" style="flex:1;padding:10px;background:#f5f5f5;color:#666;border:none;border-radius:10px;font-size:14px;cursor:pointer;">取消</button>
          <button id="aq-confirm" style="flex:1;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">确认添加</button>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = html;

  // 筛选功能
  var filterGrade = document.getElementById('filter-grade');
  var filterSubject = document.getElementById('filter-subject');
  function doFilter() {
    var g = filterGrade ? filterGrade.value : '';
    var s = filterSubject ? filterSubject.value : '';
    document.querySelectorAll('.quiz-item').forEach(function(item) {
      var show = true;
      if (g && item.dataset.grade !== g) show = false;
      if (s && item.dataset.subject !== s) show = false;
      item.style.display = show ? 'block' : 'none';
    });
  }
  if (filterGrade) filterGrade.addEventListener('change', doFilter);
  if (filterSubject) filterSubject.addEventListener('change', doFilter);

  // 添加题目弹窗
  var modal = document.getElementById('add-quiz-modal');
  var btnAdd = document.getElementById('btn-add-question');
  if (btnAdd && modal) {
    btnAdd.addEventListener('click', function() { modal.style.display = 'flex'; });
  }
  var btnCancel = document.getElementById('aq-cancel');
  if (btnCancel && modal) {
    btnCancel.addEventListener('click', function() { modal.style.display = 'none'; });
  }
  // 点击背景关闭
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // 确认添加
  var btnConfirm = document.getElementById('aq-confirm');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', function() {
      var grade = document.getElementById('aq-grade').value;
      var subject = document.getElementById('aq-subject').value;
      var chapter = document.getElementById('aq-chapter').value.trim();
      var diff = document.getElementById('aq-diff').value;
      var question = document.getElementById('aq-question').value.trim();
      var optA = document.getElementById('aq-opt-a').value.trim();
      var optB = document.getElementById('aq-opt-b').value.trim();
      var optC = document.getElementById('aq-opt-c').value.trim();
      var optD = document.getElementById('aq-opt-d').value.trim();
      var answer = document.getElementById('aq-answer').value.trim().toUpperCase();
      var exp = document.getElementById('aq-exp').value.trim();
      var err = document.getElementById('aq-error');

      if (!question) { err.textContent = '请输入题目'; err.style.display = 'block'; return; }
      if (!optA || !optB || !optC || !optD) { err.textContent = '请填写所有选项'; err.style.display = 'block'; return; }
      if (!['A','B','C','D'].includes(answer)) { err.textContent = '正确答案只能是 A/B/C/D'; err.style.display = 'block'; return; }

      var newQ = {
        id: 'tq_' + Date.now(),
        grade: grade,
        subject: subject,
        chapter: chapter,
        difficulty: diff,
        question: question,
        options: [optA, optB, optC, optD],
        answer: answer,
        explanation: exp,
        addedBy: 'teacher',
        addTime: new Date().toISOString()
      };

      var d = JSON.parse(localStorage.getItem('xuexi_teacher_quiz') || '[]');
      d.push(newQ);
      localStorage.setItem('xuexi_teacher_quiz', JSON.stringify(d));
      Utils.toast('题目添加成功！');
      modal.style.display = 'none';
      setTimeout(function() { Router.refresh(); }, 300);
    });
  }
});
