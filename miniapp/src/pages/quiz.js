// =============================================
//  页面：题库练习（完整功能）
// =============================================
Router.register('quiz', function(params) {
  var app = document.getElementById('page-quiz');
  if (!app) return;
  app.style.display = 'block';

  // 状态
  var state = { stage: 'subjects', subject: '', chapter: '', questions: [], currentQ: 0, answers: [], score: 0 };

  function render() {
    if (state.stage === 'subjects') renderSubjects();
    else if (state.stage === 'chapters') renderChapters();
    else if (state.stage === 'quizzing') renderQuestion();
    else if (state.stage === 'result') renderResult();
  }

  // ------- 学科选择 -------
  function renderSubjects() {
    var subs = (window.AppData && AppData.getSubjectsByGrade) ? AppData.getSubjectsByGrade(App.state.grade) : ['语文','数学','英语'];
    var icons = { '语文':'📖','数学':'🔢','英语':'🔤','物理':'⚡','化学':'🧪','生物':'🌱','历史':'📜','地理':'🌍','政治':'⚖️','道德与法治':'⚖️' };
    var html = '<div style="padding:16px;">';
    html += '<h2 style="font-size:18px;font-weight:700;margin-bottom:4px;">题库练习</h2>';
    html += '<p style="font-size:13px;color:#888;margin-bottom:18px;">选择学科开始刷题</p>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
    subs.forEach(function(sub) {
      var cnt = (AppData.quizBanks||[]).filter(function(q){return q.grade===App.state.grade&&q.subject===sub;}).length;
      html += '<div class="quiz-sub-card" data-sub="' + sub + '" style="background:#fff;border-radius:14px;padding:16px;cursor:pointer;box-shadow:0 1px 6px rgba(0,0,0,0.06);transition:0.2s;">';
      html += '<div style="font-size:28px;margin-bottom:8px;">' + (icons[sub]||'📝') + '</div>';
      html += '<div style="font-size:15px;font-weight:600;">' + sub + '</div>';
      html += '<div style="font-size:12px;color:#888;margin-top:4px;">' + cnt + '道题</div>';
      html += '</div>';
    });
    html += '</div></div>';
    // 每日一练入口
    html += '<div style="padding:0 16px 16px;">';
    html += '<div onclick="startDailyPractice()" style="background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;padding:14px;border-radius:12px;cursor:pointer;text-align:center;">';
    html += '<div style="font-size:15px;font-weight:600;">每日一练（5题）</div>';
    html += '<div style="font-size:12px;opacity:0.85;margin-top:4px;">每日更新 · 保持手感</div>';
    html += '</div></div>';
    app.innerHTML = html;

    app.querySelectorAll('.quiz-sub-card').forEach(function(card) {
      card.addEventListener('click', function() {
        state.stage = 'chapters';
        state.subject = this.dataset.sub;
        render();
      });
    });
  }

  // ------- 章节选择 -------
  function renderChapters() {
    var subs = state.subject;
    var chapters = (window.AppData && AppData.getChaptersBySubject) ? AppData.getChaptersBySubject(App.state.grade, subs) : [];
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">';
    html += '<div style="font-size:20px;cursor:pointer;" id="quiz-back-sub">←</div>';
    html += '<h2 style="font-size:17px;font-weight:700;">' + subs + ' — 选择章节</h2>';
    html += '</div>';
    if (chapters.length === 0) {
      html += '<div style="color:#999;text-align:center;padding:30px 0;">该学科暂无章节数据，请先在学习中心查看知识点。</div>';
    }
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    chapters.forEach(function(ch, i) {
      var qs = (AppData.quizBanks||[]).filter(function(q){return q.grade===App.state.grade&&q.subject===subs&&q.chapter===ch;});
      html += '<div class="quiz-ch-card" data-ch="' + i + '" style="background:#fff;border-radius:12px;padding:14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.05);display:flex;align-items:center;gap:12px;">';
      html += '<div style="font-size:22px;">📄</div><div style="flex:1;">';
      html += '<div style="font-size:14px;font-weight:600;">' + ch + '</div>';
      html += '<div style="font-size:12px;color:#888;">' + qs.length + '道题</div>';
      html += '</div><div style="color:#ccc;font-size:18px;">›</div></div>';
    });
    html += '</div></div>';
    app.innerHTML = html;

    document.getElementById('quiz-back-sub') && document.getElementById('quiz-back-sub').addEventListener('click', function() {
      state.stage = 'subjects';
      render();
    });

    app.querySelectorAll('.quiz-ch-card').forEach(function(card) {
      card.addEventListener('click', function() {
        state.stage = 'quizzing';
        state.chapter = chapters[parseInt(this.dataset.ch)];
        state.questions = (AppData.quizBanks||[]).filter(function(q){
          return q.grade===App.state.grade&&q.subject===subs&&q.chapter===state.chapter;
        });
        state.currentQ = 0; state.answers = []; state.score = 0;
        if (state.questions.length === 0) {
          Utils.toast('该章节暂无题目，去其他章节看看吧！');
          state.stage = 'chapters';
          render();
          return;
        }
        render();
      });
    });
  }

  // ------- 每日一练 -------
  window.startDailyPractice = function() {
    var all = (AppData.quizBanks||[]).filter(function(q){return q.grade===App.state.grade;});
    // 随机选5道
    var picked = [];
    var pool = all.slice();
    while (picked.length < 5 && pool.length > 0) {
      var idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    if (picked.length === 0) {
      Utils.toast('暂无题目，请先添加题库数据！');
      return;
    }
    state.stage = 'quizzing';
    state.subject = '';
    state.chapter = '每日一练';
    state.questions = picked;
    state.currentQ = 0; state.answers = []; state.score = 0;
    render();
  };

  // ------- 答题界面 -------
  function renderQuestion() {
    var q = state.questions[state.currentQ];
    if (!q) { state.stage = 'result'; render(); return; }
    var total = state.questions.length;
    var num = state.currentQ + 1;
    var answered = state.answers[state.currentQ];
    var html = '<div style="padding:16px;">';
    // 进度条
    html += '<div style="margin-bottom:16px;">';
    html += '<div style="display:flex;justify-content:space-between;font-size:13px;color:#888;margin-bottom:6px;">';
    html += '<span>第 ' + num + '/' + total + ' 题</span>';
    html += '<span style="color:var(--primary);font-weight:600;">' + (q.difficulty==='基础'?'⭐ 基础':q.difficulty==='提升'?'⭑ 提升':'⭒ 难题') + '</span>';
    html += '</div>';
    html += '<div style="height:6px;background:#eee;border-radius:3px;"><div style="height:100%;width:' + (num/total*100) + '%;background:var(--primary);border-radius:3px;transition:0.3s;"></div></div>';
    html += '</div>';
    // 题目
    html += '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 6px rgba(0,0,0,0.06);margin-bottom:20px;">';
    html += '<div style="font-size:15px;line-height:1.8;">' + q.question + '</div>';
    html += '</div>';
    // 选项
    html += '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">';
    (q.options||[]).forEach(function(opt, i) {
      var letter = 'ABCD'[i];
      var cls = '';
      var borderColor = '#ddd';
      var bg = '#fff';
      if (answered) {
        if (letter === q.answer) { cls = 'correct'; borderColor = '#4CAF50'; bg = '#E8F5E9'; }
        else if (letter === answered && letter !== q.answer) { cls = 'wrong'; borderColor = '#F44336'; bg = '#FFEBEE'; }
      }
      html += '<div class="quiz-opt ' + cls + '" data-letter="' + letter + '" style="padding:14px 16px;border:2px solid ' + borderColor + ';border-radius:12px;cursor:pointer;background:' + bg + ';transition:0.2s;display:flex;align-items:center;gap:12px;">';
      html += '<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:' + (answered?'#eee':'var(--primary-light)') + ';color:' + (answered?'#999':'var(--primary)') + ';font-size:13px;font-weight:600;flex-shrink:0;">' + letter + '</span>';
      html += '<span style="font-size:15px;">' + opt.replace(/^[A-D]\.\s*/, '') + '</span>';
      html += '</div>';
    });
    html += '</div>';
    // 解析（答完后显示）
    if (answered) {
      html += '<div style="background:' + (answered===q.answer?'#E8F5E9':'#FFEBEE') + ';border-radius:12px;padding:14px;margin-bottom:16px;">';
      html += '<div style="font-size:13px;font-weight:600;color:' + (answered===q.answer?'#2E7D32':'#C62828') + ';margin-bottom:6px;">' + (answered===q.answer?'✅ 回答正确！':'❌ 回答错误，正确答案是 ' + q.answer) + '</div>';
      html += '<div style="font-size:13px;color:#555;line-height:1.7;">' + (q.explanation||'') + '</div>';
      html += '</div>';
    }
    // 按钮
    html += '<div style="display:flex;gap:10px;">';
    if (!answered) {
      html += '<div style="flex:1;"></div>';
      html += '<button id="quiz-submit" style="padding:10px 24px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">确认答案</button>';
    } else {
      if (state.currentQ < total - 1) {
        html += '<button id="quiz-next" style="flex:1;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">下一题 →</button>';
      } else {
        html += '<button id="quiz-finish" style="flex:1;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">查看成绩</button>';
      }
    }
    html += '</div></div>';
    app.innerHTML = html;

    // 选项点击
    if (!answered) {
      app.querySelectorAll('.quiz-opt').forEach(function(opt) {
        opt.addEventListener('click', function() {
          app.querySelectorAll('.quiz-opt').forEach(function(o) { o.style.borderColor = '#ddd'; o.style.background = '#fff'; });
          this.style.borderColor = 'var(--primary)';
          this.style.background = 'var(--primary-light)';
          state._selected = this.dataset.letter;
        });
      });
      document.getElementById('quiz-submit') && document.getElementById('quiz-submit').addEventListener('click', function() {
        if (!state._selected) return Utils.toast('请先选择一个答案！');
        state.answers[state.currentQ] = state._selected;
        if (state._selected === q.answer) state.score++;
        state._selected = null;
        render();
      });
    } else {
      var nextBtn = document.getElementById('quiz-next');
      var finishBtn = document.getElementById('quiz-finish');
      if (nextBtn) nextBtn.addEventListener('click', function() { state.currentQ++; render(); });
      if (finishBtn) finishBtn.addEventListener('click', function() { state.stage = 'result'; render(); });
    }
  }

  // ------- 成绩报告 -------
  function renderResult() {
    var total = state.questions.length;
    var correct = state.score;
    var pct = total > 0 ? Math.round(correct / total * 100) : 0;
    var emoji = pct >= 90 ? '🎉' : (pct >= 60 ? '👍' : '💪');
    var msg = pct >= 90 ? '太棒了！继续保持！' : (pct >= 60 ? '还不错，继续加油！' : '还需要多练习哦！');
    var html = '<div style="padding:16px;">';
    html += '<div style="text-align:center;padding:30px 0;">';
    html += '<div style="font-size:60px;margin-bottom:12px;">' + emoji + '</div>';
    html += '<div style="font-size:40px;font-weight:800;color:var(--primary);">' + pct + '%</div>';
    html += '<div style="font-size:14px;color:#888;margin-top:6px;">正确 ' + correct + '/' + total + ' 题</div>';
    html += '<div style="font-size:14px;color:#666;margin-top:10px;">' + msg + '</div>';
    html += '</div>';
    // 答题详情
    html += '<div style="margin-top:20px;">';
    html += '<div style="font-size:15px;font-weight:600;margin-bottom:12px;">答题详情</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    state.questions.forEach(function(q, i) {
      var a = state.answers[i];
      var ok = a === q.answer;
      html += '<div style="display:flex;align-items:center;gap:10px;background:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">';
      html += '<span style="font-size:18px;">' + (ok?'✅':'❌') + '</span>';
      html += '<span style="flex:1;font-size:13px;color:#555;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + q.question + '</span>';
      html += '<span style="font-size:12px;color:' + (ok?'#4CAF50':'#F44336') + ';font-weight:600;">' + (ok?'正确':'正确答案：' + q.answer) + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
    // 按钮
    html += '<div style="display:flex;gap:10px;margin-top:24px;padding-bottom:80px;">';
    html += '<button onclick="retryQuiz()" style="flex:1;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer;">再刷一次</button>';
    html += '<button onclick="Router.go(\'quiz\')" style="flex:1;padding:12px;background:#f5f5f5;color:#333;border:none;border-radius:10px;font-size:15px;cursor:pointer;">返回题库</button>';
    html += '</div></div>';
    app.innerHTML = html;
  }

  // 再刷一次
  window.retryQuiz = function() {
    state.currentQ = 0; state.answers = []; state.score = 0;
    state.stage = 'quizzing';
    render();
  };

  render();
  renderTabbar('quiz');
});
