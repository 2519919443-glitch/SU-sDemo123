// =============================================
//  页面：学习中心（学科 → 章节 → 知识点）
//  适配新数据格式：每个知识点有 grade/subject/chapter 字段
// =============================================
Router.register('knowledge', function(params) {
  var app = document.getElementById('page-knowledge');
  if (!app) return;
  app.style.display = 'block';

  // 状态
  var state = { stage: 'subjects', subject: '', chapter: '' };

  function render() {
    if (state.stage === 'subjects') renderSubjects();
    else if (state.stage === 'chapters') renderChapters();
    else renderKnowledgePoints();
  }

  // ------- 学科列表 -------
  function renderSubjects() {
    var grade = App.state.grade || '1';
    // 获取该年级有哪些学科（从知识点和题库中汇总）
    var subs = AppData.getSubjectsByGrade ? AppData.getSubjectsByGrade(grade) : Utils.getSubjects(grade);
    var icons = { '语文':'📖','数学':'🔢','英语':'🔤','物理':'⚡','化学':'🧪','生物':'🌱','历史':'📜','地理':'🌍','政治':'⚖️','道德与法治':'⚖️' };
    var descs = {
      '语文':'识字阅读、古诗文、写作', '数学':'计算、几何、应用题',
      '英语':'单词、语法、听力', '物理':'力学、电学、光学',
      '化学':'元素、反应、实验', '生物':'细胞、遗传、生态',
      '历史':'古代史、近代史、世界史', '地理':'地图、气候、人文',
      '政治':'思想道德、法律常识', '道德与法治':'道德、法律、国情'
    };
    var html = '<div style="padding:16px;">';
    html += '<h2 style="font-size:18px;font-weight:700;margin-bottom:4px;">学习中心</h2>';
    html += '<p style="font-size:13px;color:#888;margin-bottom:18px;">选择学科开始学习</p>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
    subs.forEach(function(sub) {
      var count = (AppData.knowledgePoints||[]).filter(function(k) {
        return k.grade === grade && k.subject === sub;
      }).length;
      var quizCount = (AppData.quizBanks||[]).filter(function(q) {
        return q.grade === grade && q.subject === sub;
      }).length;
      html += '<div class="subject-card" data-sub="' + sub + '" style="background:#fff;border-radius:14px;padding:18px 14px;cursor:pointer;box-shadow:0 1px 6px rgba(0,0,0,0.06);transition:0.2s;display:flex;flex-direction:column;gap:8px;">';
      html += '<div style="font-size:30px;">' + (icons[sub]||'📚') + '</div>';
      html += '<div style="font-weight:600;font-size:15px;">' + sub + '</div>';
      html += '<div style="font-size:12px;color:#888;">' + (descs[sub]||'') + '</div>';
      html += '<div style="font-size:12px;color:var(--primary);font-weight:500;">' + count + '个知识点 / ' + quizCount + '道题</div>';
      html += '</div>';
    });
    html += '</div></div>';
    app.innerHTML = html;

    app.querySelectorAll('.subject-card').forEach(function(card) {
      card.addEventListener('click', function() {
        state.stage = 'chapters';
        state.subject = this.dataset.sub;
        render();
      });
    });
  }

  // ------- 章节列表 -------
  function renderChapters() {
    var grade = App.state.grade || '1';
    var subject = state.subject;
    // 获取章节列表（从知识点中汇总）
    var chapterMap = {};
    (AppData.knowledgePoints||[]).forEach(function(k) {
      if (k.grade === grade && k.subject === subject) {
        if (!chapterMap[k.chapter]) chapterMap[k.chapter] = { name: k.chapter, count: 0 };
        chapterMap[k.chapter].count++;
      }
    });
    // 也从题库中汇总章节
    (AppData.quizBanks||[]).forEach(function(q) {
      if (q.grade === grade && q.subject === subject) {
        if (!chapterMap[q.chapter]) chapterMap[q.chapter] = { name: q.chapter, count: 0 };
      }
    });
    var chapters = Object.values(chapterMap);
    // 如果没有数据，生成提示
    if (chapters.length === 0) {
      html = '<div style="padding:16px;">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">';
      html += '<div style="font-size:20px;cursor:pointer;" id="kb-back">←</div>';
      html += '<h2 style="font-size:17px;font-weight:700;">' + subject + '</h2>';
      html += '</div>';
      html += '<div style="text-align:center;padding:40px 0;color:#999;">该学科暂无章节数据<br>请先去"题库练习"刷题</div>';
      html += '</div>';
      app.innerHTML = html;
      document.getElementById('kb-back') && document.getElementById('kb-back').addEventListener('click', function() {
        state.stage = 'subjects';
        render();
      });
      return;
    }

    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">';
    html += '<div style="font-size:20px;cursor:pointer;" id="kb-back">←</div>';
    html += '<h2 style="font-size:17px;font-weight:700;">' + subject + ' — 选择章节</h2>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    chapters.forEach(function(ch, i) {
      var kps = (AppData.knowledgePoints||[]).filter(function(k) {
        return k.grade === grade && k.subject === subject && k.chapter === ch.name;
      });
      var qs = (AppData.quizBanks||[]).filter(function(q) {
        return q.grade === grade && q.subject === subject && q.chapter === ch.name;
      });
      html += '<div class="chapter-card" data-idx="' + i + '" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);display:flex;align-items:center;gap:12px;">';
      html += '<div style="font-size:24px;">📄</div><div style="flex:1;">';
      html += '<div style="font-size:14px;font-weight:600;">' + ch.name + '</div>';
      html += '<div style="font-size:12px;color:#888;">' + kps.length + '个知识点 / ' + qs.length + '道题</div>';
      html += '</div><div style="color:#ccc;font-size:18px;">›</div></div>';
    });
    html += '</div></div>';
    app.innerHTML = html;

    document.getElementById('kb-back') && document.getElementById('kb-back').addEventListener('click', function() {
      state.stage = 'subjects';
      render();
    });

    app.querySelectorAll('.chapter-card').forEach(function(card) {
      card.addEventListener('click', function() {
        state.stage = 'points';
        state.chapter = chapters[parseInt(this.dataset.idx)].name;
        render();
      });
    });
  }

  // ------- 知识点列表 -------
  function renderKnowledgePoints() {
    var grade = App.state.grade || '1';
    var subject = state.subject;
    var chapter = state.chapter;
    var points = (AppData.knowledgePoints||[]).filter(function(k) {
      return k.grade === grade && k.subject === subject && k.chapter === chapter;
    });

    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">';
    html += '<div style="font-size:20px;cursor:pointer;" id="kp-back">←</div>';
    html += '<div><div style="font-size:17px;font-weight:700;">' + chapter + '</div><div style="font-size:12px;color:#888;">' + points.length + '个知识点</div></div>';
    html += '</div>';
    if (points.length === 0) {
      html += '<div style="text-align:center;padding:40px 0;color:#999;">该章节暂无知识点<br>可以去"题库练习"刷题</div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:10px;">';
      points.forEach(function(kp, i) {
        var typeColor = kp.type==='考点'?'#F44336':kp.type==='重点'?'#FF9800':'#4CAF50';
        html += '<div class="kp-card" data-idx="' + i + '" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);">';
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
        html += '<span style="background:' + typeColor + '20;color:' + typeColor + ';font-size:11px;padding:2px 8px;border-radius:10px;">' + (kp.type||'基础') + '</span>';
        html += '<span style="font-size:12px;color:#888;">掌握度：' + (kp.mastery||0) + '%</span>';
        html += '</div>';
        html += '<div style="font-size:15px;font-weight:600;margin-bottom:6px;">' + kp.title + '</div>';
        html += '<div style="font-size:13px;color:#666;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + (kp.content||'点击查看详细内容') + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    // 刷题按钮
    var quizCount = (AppData.quizBanks||[]).filter(function(q) {
      return q.grade === grade && q.subject === subject && q.chapter === chapter;
    }).length;
    if (quizCount > 0) {
      html += '<div style="margin-top:16px;">';
      html += '<button id="go-quiz" style="width:100%;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">去刷题（' + quizCount + '道）</button>';
      html += '</div>';
    }
    html += '</div>';
    app.innerHTML = html;

    document.getElementById('kp-back') && document.getElementById('kp-back').addEventListener('click', function() {
      state.stage = 'chapters';
      render();
    });

    app.querySelectorAll('.kp-card').forEach(function(card) {
      card.addEventListener('click', function() {
        showPointDetail(points[parseInt(this.dataset.idx)]);
      });
    });

    var goQuizBtn = document.getElementById('go-quiz');
    if (goQuizBtn) goQuizBtn.addEventListener('click', function() {
      // 跳转到题库页面，用户可手动选择该学科/章节
      Router.go('quiz');
    });
  }

  // ------- 知识点详情 -------
  function showPointDetail(kp) {
    var typeColor = kp.type==='考点'?'#F44336':kp.type==='重点'?'#FF9800':'#4CAF50';
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">';
    html += '<div style="font-size:20px;cursor:pointer;" id="pd-back">←</div>';
    html += '<div style="font-size:17px;font-weight:700;">知识点详情</div>';
    html += '</div>';
    html += '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06);">';
    html += '<span style="background:' + typeColor + '20;color:' + typeColor + ';font-size:12px;padding:3px 10px;border-radius:10px;">' + (kp.type||'基础') + '</span>';
    html += '<h3 style="font-size:18px;font-weight:700;margin:12px 0 8px;">' + kp.title + '</h3>';
    html += '<p style="font-size:13px;color:#888;margin-bottom:16px;">' + state.chapter + ' · ' + state.subject + '</p>';
    html += '<div style="font-size:15px;line-height:1.8;color:#333;">' + (kp.content||'暂无详细内容') + '</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:10px;margin-top:16px;">';
    html += '<button id="pd-quiz" style="flex:1;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">去刷题</button>';
    html += '<button id="pd-back-btn" style="flex:1;padding:12px;background:#f5f5f5;color:#333;border:none;border-radius:10px;font-size:15px;cursor:pointer;">返回列表</button>';
    html += '</div></div>';
    app.innerHTML = html;

    document.getElementById('pd-back') && document.getElementById('pd-back').addEventListener('click', function() { render(); });
    document.getElementById('pd-back-btn') && document.getElementById('pd-back-btn').addEventListener('click', function() { render(); });
    document.getElementById('pd-quiz') && document.getElementById('pd-quiz').addEventListener('click', function() {
      Router.go('quiz');
    });
  }

  render();
});
