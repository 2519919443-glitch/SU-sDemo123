// =============================================
//  页面：教师 - 任务管理
// =============================================
Router.register('teacher-task', function(params) {
  var app = document.getElementById('page-teacher-task');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-teacher-task';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var grade = App.state.teacherGrade || '3';
  var gradeName = {'1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级','7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三'}[grade] || '三年级';

  // 获取本年级所有学生
  var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
  var students = [];
  for (var u in users) {
    if (users[u].grade === grade) {
      students.push({ username: u, nickname: users[u].nickname || u });
    }
  }

  app.innerHTML = `
    <div style="padding:16px;max-width:600px;margin:0 auto;">
      <!-- 顶部导航 -->
      <div style="display:flex;align-items:center;margin-bottom:20px;">
        <button onclick="Router.go('teacher')" style="background:none;border:none;font-size:20px;cursor:pointer;margin-right:12px;">←</button>
        <h1 style="font-size:20px;font-weight:700;color:#333;">任务管理</h1>
      </div>

      <p style="font-size:14px;color:#666;margin-bottom:20px;">${gradeName} · 共 ${students.length} 名学生</p>

      <!-- 今日任务完成情况 -->
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">今日任务完成情况</h3>
        <div id="task-today-list">
          ${students.length === 0 ? '<p style="text-align:center;color:#999;padding:10px;">本年级暂无学生</p>' :
            students.map(function(s) {
              var today = new Date().toISOString().split('T')[0];
              var checkin = JSON.parse(localStorage.getItem('xuexi_checkin_' + s.username) || '[]');
              var todayCheckin = checkin.filter(function(c) { return c.date === today; }).length > 0;
              var quizRecords = JSON.parse(localStorage.getItem('xuexi_quiz_' + s.username) || '[]');
              var todayQuiz = quizRecords.filter(function(r) { return r.date === today; }).length;
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600;">${s.nickname.charAt(0).toUpperCase()}</div>
                    <span style="font-size:14px;color:#333;">${s.nickname}</span>
                  </div>
                  <div style="display:flex;gap:12px;font-size:13px;">
                    <span style="color:${todayCheckin ? '#4CAF50' : '#F44336'};">${todayCheckin ? '✅ 已打卡' : '❌ 未打卡'}</span>
                    <span style="color:${todayQuiz >= 5 ? '#4CAF50' : '#FF9800'};">${todayQuiz}题</span>
                  </div>
                </div>
              `;
            }).join('')
          }
        </div>
      </div>

      <!-- 本周任务统计 -->
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">本周任务统计</h3>
        <div id="task-week-list">
          ${students.length === 0 ? '<p style="text-align:center;color:#999;padding:10px;">本年级暂无学生</p>' :
            (function() {
              var weekStart = new Date();
              weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // 本周一
              var weekDates = [];
              for (var i = 0; i < 7; i++) {
                var d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                weekDates.push(d.toISOString().split('T')[0]);
              }
              return students.map(function(s) {
                var checkin = JSON.parse(localStorage.getItem('xuexi_checkin_' + s.username) || '[]');
                var quizRecords = JSON.parse(localStorage.getItem('xuexi_quiz_' + s.username) || '[]');
                var weekCheckin = 0;
                var weekQuiz = 0;
                weekDates.forEach(function(d) {
                  if (checkin.filter(function(c) { return c.date === d; }).length > 0) weekCheckin++;
                  weekQuiz += quizRecords.filter(function(r) { return r.date === d; }).length;
                });
                return `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:14px;color:#333;">${s.nickname}</span>
                    <div style="display:flex;gap:16px;font-size:13px;color:#666;">
                      <span>打卡 ${weekCheckin}/7 天</span>
                      <span>做题 ${weekQuiz} 题</span>
                    </div>
                  </div>
                `;
              }).join('');
            })()
          }
        </div>
      </div>

      <!-- 布置新任务 -->
      <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">布置新任务</h3>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">任务名称</label>
          <input id="task-name" type="text" placeholder="例如：完成第三章练习题" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">任务类型</label>
          <select id="task-type" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;">
            <option value="quiz">做题任务</option>
            <option value="checkin">打卡任务</option>
            <option value="reading">阅读任务</option>
            <option value="homework">作业任务</option>
          </select>
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">要求数量（题/分钟）</label>
          <input id="task-count" type="number" placeholder="例如：10" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">截止日期</label>
          <input id="task-deadline" type="date" style="width:100%;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
        </div>
        <button onclick="addTeacherTask()" style="width:100%;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">发布任务</button>
      </div>

      <!-- 已发布任务列表 -->
      <h3 style="font-size:16px;font-weight:600;color:#333;margin:20px 0 12px;">已发布任务</h3>
      <div id="task-published-list">
        <p style="text-align:center;color:#999;padding:20px;">加载中...</p>
      </div>
    </div>
  `;

  // 加载已发布的任务
  loadTeacherTasks(grade);
});

// 发布新任务
function addTeacherTask() {
  var name = document.getElementById('task-name').value.trim();
  var type = document.getElementById('task-type').value;
  var count = document.getElementById('task-count').value;
  var deadline = document.getElementById('task-deadline').value;

  if (!name) return Utils.toast('请输入任务名称');
  if (!count || parseInt(count) <= 0) return Utils.toast('请输入有效数量');

  var task = {
    id: 'task_' + Date.now(),
    grade: App.state.teacherGrade || '3',
    name: name,
    type: type,
    count: parseInt(count),
    deadline: deadline || '',
    createdAt: new Date().toISOString(),
    createdBy: App.state.teacherName || 'teacher'
  };

  var tasks = JSON.parse(localStorage.getItem('xuexi_teacher_tasks') || '[]');
  tasks.push(task);
  localStorage.setItem('xuexi_teacher_tasks', JSON.stringify(tasks));

  Utils.toast('任务发布成功！');
  document.getElementById('task-name').value = '';
  document.getElementById('task-count').value = '';
  document.getElementById('task-deadline').value = '';

  loadTeacherTasks(App.state.teacherGrade || '3');
}

// 加载已发布的任务
function loadTeacherTasks(grade) {
  var listEl = document.getElementById('task-published-list');
  var tasks = JSON.parse(localStorage.getItem('xuexi_teacher_tasks') || '[]');
  var gradeTasks = tasks.filter(function(t) { return t.grade === grade; });

  if (gradeTasks.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无已发布任务</p>';
    return;
  }

  var html = '';
  gradeTasks.reverse().forEach(function(t) {
    var typeName = {'quiz':'做题','checkin':'打卡','reading':'阅读','homework':'作业'}[t.type] || t.type;
    html += `
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="font-size:15px;font-weight:600;color:#333;">${t.name}</div>
          <button onclick="deleteTeacherTask('${t.id}')" style="background:none;border:none;color:#F44336;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div style="font-size:13px;color:#666;margin-bottom:4px;">类型：${typeName} · 要求：${t.count}${t.type === 'quiz' ? '题' : '分钟'}</div>
        <div style="font-size:13px;color:#999;">发布于 ${t.createdAt.split('T')[0]} · 截止：${t.deadline || '无'}</div>
      </div>
    `;
  });
  listEl.innerHTML = html;
}

// 删除任务
function deleteTeacherTask(taskId) {
  if (!confirm('确定删除此任务吗？')) return;
  var tasks = JSON.parse(localStorage.getItem('xuexi_teacher_tasks') || '[]');
  tasks = tasks.filter(function(t) { return t.id !== taskId; });
  localStorage.setItem('xuexi_teacher_tasks', JSON.stringify(tasks));
  Utils.toast('任务已删除');
  loadTeacherTasks(App.state.teacherGrade || '3');
}
