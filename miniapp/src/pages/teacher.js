// =============================================
//  页面：教师首页 - 学生管理
// =============================================
Router.register('teacher', function(params) {
  var app = document.getElementById('page-teacher');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-teacher';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var grade = App.state.teacherGrade || '3';
  var gradeName = {'1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级','7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三'}[grade] || '三年级';

  app.innerHTML = `
    <div style="padding:16px;max-width:600px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div>
          <h1 style="font-size:22px;font-weight:700;color:var(--primary);margin-bottom:4px;">教师后台</h1>
          <p style="font-size:14px;color:#666;">${gradeName} · 学生管理</p>
        </div>
        <button onclick="App.logout()" style="padding:8px 16px;background:#f44336;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">退出登录</button>
      </div>

      <!-- 统计卡片 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size:13px;color:#999;margin-bottom:4px;">本年级学生</div>
          <div style="font-size:28px;font-weight:700;color:var(--primary);" id="stat-students">0</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size:13px;color:#999;margin-bottom:4px;">今日活跃</div>
          <div style="font-size:28px;font-weight:700;color:#4CAF50;" id="stat-active">0</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size:13px;color:#999;margin-bottom:4px;">平均做题</div>
          <div style="font-size:28px;font-weight:700;color:#FF9800;" id="stat-avg-quiz">0</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-size:13px;color:#999;margin-bottom:4px;">平均正确率</div>
          <div style="font-size:28px;font-weight:700;color:#9C27B0;" id="stat-avg-rate">0%</div>
        </div>
      </div>

      <!-- 功能入口 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
        <div onclick="Router.go('teacher-chapter')" style="background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);cursor:pointer;">
          <div style="font-size:32px;margin-bottom:8px;">📝</div>
          <div style="font-size:15px;font-weight:600;color:#333;">章节管理</div>
          <div style="font-size:12px;color:#999;margin-top:4px;">修改章节/添加题目</div>
        </div>
        <div onclick="Router.go('teacher-task')" style="background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);cursor:pointer;">
          <div style="font-size:32px;margin-bottom:8px;">✅</div>
          <div style="font-size:15px;font-weight:600;color:#333;">任务管理</div>
          <div style="font-size:12px;color:#999;margin-top:4px;">查看每日任务完成情况</div>
        </div>
      </div>

      <!-- 学生列表 -->
      <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">学生列表</h3>
      <div id="teacher-student-list">
        <p style="text-align:center;color:#999;padding:20px;">加载中...</p>
      </div>
    </div>
  `;

  // 加载学生数据
  loadTeacherStudents(grade);
});

// 加载教师对应的学生数据
function loadTeacherStudents(grade) {
  var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
  var students = [];
  for (var u in users) {
    if (users[u].grade === grade) {
      // 获取打卡次数
      var checkinCount = 0;
      try {
        var checkin = JSON.parse(localStorage.getItem('xuexi_checkin_' + u) || '[]');
        checkinCount = checkin.length;
      } catch(e) {}
      // 获取在线时长
      var onlineMinutes = 0;
      try {
        var onlineData = JSON.parse(localStorage.getItem('xuexi_online_' + u) || '{}');
        for (var date in onlineData) {
          onlineMinutes += onlineData[date];
        }
      } catch(e) {}
      students.push({
        username: u,
        nickname: users[u].nickname || u,
        studyDays: users[u].studyDays || 0,
        totalMinutes: users[u].totalMinutes || 0,
        todayMinutes: users[u].todayMinutes || 0,
        checkinCount: checkinCount,
        onlineMinutes: onlineMinutes
      });
    }
  }

  // 更新统计
  document.getElementById('stat-students').textContent = students.length;
  var activeToday = 0;
  var totalQuiz = 0;
  var totalCorrect = 0;
  students.forEach(function(s) {
    if (s.todayMinutes > 0) activeToday++;
    // 从学习记录中获取做题数据
    var records = JSON.parse(localStorage.getItem('xuexi_quiz_' + s.username) || '[]');
    totalQuiz += records.length;
    records.forEach(function(r) { if (r.correct) totalCorrect++; });
  });
  document.getElementById('stat-active').textContent = activeToday;
  document.getElementById('stat-avg-quiz').textContent = students.length > 0 ? Math.round(totalQuiz / students.length) : 0;
  document.getElementById('stat-avg-rate').textContent = totalQuiz > 0 ? Math.round(totalCorrect / totalQuiz * 100) + '%' : '0%';

  // 渲染学生列表
  var listEl = document.getElementById('teacher-student-list');
  if (students.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">本年级暂无学生注册</p>';
    return;
  }
  var html = '';
  students.forEach(function(s) {
    var records = JSON.parse(localStorage.getItem('xuexi_quiz_' + s.username) || '[]');
    var quizCount = records.length;
    var correctCount = 0;
    records.forEach(function(r) { if (r.correct) correctCount++; });
    var rate = quizCount > 0 ? Math.round(correctCount / quizCount * 100) : 0;
    var onlineHours = s.onlineMinutes >= 60 ? (s.onlineMinutes / 60).toFixed(1) + 'h' : s.onlineMinutes + 'min';
    html += `
      <div onclick="Router.go('teacher-student', {user:'${s.username}'})" style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);cursor:pointer;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:700;">${(s.nickname || s.username).charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-size:15px;font-weight:600;color:#333;">${s.nickname || s.username}</div>
              <div style="font-size:12px;color:#999;">@${s.username} · 学习${s.studyDays}天 · 打卡${s.checkinCount}次</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px;font-weight:600;color:${rate >= 80 ? '#4CAF50' : rate >= 60 ? '#FF9800' : '#F44336'};">${rate}%</div>
            <div style="font-size:12px;color:#999;">正确率 · ${quizCount}题</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:#666;">
          <span>在线：${onlineHours}</span>
          <span>今日：${s.todayMinutes || 0}分钟</span>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = html;
}
