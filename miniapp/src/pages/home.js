// =============================================
//  页面：首页
// =============================================
Router.register('home', function(params) {
  var app = document.getElementById('page-home');
  if (!app) return;
  app.style.display = 'block';
  var state = App.state;
  var grade = state.grade || '小学';
  var greeting = new Date().getHours() < 12 ? '早上好' : (new Date().getHours() < 18 ? '下午好' : '晚上好');

  // 检查今天是否已打卡
  var today = new Date().toISOString().slice(0, 10);
  var checkinData = [];
  try {
    checkinData = JSON.parse(localStorage.getItem('xuexi_checkin_' + state.username) || '[]');
  } catch(e) {}
  var checkedToday = checkinData.indexOf(today) !== -1;

  app.innerHTML = `
    <div style="background:linear-gradient(135deg,var(--primary),var(--accent));padding:24px 16px 20px;color:#fff;">
      <div style="font-size:13px;opacity:0.85;">${greeting}，${state.username||'同学'}</div>
      <div style="font-size:11px;opacity:0.7;margin-top:2px;">${grade} · ${state.level||''} · ${state.textbook||'人教版'}</div>
      <div style="display:flex;gap:10px;margin-top:16px;">
        <div style="flex:1;background:rgba(255,255,255,0.2);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;">${(state.streak||0)}</div>
          <div style="font-size:11px;opacity:0.85;">连续打卡</div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.2);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;">${(state.todayMinutes||0)}</div>
          <div style="font-size:11px;opacity:0.85;">今日分钟</div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.2);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:700;">0</div>
          <div style="font-size:11px;opacity:0.85;">待复习</div>
        </div>
      </div>
    </div>

    <div style="padding:16px;">
      <!-- 打卡按钮 -->
      <div id="checkin-btn" style="background:linear-gradient(135deg,${checkedToday?'#ccc':'#43A047'},${checkedToday?'#999':'#2E7D32'});color:#fff;padding:14px;text-align:center; border-radius:12px;margin-bottom:16px;cursor:${checkedToday?'default':'pointer'};box-shadow:0 4px 12px rgba(67,160,71,0.3);">
        <div style="font-size:20px;margin-bottom:4px;">${checkedToday ? '✅' : '📅'}</div>
        <div style="font-size:16px;font-weight:600;">${checkedToday ? '今日已打卡' : '立即打卡'}</div>
        <div style="font-size:12px;opacity:0.8;margin-top:2px;">累计打卡 ${checkinData.length} 天</div>
      </div>

      <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">快捷入口</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
        ${[
          ['📖','学习中心','knowledge'],['✏️','每日一练','quiz'],
          ['📋','错题本','analysis'],['🔧','学习工具','tools']
        ].map(function(item){
          return '<div onclick="Router.go(\''+item[2]+'\')" style="background:#fff;border-radius:12px;padding:14px 6px;text-align:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);"><div style="font-size:24px;margin-bottom:4px;">'+item[0]+'</div><div style="font-size:11px;color:#555;">'+item[1]+'</div></div>';
        }).join('')}
      </div>

      <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">今日学习任务</h3>
      <div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="font-size:20px;">📝</div>
          <div style="flex:1;"><div style="font-size:14px;font-weight:500;">每日一练</div><div style="font-size:12px;color:#888;">5道题 · 预计8分钟</div></div>
          <button onclick="Router.go('quiz')" style="padding:6px 14px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">去做</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-size:20px;">📖</div>
          <div style="flex:1;"><div style="font-size:14px;font-weight:500;">预习课文</div><div style="font-size:12px;color:#888;">${state.level||''} · 今日内容</div></div>
          <button onclick="Router.go('knowledge')" style="padding:6px 14px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">去学习</button>
        </div>
      </div>
    </div>
  `;
  renderTabbar('home');

  // 打卡按钮事件
  var checkinBtn = document.getElementById('checkin-btn');
  if (checkinBtn && !checkedToday) {
    checkinBtn.addEventListener('click', function() {
      var today = new Date().toISOString().slice(0, 10);
      var username = App.state.username;
      var checkinData = [];
      try {
        checkinData = JSON.parse(localStorage.getItem('xuexi_checkin_' + username) || '[]');
      } catch(e) {}
      if (checkinData.indexOf(today) === -1) {
        checkinData.push(today);
        localStorage.setItem('xuexi_checkin_' + username, JSON.stringify(checkinData));
        // 更新连续打卡天数
        App.state.streak = (App.state.streak || 0) + 1;
        App.saveState();
        Utils.alert('打卡成功！已连续打卡 ' + App.state.streak + ' 天', 'success');
        // 重新渲染首页
        setTimeout(function() { Router.go('home'); }, 1000);
      }
    });
  }
});
