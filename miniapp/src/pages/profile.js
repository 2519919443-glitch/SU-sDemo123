/**
 * profile.js - 个人中心（学生端，含修改密码）
 */
Router.register('profile', function(params) {
  if (!App.state.loggedIn) { Router.go('login'); return; }
  // 教师账号不显示此页面
  if (App.state.isTeacher) {
    Router.go('teacher');
    return;
  }

  var app = document.getElementById('page-profile');
  if (!app) {
    app = document.createElement('div');
    app.id = 'page-profile';
    app.className = 'page';
    document.getElementById('app').appendChild(app);
  }
  app.style.display = 'block';

  var gradeMap = { '1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级',
                   '7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三' };
  var gradeLabel = gradeMap[App.state.grade] || App.state.grade || '未设置';

  // 统计做题总数
  var totalDone = 0;
  try {
    var rec = JSON.parse(localStorage.getItem('xuexi_quiz_' + App.state.username) || '[]');
    totalDone = rec.length;
  } catch(e) {}

  // 统计打卡天数
  var checkinDays = 0;
  try {
    var checkin = JSON.parse(localStorage.getItem('xuexi_checkin_' + App.state.username) || '[]');
    checkinDays = checkin.length;
  } catch(e) {}

  var html = `
    <div style="padding:20px 16px 80px;">
      <!-- 用户信息卡片 -->
      <div style="background:linear-gradient(135deg, var(--primary), var(--accent));border-radius:16px;padding:24px 20px;color:#fff;margin-bottom:20px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:28px;">
            ${App.state.avatar || '🧑'}
          </div>
          <div>
            <div style="font-size:20px;font-weight:700;">${App.state.nick || App.state.username}</div>
            <div style="font-size:13px;opacity:0.85;margin-top:2px;">${gradeLabel} · ${App.state.level || ''}</div>
          </div>
        </div>
        <div style="font-size:13px;opacity:0.8;display:flex;gap:16px;">
          <span>学习天数：<b>${App.state.studyDays||0}</b> 天</span>
          <span>做题：<b>${totalDone}</b> 道</span>
          <span>打卡：<b>${checkinDays}</b> 天</span>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div style="background:#fff;border-radius:14px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div id="btn-change-pwd" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:15px;">🔒 修改密码</span>
          <span style="color:#aaa;font-size:14px;">›</span>
        </div>
        <div id="btn-switch-grade" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:15px;">🎯 切换年级</span>
          <span style="color:#aaa;font-size:14px;">›</span>
        </div>
        <div id="btn-clear" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
          <span style="font-size:15px;">🗑️ 清除数据</span>
          <span style="color:#aaa;font-size:14px;">›</span>
        </div>
      </div>

      <!-- 显示设置 -->
      <div style="background:#fff;border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size:14px;color:#888;margin-bottom:12px;font-weight:600;">显示设置</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <span style="font-size:15px;">👁️ 护眼模式</span>
          <label style="position:relative;display:inline-block;width:44px;height:24px;">
            <input type="checkbox" id="toggle-eye" ${App.state.eyeProtect?'checked':''} style="opacity:0;width:0;height:0;">
            <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;border-radius:24px;transition:.3s;"></span>
            <span style="position:absolute;content:'';height:18px;width:18px;left:3px;bottom:3px;background-color:white;border-radius:50%;transition:.3s;${App.state.eyeProtect?'transform:translateX(20px);':''}"></span>
          </label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:15px;">🔤 字体大小</span>
          <div style="display:flex;gap:8px;">
            <button id="btn-font-small" style="padding:5px 12px;border-radius:8px;font-size:13px;border:1.5px solid ${App.state.fontSize==='small'?'var(--primary)':'#ddd'};background:${App.state.fontSize==='small'?'var(--primary)':'#fff'};color:${App.state.fontSize==='small'?'#fff':'#333'};cursor:pointer;">小</button>
            <button id="btn-font-normal" style="padding:5px 12px;border-radius:8px;font-size:13px;border:1.5px solid ${!App.state.fontSize||App.state.fontSize==='normal'?'var(--primary)':'#ddd'};background:${!App.state.fontSize||App.state.fontSize==='normal'?'var(--primary)':'#fff'};color:${!App.state.fontSize||App.state.fontSize==='normal'?'#fff':'#333'};cursor:pointer;">标准</button>
            <button id="btn-font-large" style="padding:5px 12px;border-radius:8px;font-size:13px;border:1.5px solid ${App.state.fontSize==='large'?'var(--primary)':'#ddd'};background:${App.state.fontSize==='large'?'var(--primary)':'#fff'};color:${App.state.fontSize==='large'?'#fff':'#333'};cursor:pointer;">大</button>
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <button id="btn-logout" style="width:100%;padding:13px;background:#fff;color:#e74c3c;border:1.5px solid #e74c3c;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.06);">退出登录</button>
    </div>

    <!-- 修改密码弹窗 -->
    <div id="change-pwd-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:16px;width:90%;max-width:360px;padding:24px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <div style="font-size:18px;font-weight:700;margin-bottom:16px;text-align:center;">修改密码</div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">原密码</label>
          <input id="old-pwd" type="password" placeholder="请输入原密码" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">新密码</label>
          <input id="new-pwd" type="password" placeholder="不少于6位" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:13px;color:#666;display:block;margin-bottom:4px;">确认新密码</label>
          <input id="new-pwd2" type="password" placeholder="再次输入新密码" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:9px;font-size:15px;box-sizing:border-box;">
        </div>
        <div id="pwd-error" style="color:#e74c3c;font-size:13px;margin-bottom:10px;display:none;"></div>
        <div style="display:flex;gap:12px;">
          <button id="cancel-pwd" style="flex:1;padding:11px;background:#f5f5f5;color:#666;border:none;border-radius:10px;font-size:15px;cursor:pointer;">取消</button>
          <button id="confirm-pwd" style="flex:1;padding:11px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">确认</button>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = html;

  // ===== 事件绑定 =====

  // 护眼模式
  var toggleEye = document.getElementById('toggle-eye');
  if (toggleEye) {
    toggleEye.addEventListener('change', function() {
      App.state.eyeProtect = this.checked;
      App.saveUser();
      App.applyTheme();
      // 更新开关样式
      var spans = this.parentElement.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[2].style.transform = this.checked ? 'translateX(20px)' : '';
      }
    });
  }

  // 字体大小
  ['small','normal','large'].forEach(function(size) {
    var btn = document.getElementById('btn-font-' + size);
    if (btn) btn.addEventListener('click', function() {
      App.state.fontSize = size;
      App.saveUser();
      App.applyFontSize();
      Router.refresh();
    });
  });

  // 切换年级
  var btnSwitch = document.getElementById('btn-switch-grade');
  if (btnSwitch) btnSwitch.addEventListener('click', function() { Router.go('onboard'); });

  // 清除数据
  var btnClear = document.getElementById('btn-clear');
  if (btnClear) btnClear.addEventListener('click', function() {
    if (confirm('确定要清除所有学习数据吗？此操作不可恢复！')) {
      localStorage.removeItem('xuexi_quiz_' + App.state.username);
      localStorage.removeItem('xuexi_checkin_' + App.state.username);
      localStorage.removeItem('xuexi_notes_' + App.state.username);
      App.state.studyDays = 0;
      App.saveUser();
      Utils.toast('数据已清除');
      Router.refresh();
    }
  });

  // 退出登录
  var btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', function() { App.logout(); });

  // ===== 修改密码功能 =====
  var btnChangePwd = document.getElementById('btn-change-pwd');
  var modal = document.getElementById('change-pwd-modal');

  if (btnChangePwd && modal) {
    // 打开弹窗
    btnChangePwd.addEventListener('click', function() {
      modal.style.display = 'flex';
      var oldPwd = document.getElementById('old-pwd');
      var newPwd = document.getElementById('new-pwd');
      var newPwd2 = document.getElementById('new-pwd2');
      var pwdError = document.getElementById('pwd-error');
      if (oldPwd) oldPwd.value = '';
      if (newPwd) newPwd.value = '';
      if (newPwd2) newPwd2.value = '';
      if (pwdError) pwdError.style.display = 'none';
    });

    // 关闭弹窗
    var cancelBtn = document.getElementById('cancel-pwd');
    if (cancelBtn) cancelBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });

    // 点击背景关闭
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.style.display = 'none';
    });

    // 确认修改密码
    var confirmBtn = document.getElementById('confirm-pwd');
    if (confirmBtn) confirmBtn.addEventListener('click', function() {
      var oldPwd = document.getElementById('old-pwd');
      var newPwd = document.getElementById('new-pwd');
      var newPwd2 = document.getElementById('new-pwd2');
      var pwdError = document.getElementById('pwd-error');

      var oldVal = oldPwd ? oldPwd.value : '';
      var newVal = newPwd ? newPwd.value : '';
      var newVal2 = newPwd2 ? newPwd2.value : '';

      // 验证
      if (!oldVal) { pwdError.textContent = '请输入原密码'; pwdError.style.display = 'block'; return; }
      if (!newVal || newVal.length < 6) { pwdError.textContent = '新密码不少于6位'; pwdError.style.display = 'block'; return; }
      if (newVal !== newVal2) { pwdError.textContent = '两次新密码不一致'; pwdError.style.display = 'block'; return; }

      // 验证原密码
      var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
      if (!users[App.state.username] || users[App.state.username].password !== oldVal) {
        pwdError.textContent = '原密码错误';
        pwdError.style.display = 'block';
        return;
      }

      // 修改密码
      users[App.state.username].password = newVal;
      localStorage.setItem('xuexi_users', JSON.stringify(users));
      App.saveUser();
      Utils.toast('密码修改成功！');
      modal.style.display = 'none';
    });
  }
});
