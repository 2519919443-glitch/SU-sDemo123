// =============================================
//  页面：登录 & 注册 & 教师登录 & 管理员登录
// =============================================
Router.register('login', function(params) {
  var app = document.getElementById('page-login');
  if (!app) return;
  app.style.display = 'block';

  app.innerHTML = `
    <div style="padding:32px 20px;max-width:400px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:56px;margin-bottom:12px;">📚</div>
        <h1 style="font-size:24px;font-weight:700;color:var(--primary);margin-bottom:4px;">K12 学习助手</h1>
        <p style="font-size:13px;color:#888;">登录后开始你的学习之旅</p>
      </div>

      <div style="display:flex;margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid #eee;">
        <div class="auth-tab active" data-tab="login" style="flex:1;text-align:center;padding:10px;cursor:pointer;background:var(--primary);color:#fff;font-size:14px;font-weight:600;" id="tab-login">学生登录</div>
        <div class="auth-tab" data-tab="reg" style="flex:1;text-align:center;padding:10px;cursor:pointer;background:#f5f5f5;color:#666;font-size:14px;" id="tab-reg">注册</div>
        <div class="auth-tab" data-tab="teacher" style="flex:1;text-align:center;padding:10px;cursor:pointer;background:#f5f5f5;color:#666;font-size:14px;" id="tab-teacher">教师登录</div>
      </div>

      <!-- 学生登录表单 -->
      <div id="login-form">
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">用户名</label>
          <input id="login-user" type="text" placeholder="请输入用户名" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">密码</label>
          <input id="login-pass" type="password" placeholder="请输入密码" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <button id="btn-login" style="width:100%;padding:13px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">登 录</button>
      </div>

      <!-- 注册表单 -->
      <div id="reg-form" style="display:none;">
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">用户名</label>
          <input id="reg-user" type="text" placeholder="3-16位字母或数字" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">昵称</label>
          <input id="reg-nick" type="text" placeholder="你的昵称（可选）" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">密码</label>
          <input id="reg-pass" type="password" placeholder="不少于6位" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">确认密码</label>
          <input id="reg-pass2" type="password" placeholder="再次输入密码" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <button id="btn-reg" style="width:100%;padding:13px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">注 册</button>
      </div>

      <!-- 教师登录表单 -->
      <div id="teacher-form" style="display:none;">
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">教师账号</label>
          <input id="teacher-user" type="text" placeholder="请输入教师账号" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">密码</label>
          <input id="teacher-pass" type="password" placeholder="请输入密码" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">教授年级</label>
          <select id="teacher-grade" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
            <option value="1">一年级</option><option value="2">二年级</option>
            <option value="3">三年级</option><option value="4">四年级</option>
            <option value="5">五年级</option><option value="6">六年级</option>
            <option value="7">七年级</option><option value="8">八年级</option>
            <option value="9">九年级</option><option value="10">高一</option>
            <option value="11">高二</option><option value="12">高三</option>
          </select>
        </div>
        <button id="btn-teacher-login" style="width:100%;padding:13px;background:#7B1FA2;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">教师登录</button>
        <p style="font-size:12px;color:#999;margin-top:10px;text-align:center;">默认账号：teacher / 密码：123456</p>
        <div style="text-align:center;margin-top:12px;">
          <a href="#" onclick="showTeacherReg();return false;" style="font-size:12px;color:#7B1FA2;">没有教师账号？点击注册 →</a>
        </div>
      </div>

      <!-- 教师注册表单 -->
      <div id="teacher-reg-form" style="display:none;">
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">教师账号</label>
          <input id="treg-user" type="text" placeholder="3-16位字母或数字" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">昵称</label>
          <input id="treg-nick" type="text" placeholder="教师姓名（可选）" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">密码</label>
          <input id="treg-pass" type="password" placeholder="不少于6位" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">确认密码</label>
          <input id="treg-pass2" type="password" placeholder="再次输入密码" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">教授年级（可多选）</label>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="1" class="treg-grade"> 一年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="2" class="treg-grade"> 二年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="3" class="treg-grade"> 三年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="4" class="treg-grade"> 四年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="5" class="treg-grade"> 五年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="6" class="treg-grade"> 六年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="7" class="treg-grade"> 七年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="8" class="treg-grade"> 八年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="9" class="treg-grade"> 九年级</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="10" class="treg-grade"> 高一</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="11" class="treg-grade"> 高二</label>
            <label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" value="12" class="treg-grade"> 高三</label>
          </div>
        </div>
        <button id="btn-teacher-reg" style="width:100%;padding:13px;background:#7B1FA2;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">注册教师账号</button>
        <div style="text-align:center;margin-top:12px;">
          <a href="#" onclick="document.querySelectorAll('.auth-tab')[2].click();return false;" style="font-size:12px;color:#999;">已有账号？返回登录 ←</a>
        </div>
      </div>

      <!-- 管理员登录表单 -->
      <div id="admin-form" style="display:none;">
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">管理员账号</label>
          <input id="admin-user" type="text" placeholder="请输入管理员账号（默认：admin）" value="admin" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">密码</label>
          <input id="admin-pass" type="password" placeholder="请输入密码（默认：admin123）" style="width:100%;padding:11px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <button id="btn-admin-login" style="width:100%;padding:13px;background:#455A64;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;">管理员登录</button>
        <p style="font-size:12px;color:#999;margin-top:10px;text-align:center;">默认账号：admin / 密码：admin123</p>
        <div style="text-align:center;margin-top:12px;">
          <a href="#" onclick="Router.go('admin-login');return false;" style="font-size:12px;color:var(--primary);">或使用完整管理后台 →</a>
        </div>
      </div>

      <!-- 底部管理员入口 -->
      <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
        <a href="#" onclick="document.querySelectorAll('.auth-tab')[3].click();return false;" style="font-size:12px;color:#999;">系统管理员？点击这里登录</a>
      </div>
    </div>
  `;

  // Tab 切换
  document.querySelectorAll('.auth-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var t = this.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(function(el) {
        el.classList.remove('active');
        el.style.background = '#f5f5f5';
        el.style.color = '#666';
      });
      this.classList.add('active');
      if (t === 'teacher') {
        this.style.background = '#7B1FA2';
      } else if (t === 'admin') {
        this.style.background = '#455A64';
      } else {
        this.style.background = 'var(--primary)';
      }
      this.style.color = '#fff';
      document.getElementById('login-form').style.display = t === 'login' ? 'block' : 'none';
      document.getElementById('reg-form').style.display = t === 'reg' ? 'block' : 'none';
      document.getElementById('teacher-form').style.display = t === 'teacher' ? 'block' : 'none';
      document.getElementById('teacher-reg-form').style.display = 'none';
      document.getElementById('admin-form').style.display = t === 'admin' ? 'block' : 'none';
    });
  });

  // 添加管理员 Tab（动态插入）
  var tabBar = app.querySelector('.auth-tab').parentElement;
  if (tabBar && tabBar.children.length === 3) {
    var adminTab = document.createElement('div');
    adminTab.className = 'auth-tab';
    adminTab.dataset.tab = 'admin';
    adminTab.style.cssText = 'flex:1;text-align:center;padding:10px;cursor:pointer;background:#f5f5f5;color:#666;font-size:13px;';
    adminTab.textContent = '管理员';
    tabBar.appendChild(adminTab);
    // 重新绑定事件
    adminTab.addEventListener('click', function() {
      var t = this.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(function(el) {
        el.classList.remove('active');
        el.style.background = '#f5f5f5';
        el.style.color = '#666';
      });
      this.classList.add('active');
      this.style.background = '#455A64';
      this.style.color = '#fff';
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('reg-form').style.display = 'none';
      document.getElementById('teacher-form').style.display = 'none';
      document.getElementById('teacher-reg-form').style.display = 'none';
      document.getElementById('admin-form').style.display = 'block';
    });
  }

  // 学生登录
  document.getElementById('btn-login') && document.getElementById('btn-login').addEventListener('click', function() {
    var u = document.getElementById('login-user').value.trim();
    var p = document.getElementById('login-pass').value;
    if (!u || !p) return Utils.toast('请填写用户名和密码');
    var btn = this;
    btn.disabled = true;
    btn.textContent = '登录中...';
    Promise.resolve(App.login(u, p)).then(function(r) {
      if (r && r.ok) {
        Utils.toast('登录成功！');
        setTimeout(function() {
          if (!App.state.grade) Router.go('onboard');
          else Router.go('home');
        }, 500);
      } else {
        Utils.toast((r && r.msg) || '登录失败');
        btn.disabled = false;
        btn.textContent = '登 录';
      }
    }).catch(function(e) {
      Utils.toast('登录异常，请重试');
      btn.disabled = false;
      btn.textContent = '登 录';
    });
  });

  // 注册
  document.getElementById('btn-reg') && document.getElementById('btn-reg').addEventListener('click', function() {
    var u = document.getElementById('reg-user').value.trim();
    var n = document.getElementById('reg-nick').value.trim();
    var p = document.getElementById('reg-pass').value;
    var p2 = document.getElementById('reg-pass2').value;
    if (!u || u.length < 3) return Utils.toast('用户名不少于3位');
    if (!p || p.length < 6) return Utils.toast('密码不少于6位');
    if (p !== p2) return Utils.toast('两次密码不一致');
    var btn = this;
    btn.disabled = true;
    btn.textContent = '注册中...';
    Promise.resolve(App.register(u, p, n)).then(function(r) {
      if (r && r.ok) {
        Utils.toast('注册成功！请登录');
        document.getElementById('tab-login').click();
        document.getElementById('login-user').value = u;
      } else {
        Utils.toast((r && r.msg) || '注册失败');
      }
      btn.disabled = false;
      btn.textContent = '注 册';
    }).catch(function(e) {
      Utils.toast('注册异常，请重试');
      btn.disabled = false;
      btn.textContent = '注 册';
    });
  });

  // 教师登录
  document.getElementById('btn-teacher-login') && document.getElementById('btn-teacher-login').addEventListener('click', function() {
    var u = document.getElementById('teacher-user').value.trim();
    var p = document.getElementById('teacher-pass').value;
    var g = document.getElementById('teacher-grade').value;
    if (!u || !p) return Utils.toast('请填写教师账号和密码');
    var btn = this;
    btn.disabled = true;
    btn.textContent = '登录中...';
    Promise.resolve(App.teacherLogin(u, p, g)).then(function(r) {
      if (r && r.ok) {
        Utils.toast('教师登录成功！');
        setTimeout(function() { Router.go('teacher'); }, 500);
      } else {
        Utils.toast((r && r.msg) || '教师登录失败');
        btn.disabled = false;
        btn.textContent = '教师登录';
      }
    }).catch(function(e) {
      Utils.toast('教师登录异常，请重试');
      btn.disabled = false;
      btn.textContent = '教师登录';
    });
  });

  // 管理员登录（快捷登录）
  document.getElementById('btn-admin-login') && document.getElementById('btn-admin-login').addEventListener('click', function() {
    var u = document.getElementById('admin-user').value.trim();
    var p = document.getElementById('admin-pass').value;
    if (!u || !p) return Utils.toast('请填写管理员账号和密码');
    var r = Admin.login(u, p);
    if (r.ok) {
      Utils.toast('管理员登录成功！');
      setTimeout(function() { Router.go('admin'); }, 500);
    } else {
      Utils.toast(r.msg);
    }
  });

  // 回车登录
  ['login-pass','reg-pass2','teacher-pass','admin-pass'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        var btn = this.closest('div').querySelector('button');
        if (btn) btn.click();
      }
    });
  });

  // ===== 教师注册功能 =====
  // 显示教师注册表单
  window.showTeacherReg = function() {
    // 隐藏所有表单
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('reg-form').style.display = 'none';
    document.getElementById('teacher-form').style.display = 'none';
    document.getElementById('admin-form').style.display = 'none';
    // 显示教师注册表单
    var regForm = document.getElementById('teacher-reg-form');
    if (regForm) regForm.style.display = 'block';
    // 更新 Tab 样式（取消所有 active）
    document.querySelectorAll('.auth-tab').forEach(function(el) {
      el.classList.remove('active');
      el.style.background = '#f5f5f5';
      el.style.color = '#666';
    });
  };

  // 教师注册按钮
  var btnTeacherReg = document.getElementById('btn-teacher-reg');
  if (btnTeacherReg) btnTeacherReg.addEventListener('click', function() {
    var u = document.getElementById('treg-user').value.trim();
    var n = document.getElementById('treg-nick').value.trim();
    var p = document.getElementById('treg-pass').value;
    var p2 = document.getElementById('treg-pass2').value;
    // 获取选中的年级
    var grades = [];
    document.querySelectorAll('.treg-grade:checked').forEach(function(cb) {
      grades.push(cb.value);
    });

    if (!u || u.length < 3) return Utils.toast('账号不少于3位');
    if (!n) n = u; // 昵称默认用账号
    if (!p || p.length < 6) return Utils.toast('密码不少于6位');
    if (p !== p2) return Utils.toast('两次密码不一致');
    if (grades.length === 0) return Utils.toast('请至少选择一个教授年级');

    // 检查账号是否已存在
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    if (users[u]) return Utils.toast('该账号已存在');

    // 保存教师账号
    users[u] = {
      password: p,
      nick: n,
      isTeacher: true,
      teacherGrades: grades,
      joinDate: new Date().toISOString().slice(0, 10)
    };
    localStorage.setItem('xuexi_users', JSON.stringify(users));

    Utils.toast('教师注册成功！请登录');
    // 清空表单
    document.getElementById('treg-user').value = '';
    document.getElementById('treg-nick').value = '';
    document.getElementById('treg-pass').value = '';
    document.getElementById('treg-pass2').value = '';
    document.querySelectorAll('.treg-grade').forEach(function(cb) { cb.checked = false; });
    // 跳转到教师登录 Tab
    document.querySelectorAll('.auth-tab')[2].click();
  });
});
