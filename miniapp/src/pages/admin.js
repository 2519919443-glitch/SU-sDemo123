/**
 * admin.js - 管理后台（统一管理教师和学生数据）
 */

// 管理员对象
var Admin = {
  currentAdmin: null,

  login: function(username, password) {
    var users = this.getAllAdmins();
    if (!users[username] || users[username].password !== password) {
      return { ok: false, msg: '管理员账号或密码错误' };
    }
    localStorage.setItem('xuexi_admin', username);
    this.currentAdmin = username;
    return { ok: true };
  },

  logout: function() {
    localStorage.removeItem('xuexi_admin');
    this.currentAdmin = null;
    Router.go('login');
  },

  isLoggedIn: function() {
    return !!localStorage.getItem('xuexi_admin');
  },

  getAllAdmins: function() {
    return JSON.parse(localStorage.getItem('xuexi_admins') || '{"admin":{"password":"admin123","role":"admin"}}');
  },

  // 获取所有学生（包含解密后的密码）
  getAllStudents: function() {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    var students = [];
    for (var u in users) {
      if (!users[u].isTeacher) {
        var stu = Object.assign({ username: u }, users[u]);
        // 解密密码
        try {
          stu.decryptedPassword = Utils.decryptPassword(users[u].password);
        } catch(e) {
          stu.decryptedPassword = users[u].password; // 明文密码
        }
        // 统计做题数
        try {
          var rec = JSON.parse(localStorage.getItem('xuexi_quiz_' + u) || '[]');
          stu.totalQuiz = rec.length;
          stu.correctQuiz = 0;
          rec.forEach(function(r) { if (r.correct) stu.correctQuiz++; });
          stu.accuracy = rec.length > 0 ? Math.round(stu.correctQuiz / rec.length * 100) + '%' : '0%';
        } catch(e) { stu.totalQuiz = 0; stu.accuracy = '0%'; }
        // 打卡次数
        try {
          var checkin = JSON.parse(localStorage.getItem('xuexi_checkin_' + u) || '[]');
          stu.checkinCount = checkin.length;
        } catch(e) { stu.checkinCount = 0; }
        students.push(stu);
      }
    }
    return students;
  },

  // 获取所有教师（包含解密后的密码）
  getAllTeachers: function() {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    var teachers = [];
    for (var u in users) {
      if (users[u].isTeacher) {
        var t = Object.assign({ username: u }, users[u]);
        // 解密密码
        try {
          t.decryptedPassword = Utils.decryptPassword(users[u].password);
        } catch(e) {
          t.decryptedPassword = users[u].password; // 明文密码
        }
        teachers.push(t);
      }
    }
    return teachers;
  },

  // 获取系统统计
  getStats: function() {
    var students = this.getAllStudents();
    var teachers = this.getAllTeachers();
    var today = new Date().toISOString().slice(0, 10);
    var activeToday = 0;
    var totalQuiz = 0;
    students.forEach(function(s) {
      totalQuiz += s.totalQuiz || 0;
      // 检查今天是否活跃
      try {
        var rec = JSON.parse(localStorage.getItem('xuexi_quiz_' + s.username) || '[]');
        rec.forEach(function(r) {
          if (r.date && r.date.indexOf(today) === 0) activeToday++;
        });
      } catch(e){}
    });
    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      activeToday: activeToday,
      totalQuiz: totalQuiz
    };
  },

  // 获取用户的解密密码
  getDecryptedPassword: function(username) {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    if (!users[username]) return null;
    var encrypted = users[username].password;
    try {
      return Utils.decryptPassword(encrypted);
    } catch(e) {
      return encrypted; // 如果是旧明文密码，直接返回
    }
  },

  // 重置用户密码
  resetPassword: function(username, newPassword) {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    if (!users[username]) return { ok: false, msg: '用户不存在' };
    users[username].password = Utils.encryptPassword(newPassword);
    localStorage.setItem('xuexi_users', JSON.stringify(users));
    return { ok: true, msg: '密码已重置为：' + newPassword };
  },

  // 重置教师密码（教师也存储在 xuexi_users 中，isTeacher=true）
  resetTeacherPassword: function(username, newPassword) {
    return this.resetPassword(username, newPassword);
  }
};

// ============ 管理员登录页 ============
Router.register('admin-login', function(params) {
  if (Admin.isLoggedIn()) { Router.go('admin'); return; }

  var app = document.getElementById('page-admin');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-admin';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  app.innerHTML = '\
    <div style="padding:32px 20px;max-width:400px;margin:0 auto;">\
      <div style="text-align:center;margin-bottom:32px;">\
        <div style="font-size:56px;margin-bottom:12px;">🛠️</div>\
        <h1 style="font-size:24px;font-weight:700;color:var(--primary);margin-bottom:4px;">管理后台</h1>\
        <p style="font-size:13px;color:#888;">请输入管理员账号密码</p>\
      </div>\
      <div style="margin-bottom:14px;">\
        <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">管理员账号</label>\
        <input id="admin-user" type="text" placeholder="请输入管理员账号" value="admin" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">\
      </div>\
      <div style="margin-bottom:20px;">\
        <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">密码</label>\
        <input id="admin-pass" type="password" placeholder="请输入密码" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">\
      </div>\
      <button id="btn-admin-login" style="width:100%;padding:13px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">登 录</button>\
      <div style="text-align:center;margin-top:16px;">\
        <a href="#" onclick="Router.go(\'login\');return false;" style="font-size:13px;color:#888;">← 返回用户登录</a>\
      </div>\
    </div>\
  ';

  var btnLogin = document.getElementById('btn-admin-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', function() {
      var u = document.getElementById('admin-user').value.trim();
      var p = document.getElementById('admin-pass').value;
      if (!u || !p) return Utils.toast('请输入账号和密码');
      var r = Admin.login(u, p);
      if (r.ok) {
        Utils.toast('登录成功！');
        setTimeout(function() { Router.go('admin'); }, 500);
      } else {
        Utils.toast(r.msg);
      }
    });
  }

  // 回车登录
  var passInput = document.getElementById('admin-pass');
  if (passInput) {
    passInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && btnLogin) btnLogin.click();
    });
  }
});

// ============ 管理后台首页 ============
Router.register('admin', function(params) {
  console.log('[Admin] admin route triggered');
  if (!Admin.isLoggedIn()) { Router.go('admin-login'); return; }

  var app = document.getElementById('page-admin');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-admin';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var stats = Admin.getStats();
  console.log('[Admin] stats:', stats);

  var html = '\
    <div style="padding:20px 16px 80px;">\
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">\
        <div>\
          <h1 style="font-size:22px;font-weight:700;margin:0 0 2px 0;">管理后台</h1>\
          <p style="font-size:13px;color:#888;margin:0;">数据概览与用户管理</p>\
        </div>\
        <button id="btn-admin-logout" style="padding:7px 14px;background:#f5f5f5;color:#666;border:none;border-radius:8px;font-size:13px;cursor:pointer;">退出</button>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">\
        <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:28px;font-weight:700;color:var(--primary);">' + stats.totalStudents + '</div>\
          <div style="font-size:13px;color:#888;margin-top:2px;">总学生数</div>\
        </div>\
        <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:28px;font-weight:700;color:#1976D2;">' + stats.totalTeachers + '</div>\
          <div style="font-size:13px;color:#888;margin-top:2px;">总教师数</div>\
        </div>\
        <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:28px;font-weight:700;color:#43A047;">' + stats.activeToday + '</div>\
          <div style="font-size:13px;color:#888;margin-top:2px;">今日活跃</div>\
        </div>\
        <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:28px;font-weight:700;color:#FB8C00;">' + stats.totalQuiz + '</div>\
          <div style="font-size:13px;color:#888;margin-top:2px;">总做题数</div>\
        </div>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">\
        <div id="btn-admin-students" style="background:#fff;border-radius:14px;padding:18px 10px;text-align:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:32px;margin-bottom:6px;">👨🎓</div>\
          <div style="font-size:13px;font-weight:600;color:#333;">学生管理</div>\
        </div>\
        <div id="btn-admin-teachers" style="background:#fff;border-radius:14px;padding:18px 10px;text-align:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:32px;margin-bottom:6px;">👨🏫</div>\
          <div style="font-size:13px;font-weight:600;color:#333;">教师管理</div>\
        </div>\
        <div id="btn-admin-quiz" style="background:#fff;border-radius:14px;padding:18px 10px;text-align:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
          <div style="font-size:32px;margin-bottom:6px;">📝</div>\
          <div style="font-size:13px;font-weight:600;color:#333;">题库管理</div>\
        </div>\
      </div>\
      <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">\
        <div style="font-size:15px;font-weight:600;margin-bottom:12px;">📊 学生数据概览</div>\
        <div id="admin-student-overview">加载中...</div>\
      </div>\
    </div>\
  ';

  app.innerHTML = html;
  console.log('[Admin] page rendered');

  // 退出按钮
  var btnLogout = document.getElementById('btn-admin-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function() { Admin.logout(); });
  }

  // 功能入口
  var btnStudents = document.getElementById('btn-admin-students');
  if (btnStudents) {
    btnStudents.addEventListener('click', function() { Router.go('admin-students'); });
  }

  var btnTeachers = document.getElementById('btn-admin-teachers');
  if (btnTeachers) {
    btnTeachers.addEventListener('click', function() { Router.go('admin-teachers'); });
  }

  var btnQuiz = document.getElementById('btn-admin-quiz');
  if (btnQuiz) {
    btnQuiz.addEventListener('click', function() { Router.go('admin-quiz'); });
  }

  // 加载学生概览
  var students = Admin.getAllStudents();
  var overview = document.getElementById('admin-student-overview');
  if (overview) {
    if (students.length === 0) {
      overview.innerHTML = '<div style="text-align:center;color:#aaa;padding:20px;">暂无学生数据</div>';
    } else {
      var tableHtml = '<div style="overflow-x:auto;"><table style="width:100%;font-size:13px;border-collapse:collapse;">';
      tableHtml += '<tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">学生</th><th style="padding:8px;text-align:center;">年级</th><th style="padding:8px;text-align:center;">做题</th><th style="padding:8px;text-align:center;">正确率</th><th style="padding:8px;text-align:center;">打卡</th></tr>';
      students.slice(0, 10).forEach(function(s) {
        var gradeMap = { '1':'一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八','9':'九','10':'高一','11':'高二','12':'高三' };
        var gradeStr = gradeMap[s.grade] || s.grade || '-';
        var accNum = parseInt((s.accuracy||'0%').replace('%','')) || 0;
        var accColor = accNum > 60 ? '#43A047' : '#e74c3c';
        tableHtml += '<tr style="border-bottom:1px solid #f0f0f0;">';
        tableHtml += '<td style="padding:8px;font-weight:500;">' + (s.nick || s.username) + '</td>';
        tableHtml += '<td style="padding:8px;text-align:center;">' + gradeStr + '</td>';
        tableHtml += '<td style="padding:8px;text-align:center;">' + (s.totalQuiz || 0) + '</td>';
        tableHtml += '<td style="padding:8px;text-align:center;color:' + accColor + ';">' + (s.accuracy || '0%') + '</td>';
        tableHtml += '<td style="padding:8px;text-align:center;">' + (s.checkinCount || 0) + '</td>';
        tableHtml += '</tr>';
      });
      tableHtml += '</table></div>';
      if (students.length > 10) {
        tableHtml += '<div style="text-align:center;color:#888;font-size:12px;margin-top:8px;">仅显示前10条，<a href="#" onclick="Router.go(\'admin-students\');return false;" style="color:var(--primary);">查看全部</a></div>';
      }
      overview.innerHTML = tableHtml;
    }
  }
});
