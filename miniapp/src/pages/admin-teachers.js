/**
 * admin-teachers.js - 管理员查看教师列表
 */
Router.register('admin-teachers', function(params) {
  if (!Admin.isLoggedIn()) { Router.go('admin-login'); return; }

  var app = document.getElementById('page-admin-teachers');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-admin-teachers';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var teachers = Admin.getAllTeachers();
  var gradeMap = { '1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级',
                   '7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三' };

  var html = `
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <div style="font-size:20px;cursor:pointer;" id="admin-back">←</div>
        <h2 style="font-size:17px;font-weight:700;">教师管理</h2>
        <span style="margin-left:auto;font-size:13px;color:#888;">共 ${teachers.length} 人</span>
      </div>
      <!-- 添加教师表单 -->
      <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">添加新教师</h3>
        <input id="new-teacher-user" type="text" placeholder="教师账号" style="width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;">
        <input id="new-teacher-name" type="text" placeholder="教师姓名" style="width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;">
        <input id="new-teacher-pwd" type="password" placeholder="密码（不少于6位）" style="width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;">
        <div style="font-size:13px;color:#666;margin-bottom:10px;">教授年级（可多选）：</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
  `;

  for (var g = 1; g <= 12; g++) {
    html += `<label style="font-size:13px;cursor:pointer;"><input type="checkbox" class="teacher-grade-cb" value="${g}" style="margin-right:4px;">${gradeMap[g]}</label>`;
  }

  html += `
        </div>
        <button id="btn-add-teacher" style="width:100%;padding:10px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">确认添加</button>
      </div>
      <!-- 教师列表 -->
      <div id="teachers-list">
  `;

  if (teachers.length === 0) {
    html += '<div style="text-align:center;color:#aaa;padding:40px 0;">暂无教师数据</div>';
  } else {
    teachers.forEach(function(t) {
      var gradesStr = (t.grades || []).map(function(g) { return gradeMap[g] || g; }).join('、') || '-';
      var password = t.decryptedPassword || '-';
      // 计算在线时长
      var onlineMinutes = 0;
      try {
        var onlineData = JSON.parse(localStorage.getItem('xuexi_online_' + t.username) || '{}');
        for (var date in onlineData) {
          onlineMinutes += onlineData[date];
        }
      } catch(e) {}
      var onlineHours = onlineMinutes >= 60 ? (onlineMinutes / 60).toFixed(1) + '小时' : onlineMinutes + '分钟';
      html += `
        <div class="teacher-card" data-user="${t.username}" data-pwd="${password}" style="background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:15px;font-weight:600;">${t.name || t.username}</div>
              <div style="font-size:12px;color:#888;margin-top:2px;">账号：${t.username}</div>
            </div>
            <button class="btn-reset-pwd" data-user="${t.username}" style="padding:5px 12px;background:#FF9800;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">重置密码</button>
          </div>
          <div style="margin-top:8px;font-size:12px;color:#666;">
            <div>教授年级：${gradesStr}</div>
            <div style="margin-top:4px;">密码：<b>${password}</b></div>
            <div style="margin-top:4px;">在线时长：${onlineHours}</div>
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

  // 添加教师
  document.getElementById('btn-add-teacher').addEventListener('click', function() {
    var username = document.getElementById('new-teacher-user').value.trim();
    var name = document.getElementById('new-teacher-name').value.trim();
    var password = document.getElementById('new-teacher-pwd').value;
    var grades = [];
    document.querySelectorAll('.teacher-grade-cb:checked').forEach(function(cb) { grades.push(cb.value); });
    if (!username) { Utils.alert('请输入教师账号', 'error'); return; }
    if (!name) { Utils.alert('请输入教师姓名', 'error'); return; }
    if (password.length < 6) { Utils.alert('密码不少于6位', 'error'); return; }
    if (grades.length === 0) { Utils.alert('请选择至少一个教授年级', 'error'); return; }
    var teachers = JSON.parse(localStorage.getItem('xuexi_teachers') || '{}');
    if (teachers[username]) { Utils.alert('教师账号已存在', 'error'); return; }
    teachers[username] = {
      password: Utils.encryptPassword(password),
      name: name,
      grades: grades,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('xuexi_teachers', JSON.stringify(teachers));
    Utils.alert('教师添加成功！密码：' + password, 'success');
    setTimeout(function() { Router.go('admin-teachers'); }, 1500);
  });

  // 重置密码按钮
  app.querySelectorAll('.btn-reset-pwd').forEach(function(btn) {
    btn.addEventListener('click', function() {
      showResetPasswordModal(this.dataset.user, 'teacher');
    });
  });
});
