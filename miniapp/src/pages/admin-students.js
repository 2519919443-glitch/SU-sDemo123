/**
 * admin-students.js - 管理员查看学生列表
 */
Router.register('admin-students', function(params) {
  if (!Admin.isLoggedIn()) { Router.go('admin-login'); return; }

  var app = document.getElementById('page-admin-students');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-admin-students';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var students = Admin.getAllStudents();
  var gradeMap = { '1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级',
                   '7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三' };

  var html = `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <div style="font-size:20px;cursor:pointer;" id="admin-back">←</div>
        <h2 style="font-size:17px;font-weight:700;">学生管理</h2>
        <span style="margin-left:auto;font-size:13px;color:#888;">共 ${students.length} 人</span>
      </div>
      <!-- 搜索框 -->
      <input type="text" id="student-search" placeholder="🔍 搜索用户名、昵称、密码..." style="width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:16px;box-sizing:border-box;">
      <!-- 学生列表 -->
      <div id="students-list">
  `;

  if (students.length === 0) {
    html += '<div style="text-align:center;color:#aaa;padding:40px 0;">暂无学生数据</div>';
  } else {
    students.forEach(function(s, i) {
      var gradeStr = gradeMap[s.grade] ? gradeMap[s.grade] : (s.grade || '-');
      var password = s.decryptedPassword || '-';
      html += `
        <div class="student-card" data-name="${(s.nick||s.username).replace(/"/g,'&quot;')}" data-user="${s.username}" data-pwd="${password}" style="background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:42px;height:42px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:20px;">${s.avatar || '👦'}</div>
              <div>
                <div style="font-size:15px;font-weight:600;">${s.nick || s.username}</div>
                <div style="font-size:12px;color:#888;">${gradeStr} · 学习${s.studyDays||0}天</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:14px;font-weight:700;color:${parseInt((s.accuracy||'0%').replace('%','')) > 60 ? '#43A047' : '#e74c3c'}">${s.accuracy || '0%'}</div>
              <div style="font-size:11px;color:#888;">正确率</div>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:10px;font-size:12px;color:#666;flex-wrap:wrap;">
            <span>做题：${s.totalQuiz||0}</span>
            <span>打卡：${s.checkinCount||0}天</span>
            <span>在线：${s.onlineHours || '0分钟'}</span>
            <span>错题：${s.totalQuiz - s.correctQuiz || 0}</span>
          </div>
          <div style="margin-top:8px;font-size:12px;color:#999;display:flex;align-items:center;gap:8px;">
            <span>密码：<b>${password}</b></span>
            <button class="btn-reset-pwd" data-user="${s.username}" style="padding:3px 10px;background:#FF9800;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer;">重置密码</button>
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  app.innerHTML = html;

  // 返回按钮
  document.getElementById('admin-back').addEventListener('click', function() { Router.go('admin'); });

  // 搜索功能
  var searchInput = document.getElementById('student-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var keyword = this.value.toLowerCase();
      document.querySelectorAll('.student-card').forEach(function(card) {
        var name = (card.dataset.name || '').toLowerCase();
        var user = (card.dataset.user || '').toLowerCase();
        var pwd = (card.dataset.pwd || '').toLowerCase();
        if (name.indexOf(keyword) !== -1 || user.indexOf(keyword) !== -1 || pwd.indexOf(keyword) !== -1) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 重置密码按钮
  app.querySelectorAll('.btn-reset-pwd').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var username = this.dataset.user;
      showResetPasswordModal(username, 'student');
    });
  });
});

// 重置密码弹窗
function showResetPasswordModal(username, type) {
  var mask = document.createElement('div');
  mask.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
  mask.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;width:90%;max-width:360px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
      <h3 style="font-size:17px;font-weight:700;margin-bottom:16px;">重置密码 - ${username}</h3>
      <input id="new-pwd" type="password" placeholder="新密码（不少于6位）" style="width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:12px;box-sizing:border-box;">
      <input id="confirm-pwd" type="password" placeholder="确认新密码" style="width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:20px;box-sizing:border-box;">
      <div style="display:flex;gap:10px;">
        <button id="btn-cancel-pwd" style="flex:1;padding:10px;background:#f0f0f0;color:#333;border:none;border-radius:10px;font-size:14px;cursor:pointer;">取消</button>
        <button id="btn-confirm-pwd" style="flex:1;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer;">确认修改</button>
      </div>
    </div>
  `;
  document.body.appendChild(mask);

  // 取消按钮
  mask.querySelector('#btn-cancel-pwd').addEventListener('click', function() { mask.remove(); });

  // 确认修改
  mask.querySelector('#btn-confirm-pwd').addEventListener('click', function() {
    var newPwd = mask.querySelector('#new-pwd').value;
    var confirmPwd = mask.querySelector('#confirm-pwd').value;
    if (newPwd.length < 6) {
      Utils.alert('密码不少于6位', 'error');
      return;
    }
    if (newPwd !== confirmPwd) {
      Utils.alert('两次密码不一致', 'error');
      return;
    }
    // 加密存储
    var encryptedPwd = Utils.encryptPassword(newPwd);
    if (type === 'student') {
      var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
      if (users[username]) {
        users[username].password = encryptedPwd;
        localStorage.setItem('xuexi_users', JSON.stringify(users));
      }
    } else {
      var teachers = JSON.parse(localStorage.getItem('xuexi_teachers') || '{}');
      if (teachers[username]) {
        teachers[username].password = encryptedPwd;
        localStorage.setItem('xuexi_teachers', JSON.stringify(teachers));
      }
    }
    mask.remove();
    Utils.alert('密码已重置为：' + newPwd, 'success');
    // 刷新页面显示新密码
    setTimeout(function() { Router.go(type === 'student' ? 'admin-students' : 'admin-teachers'); }, 1000);
  });
}
