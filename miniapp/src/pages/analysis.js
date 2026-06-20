// =============================================
//  页面：学情分析 & 错题本
// =============================================
Router.register('analysis', function(params) {
  var app = document.getElementById('page-analysis');
  if (!app) return;
  app.style.display = 'block';
  var state = App.state;
  app.innerHTML = `
    <div style="padding:16px;">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:4px;">学情分析</h2>
      <p style="font-size:13px;color:#888;margin-bottom:18px;">学习数据可视化</p>

      <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.05);margin-bottom:16px;">
        <div style="font-size:15px;font-weight:600;margin-bottom:12px;">本周学习报告</div>
        <div style="display:flex;gap:10px;margin-bottom:12px;">
          <div style="flex:1;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--primary);">${(state.studyDays||0)}</div>
            <div style="font-size:12px;color:#888;">学习天数</div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--primary);">${(state.totalMinutes||0)}</div>
            <div style="font-size:12px;color:#888;">累计分钟</div>
          </div>
          <div style="flex:1;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--primary);">0</div>
            <div style="font-size:12px;color:#888;">刷题数</div>
          </div>
        </div>
        <div style="background:#f5f5f5;border-radius:8px;height:8px;overflow:hidden;">
          <div style="width:0%;height:100%;background:var(--primary);border-radius:8px;"></div>
        </div>
        <div style="font-size:12px;color:#888;margin-top:6px;text-align:center;">正确率：暂无数据</div>
      </div>

      <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">错题本</h3>
      <div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.05);color:#999;font-size:14px;text-align:center;">
        暂无错题，继续加油！
      </div>
    </div>
  `;
  renderTabbar('analysis');
});
