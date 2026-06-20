// =============================================
//  页面：年级选择引导页（首次使用）
// =============================================
Router.register('onboard', function(params) {
  var app = document.getElementById('page-onboard');
  if (!app) return;
  app.style.display = 'block';
  app.innerHTML = '\n' +
    '<div style="padding:24px 16px;">\n' +
    '  <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">选择你的学段</h2>\n' +
    '  <p style="color:#888;font-size:13px;margin-bottom:24px;">帮助我们为你推荐合适的内容</p>\n' +
    '  <div id="ob-grades" style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px;"></div>\n' +
    '  <div id="ob-levels" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px;"></div>\n' +
    '  <div style="margin-bottom:20px;">\n' +
    '    <label style="font-size:14px;color:#666;">教材版本</label>\n' +
    '    <select id="ob-textbook" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:15px;">\n' +
    '      <option value="人教版">人教版</option>\n' +
    '      <option value="苏教版">苏教版</option>\n' +
    '      <option value="北师大版">北师大版</option>\n' +
    '      <option value="冀教版">冀教版</option>\n' +
    '      <option value="牛津版">牛津版</option>\n' +
    '    </select>\n' +
    '  </div>\n' +
    '  <button id="ob-start" style="width:100%;padding:14px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;">开始学习</button>\n' +
    '</div>';

  var grades = [
    { id:'小学', label:'小学', color:'#FF8C00', desc:'1-6年级' },
    { id:'初中', label:'初中', color:'#1976D2', desc:'7-9年级' },
    { id:'高中', label:'高中', color:'#455A64', desc:'高一至高三' },
  ];
  var levels = {
    '小学': ['一年级','二年级','三年级','四年级','五年级','六年级'],
    '初中': ['七年级','八年级','九年级'],
    '高中': ['高一','高二','高三'],
  };
  var selGrade = '小学';
  var selLevel = '一年级';

  function renderGrades() {
    var box = document.getElementById('ob-grades');
    box.innerHTML = '';
    grades.forEach(function(g) {
      var d = document.createElement('div');
      d.style.cssText = 'padding:16px;border-radius:12px;border:2px solid ' + (selGrade===g.id?'var(--primary)':'#eee') + ';background:' + (selGrade===g.id?'var(--primary-light)':'#fff') + ';cursor:pointer;display:flex;align-items:center;gap:12px;transition:0.2s;';
      d.innerHTML = '<div style="font-size:32px;">' + (g.id==='小学'?'🎒':g.id==='初中'?'📘':'🎓') + '</div><div><div style="font-size:16px;font-weight:600;">' + g.label + '</div><div style="font-size:12px;color:#888;">' + g.desc + '</div></div>';
      d.addEventListener('click', function() {
        selGrade = g.id;
        selLevel = levels[g.id][0];
        renderGrades();
        renderLevels();
      });
      box.appendChild(d);
    });
  }

  function renderLevels() {
    var box = document.getElementById('ob-levels');
    box.innerHTML = '';
    (levels[selGrade]||[]).forEach(function(lv) {
      var d = document.createElement('div');
      d.style.cssText = 'padding:8px 16px;border-radius:20px;font-size:14px;cursor:pointer;border:1.5px solid ' + (selLevel===lv?'var(--primary)':'#ddd') + ';background:' + (selLevel===lv?'var(--primary)':'#fff') + ';color:' + (selLevel===lv?'#fff':'#333') + ';';
      d.textContent = lv;
      d.addEventListener('click', function() { selLevel = lv; renderLevels(); });
      box.appendChild(d);
    });
  }

  renderGrades();
  renderLevels();

  // 将"一年级"等转换为数字年级 "1"-"12"
  function levelToGrade(lv) {
    var map = {'一年级':'1','二年级':'2','三年级':'3','四年级':'4','五年级':'5','六年级':'6','七年级':'7','八年级':'8','九年级':'9','高一':'10','高二':'11','高三':'12'};
    return map[lv] || '1';
  }

  document.getElementById('ob-start') && document.getElementById('ob-start').addEventListener('click', function() {
    App.state.grade = levelToGrade(selLevel);  // 存数字年级，用于题库过滤
    App.state.level = selLevel;                 // 存显示用（如"三年级"）
    App.state.gradeLabel = selGrade;            // 存学段标签（如"小学"）
    App.state.textbook = document.getElementById('ob-textbook').value;
    App.saveUser();
    App.applyTheme();
    Utils.toast('设置成功！');
    setTimeout(function() { Router.go('home'); }, 500);
  });
});
