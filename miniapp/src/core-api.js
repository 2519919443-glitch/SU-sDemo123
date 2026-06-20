// =============================================
//  K12学习助手 - API扩展（数据同步功能）
//  core.js 已内置API登录/注册逻辑
//  本文件仅提供额外的数据同步功能
// =============================================

(function() {
  'use strict';

  function waitForApp(callback) {
    if (window.App && App.apiRequest) {
      callback();
    } else {
      setTimeout(function() { waitForApp(callback); }, 100);
    }
  }

  waitForApp(function() {
    console.log('[API] 数据同步模块已加载');

    // ===== 1. 挂钩 App.saveUser() - 同步用户数据到云端 =====
    var _originalSaveUser = App.saveUser;
    App.saveUser = function() {
      // 先调用原始函数保存到localStorage
      if (_originalSaveUser) {
        _originalSaveUser.call(App);
      }

      // 再同步到API
      if (App.token && App.state.username) {
        var userData = {};
        for (var key in App.state) {
          if (key !== 'loggedIn' && key !== 'isTeacher') {
            userData[key] = App.state[key];
          }
        }
        App.apiRequest('/user/update', {
          method: 'POST',
          body: JSON.stringify(Object.assign({ username: App.state.username }, userData))
        })
        .then(function(res) {
          if (res.ok) console.log('[API] 用户数据已同步到云端');
          else console.warn('[API] 同步用户数据失败:', res.msg);
        })
        .catch(function(e) { console.warn('[API] 同步用户数据错误:', e); });
      }
    };

    // ===== 2. 在线时长跟踪（API模式）=====
    if (!App.startOnlineTimerAPI) {
      App.startOnlineTimerAPI = function() {
        if (this._onlineTimer) return;
        var start = Date.now();
        this._onlineTimer = setInterval(function() {
          if (!App.state.loggedIn) return;
          var username = App.state.username;
          if (!username) return;

          // 保存到localStorage（降级方案）
          var today = new Date().toISOString().slice(0, 10);
          var onlineData = JSON.parse(localStorage.getItem('xuexi_online_' + username) || '{}');
          if (!onlineData[today]) onlineData[today] = 0;
          onlineData[today] += 1;
          localStorage.setItem('xuexi_online_' + username, JSON.stringify(onlineData));

          // 同步到API（每分钟）
          if (App.token) {
            App.apiRequest('/study/time', {
              method: 'POST',
              body: JSON.stringify({ username: username, minutes: 1 })
            })
            .catch(function(e) { /* 静默失败 */ });
          }

          // 更新状态
          App.state.todayMinutes = (App.state.todayMinutes || 0) + 1;
          App.state.totalMinutes = (App.state.totalMinutes || 0) + 1;
        }, 60000);
      };
    }

    // ===== 3. 打卡（API模式）=====
    if (!App.checkinAPI) {
      App.checkinAPI = function(username) {
        return App.apiRequest('/checkin', {
          method: 'POST',
          body: JSON.stringify({ username: username || App.state.username })
        })
        .then(function(res) {
          if (res.ok) {
            App.state.streak = res.streak || (App.state.streak || 0) + 1;
            return { ok: true, msg: '打卡成功', streak: res.streak };
          }
          return { ok: false, msg: res.msg || '打卡失败' };
        })
        .catch(function(e) {
          return { ok: false, msg: '网络错误，请稍后重试' };
        });
      };
    }

    console.log('[API] 数据同步模块就绪');
  });
})();
