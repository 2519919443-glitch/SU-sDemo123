// =============================================
//  页面：教师 - 学生详情
// =============================================
Router.register('teacher-student', function(params) {
  var username = params.user;
  if (!username) { Router.go('teacher'); return; }

  var app = document.getElementById('page-teacher-student');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-teacher-student';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  // 获取学生数据
  var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
  var student = users[username] || {};
  var nickname = student.nickname || username;
  var grade = student.grade || '3';
  var gradeName = {'1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级','7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三'}[grade] || '';

  // 获取学习记录
  var quizRecords = JSON.parse(localStorage.getItem('xuexi_quiz_' + username) || '[]');
  var checkinRecords = JSON.parse(localStorage.getItem('xuexi_checkin_' + username) || '[]');
  var studyRecords = JSON.parse(localStorage.getItem('xuexi_study_' + username) || '[]');

  // 获取在线时长
  var onlineMinutes = 0;
  try {
    var onlineData = JSON.parse(localStorage.getItem('xuexi_online_' + username) || '{}');
    for (var date in onlineData) {
      onlineMinutes += onlineData[date];
    }
  } catch(e) {}
  var onlineHours = onlineMinutes >= 60 ? (onlineMinutes / 60).toFixed(1) + '小时' : onlineMinutes + '分钟';

  // 计算统计
  var totalQuiz = quizRecords.length;
  var correctQuiz = 0;
  var subjectStats = {};
  quizRecords.forEach(function(r) {
    if (r.correct) correctQuiz++;
    if (!subjectStats[r.subject]) subjectStats[r.subject] = { total: 0, correct: 0 };
    subjectStats[r.subject].total++;
    if (r.correct) subjectStats[r.subject].correct++;
  });
  var avgRate = totalQuiz > 0 ? Math.round(correctQuiz / totalQuiz * 100) : 0;

  app.innerHTML = `
    <div style="padding:16px;max-width:600px;margin:0 auto;">
      <!-- 顶部导航 -->
      <div style="display:flex;align-items:center;margin-bottom:20px;">
        <button onclick="Router.go('teacher')" style="background:none;border:none;font-size:20px;cursor:pointer;margin-right:12px;">←</button>
        <div style="flex:1;">
          <h1 style="font-size:20px;font-weight:700;color:#333;margin-bottom:2px;">${nickname}</h1>
          <p style="font-size:13px;color:#999;">@${username} · ${gradeName}</p>
        </div>
      </div>

      <!-- 学生信息卡片 -->
      <div style="background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:16px;padding:20px;color:#fff;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-size:14px;opacity:0.9;margin-bottom:4px;">学习天数</div>
            <div style="font-size:32px;font-weight:700;">${student.studyDays || 0}</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:14px;opacity:0.9;margin-bottom:4px;">做题总数</div>
            <div style="font-size:32px;font-weight:700;">${totalQuiz}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px;opacity:0.9;margin-bottom:4px;">正确率</div>
            <div style="font-size:32px;font-weight:700;">${avgRate}%</div>
          </div>
        </div>
      </div>

      <!-- 学科统计 -->
      <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">学科正确率</h3>
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        ${Object.keys(subjectStats).length === 0 ? '<p style="text-align:center;color:#999;padding:10px;">暂无做题记录</p>' :
          Object.keys(subjectStats).map(function(sub) {
            var st = subjectStats[sub];
            var rate = st.total > 0 ? Math.round(st.correct / st.total * 100) : 0;
            return `
              <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:14px;color:#333;">${sub}</span>
                  <span style="font-size:14px;color:${rate >= 80 ? '#4CAF50' : rate >= 60 ? '#FF9800' : '#F44336'};">${rate}% (${st.correct}/${st.total})</span>
                </div>
                <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
                  <div style="height:100%;width:${rate}%;background:${rate >= 80 ? '#4CAF50' : rate >= 60 ? '#FF9800' : '#F44336'};border-radius:4px;"></div>
                </div>
              </div>
            `;
          }).join('')
        }
      </div>

      <!-- 最近错题 -->
      <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;">最近错题</h3>
      <div id="wrong-list">
        ${quizRecords.filter(function(r) { return !r.correct; }).slice(0, 10).length === 0 ?
          '<p style="text-align:center;color:#999;padding:20px;">暂无错题记录</p>' :
          quizRecords.filter(function(r) { return !r.correct; }).slice(0, 10).map(function(r, i) {
            return `
              <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                  <span style="font-size:12px;color:#999;">${r.subject} · ${r.chapter || ''}</span>
                  <span style="font-size:12px;color:#999;">${r.date || ''}</span>
                </div>
                <div style="font-size:14px;color:#333;margin-bottom:8px;">${r.question || '题目加载失败'}</div>
                <div style="font-size:13px;color:#F44336;">你的答案：${r.userAnswer || ''}</div>
                <div style="font-size:13px;color:#4CAF50;">正确答案：${r.answer || ''}</div>
                ${r.explanation ? '<div style="font-size:12px;color:#999;margin-top:8px;padding:8px;background:#f5f5f5;border-radius:8px;">解析：' + r.explanation + '</div>' : ''}
              </div>
            `;
          }).join('')
        }
      </div>

      <!-- 打卡记录 -->
      <h3 style="font-size:16px;font-weight:600;color:#333;margin-bottom:12px;margin-top:20px;">打卡与在线记录</h3>
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:14px;color:#333;">总打卡次数</span>
          <span style="font-size:14px;font-weight:600;color:var(--primary);">${checkinRecords.length} 次</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:14px;color:#333;">连续打卡</span>
          <span style="font-size:14px;font-weight:600;color:#4CAF50;">${student.streak || 0} 天</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:14px;color:#333;">总在线时长</span>
          <span style="font-size:14px;font-weight:600;color:#FF9800;">${onlineHours}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:14px;color:#333;">最近打卡</span>
          <span style="font-size:14px;font-weight:600;color:#999;">${checkinRecords.length > 0 ? checkinRecords[checkinRecords.length - 1] : '无'}</span>
        </div>
      </div>
    </div>
  `;
});
