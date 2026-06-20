// tools_v2.js - 学习工具页面（修复版）
// 功能：1. 古诗按年级分类展示，完整显示
//        2. 成语词典添加搜索功能

Router.register('tools', function(params) {
  var app = document.getElementById('page-tools');
  if (!app) return;
  app.style.display = 'block';

  var state = {
    currentTool: '',
    detail: null,
    mathState: null,
    convType: null,
    noteEditing: null,
    // 古诗状态
    poemGrade: App.state.grade || '1',
    poemSearch: '',
    // 成语状态
    idiomSearch: '',
    idiomResults: null
  };

  function render() {
    if (!state.currentTool) renderMainMenu();
    else if (state.currentTool === 'poems') renderPoems();
    else if (state.currentTool === 'words') renderWords();
    else if (state.currentTool === 'formulas') renderFormulas();
    else if (state.currentTool === 'idioms') renderIdioms();
    else if (state.currentTool === 'math') renderMathQuiz();
    else if (state.currentTool === 'convert') renderConvert();
    else if (state.currentTool === 'countdown') renderCountdown();
    else if (state.currentTool === 'notes') renderNotes();
  }

  // ============ 主菜单 ============
  function renderMainMenu() {
    var grade = (App.state.grade||'3');
    var g = parseInt(grade)||3;
    var tools = [
      { id:'poems',    icon:'📜', name:'古诗文大全', desc:'按年级分类', show:true },
      { id:'words',     icon:'📕', name:'单词背诵',   desc:'同步课本词库', show:true },
      { id:'formulas',  icon:'📐', name:'公式大全',   desc:'数理化公式汇总', show:g>=5 },
      { id:'idioms',   icon:'📒', name:'成语词典',   desc:'搜索释义', show:g<=9 },
      { id:'math',      icon:'🔢', name:'口算练习',   desc:'每日口算训练', show:g<=6 },
      { id:'convert',   icon:'🔄', name:'单位换算',   desc:'长度面积体积', show:true },
      { id:'countdown', icon:'⏰', name:'考试倒计时', desc:'中考/高考倒计时', show:g>=7 },
      { id:'notes',     icon:'📝', name:'知识备忘录', desc:'学习笔记记录', show:true },
    ].filter(function(t){return t.show;});

    var html = '<div style="padding:16px;">';
    html += '<h2 style="font-size:18px;font-weight:700;margin-bottom:4px;">学习工具</h2>';
    html += '<p style="font-size:13px;color:#888;margin-bottom:18px;">常用学习辅助工具</p>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
    tools.forEach(function(t) {
      html += '<div data-tool="'+t.id+'" style="background:#fff;border-radius:14px;padding:16px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);transition:0.2s;">';
      html += '<div style="font-size:28px;margin-bottom:8px;">'+t.icon+'</div>';
      html += '<div style="font-size:14px;font-weight:600;margin-bottom:2px;">'+t.name+'</div>';
      html += '<div style="font-size:11px;color:#999;">'+t.desc+'</div>';
      html += '</div>';
    });
    html += '</div></div>';
    app.innerHTML = html;

    app.querySelectorAll('[data-tool]').forEach(function(card) {
      card.addEventListener('click', function() {
        state.currentTool = this.dataset.tool;
        state.detail = null;
        render();
      });
    });
    renderTabbar('tools');
  }

  // ============ 1. 古诗文大全（按年级分类） ============
  function getPoemsByGrade(grade) {
    var poems = (window.AppData&&AppData.poems)||[];
    if (!grade || grade === 'all') return poems;
    return poems.filter(function(p) {
      // 检查tags中是否有对应年级
      if (p.tags && p.tags.some(function(t) { return t.indexOf(grade) >= 0; })) return true;
      // 检查grade字段
      if (p.grade === grade) return true;
      return false;
    });
  }

  function renderPoems() {
    var allPoems = (window.AppData&&AppData.poems)||[];
    var gradeMap = { '1':'一年级','2':'二年级','3':'三年级','4':'四年级','5':'五年级','6':'六年级',
                     '7':'七年级','8':'八年级','9':'九年级','10':'高一','11':'高二','12':'高三' };

    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">古诗文大全</h2></div>';

    // 年级选择器
    html += '<div style="margin-bottom:16px;overflow-x:auto;white-space:nowrap;">';
    html += '<div data-grade="all" class="grade-tab" style="display:inline-block;padding:6px 12px;margin-right:6px;border-radius:16px;font-size:13px;cursor:pointer;border:1.5px solid '+(state.poemGrade==='all'?'var(--primary)':'#ddd')+';background:'+(state.poemGrade==='all'?'var(--primary)':'#fff')+';color:'+(state.poemGrade==='all'?'#fff':'#333')+';">全部</div>';
    for (var g = 1; g <= 12; g++) {
      var gstr = g+'';
      var isActive = state.poemGrade === gstr;
      html += '<div data-grade="'+gstr+'" class="grade-tab" style="display:inline-block;padding:6px 10px;margin-right:4px;border-radius:16px;font-size:12px;cursor:pointer;border:1.5px solid '+(isActive?'var(--primary)':'#ddd')+';background:'+(isActive?'var(--primary)':'#fff')+';color:'+(isActive?'#fff':'#333')+';">'+gradeMap[gstr]+'</div>';
    }
    html += '</div>';

    var filteredPoems = getPoemsByGrade(state.poemGrade);

    if (filteredPoems.length === 0) {
      html += '<div style="text-align:center;padding:40px 0;color:#999;">该年级暂无古诗数据<br><small style="color:#aaa;">请在 data.js 中补充完整古诗</small></div>';
    } else {
      html += '<div style="font-size:13px;color:#888;margin-bottom:12px;">共 '+filteredPoems.length+' 首古诗</div>';
      html += '<div style="display:flex;flex-direction:column;gap:12px;">';
      filteredPoems.forEach(function(p, i) {
        var idx = allPoems.indexOf(p);
        html += '<div data-idx="'+idx+'" class="poem-card" style="background:#fff;border-radius:12px;padding:16px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);transition:0.2s;">';
        html += '<div style="font-size:16px;font-weight:600;color:var(--primary);margin-bottom:4px;">'+p.title+'</div>';
        html += '<div style="font-size:12px;color:#888;margin-bottom:6px;">'+p.dynasty+' · '+p.author+'</div>';
        // 显示完整诗文（限制行数）
        var lines = p.content.split('\n');
        var preview = lines.slice(0, 2).join('<br>');
        if (lines.length > 2) preview += '<br>...';
        html += '<div style="font-size:13px;color:#555;line-height:1.8;">'+preview+'</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    app.innerHTML = html;

    document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; render(); });

    app.querySelectorAll('.grade-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        state.poemGrade = this.dataset.grade;
        render();
      });
    });

    app.querySelectorAll('.poem-card').forEach(function(card) {
      card.addEventListener('click', function() {
        state.detail = allPoems[parseInt(this.dataset.idx)];
        renderPoemDetail();
      });
    });
  }

  function renderPoemDetail() {
    var p = state.detail;
    if (!p) { state.currentTool='poems'; render(); return; }
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="font-size:20px;cursor:pointer;" id="pd-back">←</div><h2 style="font-size:17px;font-weight:700;">古诗文详情</h2></div>';
    html += '<div style="background:#fff;border-radius:14px;padding:24px;box-shadow:0 1px 6px rgba(0,0,0,0.06);">';

    // 标题
    html += '<div style="text-align:center;margin-bottom:20px;">';
    html += '<div style="font-size:24px;font-weight:700;color:var(--primary);margin-bottom:8px;">'+p.title+'</div>';
    html += '<div style="font-size:14px;color:#888;">'+p.dynasty+' · '+p.author+'</div>';
    html += '</div>';

    // 完整诗文（重要：显示完整内容）
    html += '<div style="font-size:16px;line-height:2.2;text-align:center;margin-bottom:24px;color:#333;padding:16px;background:var(--primary-light);border-radius:10px;">';
    html += p.content.replace(/\n/g,'<br>');
    html += '</div>';

    // 译文
    if (p.translation) {
      html += '<div style="background:#f0f7ff;border-radius:10px;padding:16px;margin-bottom:14px;">';
      html += '<div style="font-size:13px;color:#1976D2;font-weight:600;margin-bottom:8px;">📖 译文</div>';
      html += '<div style="font-size:14px;color:#333;line-height:1.8;">'+p.translation+'</div>';
      html += '</div>';
    }

    // 赏析
    if (p.appreciation) {
      html += '<div style="background:#f5f5f5;border-radius:10px;padding:16px;">';
      html += '<div style="font-size:13px;color:#666;font-weight:600;margin-bottom:8px;">💡 赏析</div>';
      html += '<div style="font-size:14px;color:#555;line-height:1.8;">'+p.appreciation+'</div>';
      html += '</div>';
    }

    html += '</div></div>';
    app.innerHTML = html;
    document.getElementById('pd-back').addEventListener('click', function() { renderPoems(); });
  }

  // ============ 2. 单词背诵 ============
  function renderWords() {
    var words = (window.AppData&&AppData.words)||[];
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">单词背诵</h2></div>';
    if (words.length === 0) {
      html += '<div style="text-align:center;padding:40px 0;color:#999;">暂无单词数据</div>';
    } else {
      html += '<div style="font-size:13px;color:#888;margin-bottom:12px;">点击卡片查看/隐藏释义</div>';
      html += '<div style="display:flex;flex-direction:column;gap:10px;">';
      words.forEach(function(w, i) {
        html += '<div data-idx="'+i+'" class="word-card" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;">';
        html += '<div style="font-size:16px;font-weight:600;color:var(--primary);">'+w.word+'</div>';
        html += '<div style="font-size:12px;color:#aaa;">查看释义 ▼</div>';
        html += '</div>';
        html += '<div class="word-meaning" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid #f0f0f0;font-size:13px;color:#555;line-height:1.6;">';
        if (w.phonetic) html += '<div style="color:var(--primary);margin-bottom:4px;">'+w.phonetic+'</div>';
        html += '<div>'+w.meaning+'</div>';
        if (w.example) html += '<div style="color:#888;margin-top:6px;font-size:12px;">📌 例句：'+w.example+'</div>';
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    app.innerHTML = html;
    document.getElementById('tools-back') && document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; render(); });
    app.querySelectorAll('.word-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var meaning = this.querySelector('.word-meaning');
        if (meaning.style.display === 'none') meaning.style.display = 'block';
        else meaning.style.display = 'none';
      });
    });
  }

  // ============ 3. 公式大全 ============
  function renderFormulas() {
    var formulas = (window.AppData&&AppData.formulas)||[];
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">公式大全</h2></div>';
    if (formulas.length === 0) {
      html += '<div style="text-align:center;padding:40px 0;color:#999;">暂无公式数据</div>';
    } else {
      var groups = {};
      formulas.forEach(function(f) {
        var s = f.subject||'通用';
        if (!groups[s]) groups[s] = [];
        groups[s].push(f);
      });
      for (var sub in groups) {
        html += '<div style="font-size:14px;font-weight:600;color:var(--primary);margin:16px 0 8px;">'+sub+'</div>';
        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        groups[sub].forEach(function(f) {
          html += '<div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
          html += '<div style="font-size:15px;font-weight:600;">'+f.name+'</div>';
          html += '<div style="font-size:18px;font-weight:700;color:var(--primary);margin:8px 0;font-family:serif;">'+f.formula+'</div>';
          if (f.note) html += '<div style="font-size:12px;color:#888;">'+f.note+'</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    }
    html += '</div>';
    app.innerHTML = html;
    document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; render(); });
  }

  // ============ 4. 成语词典（带搜索功能）============
  function renderIdioms() {
    var idioms = (window.AppData&&AppData.idioms)||[];
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">成语词典</h2></div>';

    // 搜索框
    html += '<div style="margin-bottom:16px;">';
    html += '<input id="idiom-search" type="text" placeholder="🔍 输入成语或字词搜索..." value="'+state.idiomSearch+'" style="width:100%;padding:12px 14px;border:2px solid var(--primary);border-radius:10px;font-size:15px;box-sizing:border-box;">';
    html += '</div>';

    // 搜索提示
    if (state.idiomSearch) {
      var kw = state.idiomSearch.trim();
      var results = [];
      if (kw.length > 0) {
        // 精确匹配成语
        var exactMatch = idioms.find(function(idm) { return idm.word === kw; });
        if (exactMatch) {
          results = [exactMatch];
        } else {
          // 模糊匹配：包含输入字符的成语
          results = idioms.filter(function(idm) {
            return idm.word.indexOf(kw) >= 0;
          });
        }
      } else {
        results = idioms;
      }

      if (results.length === 0) {
        html += '<div style="text-align:center;padding:30px 0;color:#999;">未找到相关成语<br><small style="color:#aaa;">请尝试其他关键词</small></div>';
      } else {
        html += '<div style="font-size:13px;color:#888;margin-bottom:10px;">找到 '+results.length+' 个相关成语</div>';
        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        results.forEach(function(idm) {
          html += '<div data-word="'+idm.word.replace(/"/g,'&quot;')+'" class="idm-card" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
          html += '<div style="font-size:16px;font-weight:600;color:var(--primary);">'+highlightText(idm.word, kw)+'</div>';
          html += '<div style="font-size:13px;color:#555;margin-top:4px;">'+((idm.explanation||idm.meaning||'').substring(0, 40))+'...</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    } else {
      // 未搜索时显示热门成语
      html += '<div style="font-size:13px;color:#888;margin-bottom:10px;">热门成语（输入关键词搜索）</div>';
      var hotIdioms = idioms.slice(0, 20);
      html += '<div style="display:flex;flex-direction:column;gap:10px;">';
      hotIdioms.forEach(function(idm) {
        html += '<div data-word="'+idm.word.replace(/"/g,'&quot;')+'" class="idm-card" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
        html += '<div style="font-size:16px;font-weight:600;color:var(--primary);">'+idm.word+'</div>';
        html += '<div style="font-size:13px;color:#555;margin-top:4px;">'+((idm.explanation||idm.meaning||'').substring(0, 40))+'...</div>';
        html += '</div>';
      });
      html += '</div>';
      if (idioms.length > 20) {
        html += '<div style="text-align:center;color:#aaa;font-size:12px;margin-top:12px;">...还有 '+(idioms.length-20)+' 个成语，请输入关键词搜索</div>';
      }
    }

    html += '</div>';
    app.innerHTML = html;

    // 搜索框事件
    var searchInput = document.getElementById('idiom-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.addEventListener('input', function() {
        state.idiomSearch = this.value;
        render();
      });
    }

    document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; render(); });

    // 成语卡片点击
    app.querySelectorAll('.idm-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var word = this.dataset.word;
        var idm = idioms.find(function(i) { return i.word === word; });
        if (idm) {
          state.detail = idm;
          renderIdiomDetail();
        }
      });
    });
  }

  // 高亮搜索关键词
  function highlightText(text, keyword) {
    if (!keyword) return text;
    return text.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<span style="background:#FFEB3B;padding:0 2px;border-radius:2px;">$&</span>');
  }

  function renderIdiomDetail() {
    var idm = state.detail;
    if (!idm) { state.currentTool='idioms'; render(); return; }
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="font-size:20px;cursor:pointer;" id="idm-back">←</div><h2 style="font-size:17px;font-weight:700;">成语详情</h2></div>';
    html += '<div style="background:#fff;border-radius:14px;padding:24px;box-shadow:0 1px 6px rgba(0,0,0,0.06);">';

    // 成语标题
    html += '<div style="font-size:28px;font-weight:700;color:var(--primary);text-align:center;margin-bottom:16px;">'+idm.word+'</div>';

    // 释义
    var meaning = idm.explanation || idm.meaning || '暂无释义';
    html += '<div style="background:var(--primary-light);border-radius:10px;padding:16px;margin-bottom:14px;">';
    html += '<div style="font-size:13px;font-weight:600;color:var(--primary);margin-bottom:8px;">📖 释义</div>';
    html += '<div style="font-size:15px;color:#333;line-height:1.8;">'+meaning+'</div>';
    html += '</div>';

    // 出处
    if (idm.source) {
      html += '<div style="background:#f5f5f5;border-radius:10px;padding:14px;margin-bottom:14px;">';
      html += '<div style="font-size:13px;font-weight:600;color:#666;margin-bottom:6px;">📚 出处</div>';
      html += '<div style="font-size:14px;color:#555;">'+idm.source+'</div>';
      html += '</div>';
    }

    // 例句
    if (idm.example) {
      html += '<div style="background:#f0f7ff;border-radius:10px;padding:14px;">';
      html += '<div style="font-size:13px;font-weight:600;color:#1976D2;margin-bottom:6px;">✏️ 例句</div>';
      html += '<div style="font-size:14px;color:#333;line-height:1.8;">'+idm.example+'</div>';
      html += '</div>';
    }

    html += '</div></div>';
    app.innerHTML = html;
    document.getElementById('idm-back').addEventListener('click', function() { renderIdioms(); });
  }

  // ============ 5. 口算练习 ============
  function renderMathQuiz() {
    if (!state.mathState) {
      state.mathState = { questions:[], current:0, score:0, total:10, finished:false, answered:false };
      for (var i=0; i<10; i++) {
        var a = Math.floor(Math.random()*50)+1;
        var b = Math.floor(Math.random()*50)+1;
        var op = ['+','-','*'][Math.floor(Math.random()*3)];
        var ans;
        if (op==='+') ans = a+b;
        else if (op==='-') { if (a<b){var t=a;a=b;b=t;} ans=a-b; }
        else ans=a*b;
        state.mathState.questions.push({ q: a+' '+op+' '+b, answer: ans });
      }
    }
    var ms = state.mathState;

    if (ms.finished) {
      var html = '<div style="padding:16px;">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">口算练习</h2></div>';
      html += '<div style="text-align:center;padding:30px 0;">';
      html += '<div style="font-size:50px;margin-bottom:12px;">🎉</div>';
      html += '<div style="font-size:32px;font-weight:800;color:var(--primary);">'+ms.score+'/'+ms.total+'</div>';
      html += '<div style="font-size:14px;color:#888;margin-top:8px;">正确率 '+Math.round(ms.score/ms.total*100)+'%</div>';
      html += '<button id="math-retry" style="margin-top:20px;padding:12px 30px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">再来一次</button>';
      html += '</div></div>';
      app.innerHTML = html;
      document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; state.mathState=null; render(); });
      document.getElementById('math-retry').addEventListener('click', function() { state.mathState=null; render(); });
      return;
    }

    var q = ms.questions[ms.current];
    var opts = [q.answer];
    while (opts.length < 4) {
      var fake = q.answer + (Math.floor(Math.random()*21)-10);
      if (fake < 0) fake = q.answer + Math.abs(Math.floor(Math.random()*10)+1);
      if (opts.indexOf(fake) === -1) opts.push(fake);
    }
    opts.sort(function(){return Math.random()-0.5;});

    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">口算练习</h2></div>';
    html += '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06);">';
    html += '<div style="display:flex;justify-content:space-between;font-size:13px;color:#888;margin-bottom:12px;"><span>第 '+(ms.current+1)+'/'+ms.total+' 题</span><span>正确：'+ms.score+'</span></div>';
    html += '<div s.commit;border-radius:10px;font-size:15px;cursor:pointer;">搜索</button>';
    html += '<div id="conv-result" style="margin-top:16px;text-align:center;font-size:18px;font-weight:600;color:var(--primary);display:none;"></div>';
    html += '</div></div>';
    app.innerHTML = html;
    document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; state.convType=null; render(); });
    app.querySelectorAll('.conv-type').forEach(function(el) {
      el.addEventListener('click', function() { state.convType = this.dataset.type; render(); });
    });
    document.getElementById('conv-calc').addEventListener('click', function() {
      var val = parseFloat(document.getElementById('conv-val').value);
      var from = parseFloat(document.getElementById('conv-from').value);
      var to = parseFloat(document.getElementById('conv-to').value);
      if (isNaN(val)) { Utils.toast('请输入数值'); return; }
      var result = val * from / to;
      var toName = document.getElementById('conv-to').selectedOptions[0].text;
      var fromName = document.getElementById('conv-from').selectedOptions[0].text;
      var resultDiv = document.getElementById('conv-result');
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = val + ' ' + fromName + ' = <span style="color:var(--primary);">' + result + '</span> ' + toName;
    });
  }

  // ============ 7. 考试倒计时 ============
  function renderCountdown() {
    var now = new Date();
    var grade = parseInt(App.state.grade)||3;
    var targetName = grade <= 9 ? '中考' : '高考';
    var targetYear = grade <= 9 ? (2026 + (9 - grade)) : (2026 + (12 - grade));
    if (now.getMonth() >= 5 && now.getDate() > 7) targetYear++;
    var target = new Date(targetYear, 5, 7);
    var diff = Math.ceil((target - now) / (1000*60*60*24));

    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;">考试倒计时</h2></div>';
    html += '<div style="background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:14px;padding:24px;color:#fff;text-align:center;margin-bottom:20px;">';
    html += '<div style="font-size:14px;opacity:0.85;margin-bottom:8px;">距离'+targetName+'（'+targetYear+'年6月7日）</div>';
    html += '<div style="font-size:60px;font-weight:800;">'+diff+'</div>';
    html += '<div style="font-size:14px;opacity:0.85;">天</div>';
    html += '</div>';
    html += '<div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
    html += '<div style="font-size:15px;font-weight:600;margin-bottom:12px;">备考建议</div>';
    var tips = grade <= 9
      ? ['制定每日学习计划，保证各科均衡复习','整理错题本，定期回顾易错知识点','多做历年真题，熟悉考试题型和难度','保证充足睡眠，考试前调整作息时间']
      : ['梳理知识框架，形成系统化知识体系','重点突破薄弱科目，合理分配时间','关注时事热点（文科），整理错题（理科）','保持良好心态，适当放松减压'];
    tips.forEach(function(tip) {
      html += '<div style="display:flex;gap:8px;margin-bottom:8px;"><span style="color:var(--primary);">●</span><span style="font-size:13px;color:#555;">'+tip+'</span></div>';
    });
    html += '</div></div>';
    app.innerHTML = html;
    document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; render(); });
  }

  // ============ 8. 知识备忘录 ============
  function renderNotes() {
    var notesKey = 'xuexi_notes_' + (App.state.username||'guest');
    var notes = [];
    try { notes = JSON.parse(localStorage.getItem(notesKey)) || []; } catch(e) {}

    if (state.noteEditing === null) {
      var html = '<div style="padding:16px;">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="tools-back">←</div><h2 style="font-size:17px;font-weight:700;flex:1;">知识备忘录</h2><div id="add-note" style="font-size:24px;cursor:pointer;color:var(--primary);">＋</div></div>';
      if (notes.length === 0) {
        html += '<div style="text-align:center;padding:40px 0;color:#999;">暂无笔记，点击＋创建</div>';
      } else {
        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        notes.forEach(function(n, i) {
          html += '<div data-idx="'+i+'" class="note-card" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
          html += '<div style="font-size:15px;font-weight:600;margin-bottom:4px;">'+n.title+'</div>';
          html += '<div style="font-size:12px;color:#888;">'+n.time+'</div>';
          html += '<div style="font-size:13px;color:#666;margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+n.content.substring(0,50)+'</div>';
          html += '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
      app.innerHTML = html;
      document.getElementById('tools-back').addEventListener('click', function() { state.currentTool=''; render(); });
      document.getElementById('add-note') && document.getElementById('add-note').addEventListener('click', function() { state.noteEditing='new'; renderNotes(); });
      app.querySelectorAll('.note-card').forEach(function(card) {
        card.addEventListener('click', function() {
          state.noteEditing = parseInt(this.dataset.idx);
          renderNotes();
        });
      });
    } else {
      var note = state.noteEditing==='new' ? { title:'', content:'' } : notes[state.noteEditing];
      var html = '<div style="padding:16px;">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="font-size:20px;cursor:pointer;" id="note-back">←</div><h2 style="font-size:17px;font-weight:700;">'+(state.noteEditing==='new'?'新建笔记':'编辑笔记')+'</h2></div>';
      html += '<input id="note-title" placeholder="笔记标题" value="'+note.title.replace(/"/g,'&quot;')+'" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:15px;margin-bottom:12px;box-sizing:border-box;">';
      html += '<textarea id="note-content" placeholder="笔记内容..." style="width:100%;height:200px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;resize:none;box-sizing:border-box;">'+note.content+'</textarea>';
      html += '<div style="display:flex;gap:10px;margin-top:16px;">';
      html += '<button id="note-save" style="flex:1;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">保存</button>';
      if (state.noteEditing !== 'new') {
        html += '<button id="note-delete" style="padding:12px 20px;background:#fff;color:#F44336;border:1px solid #F44336;border-radius:10px;font-size:15px;cursor:pointer;">删除</button>';
      }
      html += '</div></div>';
      app.innerHTML = html;
      document.getElementById('note-back').addEventListener('click', function() { state.noteEditing=null; renderNotes(); });
      document.getElementById('note-save').addEventListener('click', function() {
        var title = document.getElementById('note-title').value.trim();
        var content = document.getElementById('note-content').value.trim();
        if (!title) { Utils.toast('请输入标题'); return; }
        if (state.noteEditing === 'new') {
          notes.push({ title:title, content:content, time:new Date().toLocaleDateString() });
        } else {
          notes[state.noteEditing] = { title:title, content:content, time:notes[state.noteEditing].time };
        }
        localStorage.setItem(notesKey, JSON.stringify(notes));
        Utils.toast('保存成功！');
        state.noteEditing = null;
        renderNotes();
      });
      if (document.getElementById('note-delete')) {
        document.getElementById('note-delete').addEventListener('click', function() {
          notes.splice(state.noteEditing, 1);
          localStorage.setItem(notesKey, JSON.stringify(notes));
          Utils.toast('已删除');
          state.noteEditing = null;
          renderNotes();
        });
      }
    }
  }

  render();
});
