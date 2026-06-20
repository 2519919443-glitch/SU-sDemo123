// =============================================
//  K12 学习助手 - 全局状态 & 路由 & 工具
//  单文件整合，避免加载顺序问题
// =============================================

// -------- 工具函数 --------
window.Utils = {
  // 自动消失的提示（底部）
  toast: function(msg) {
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:8px 18px;border-radius:20px;font-size:14px;z-index:99999;transition:opacity 0.3s;pointer-events:none;'; document.body.appendChild(el); }
    el.textContent = msg; el.style.opacity = '1'; el.style.display = 'block';
    setTimeout(function() { el.style.opacity = '0'; setTimeout(function(){el.style.display='none';},300); }, 1800);
  },
  // 手动关闭的提示框（右上角）
  alert: function(msg, type) {
    type = type || 'success'; // success, error, info
    var colors = { success: '#43A047', error: '#e74c3c', info: '#1976D2' };
    var icons = { success: '✅', error: '❌', info: 'ℹ️' };
    var mask = document.createElement('div');
    mask.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:100000;padding:16px;pointer-events:none;';
    mask.innerHTML = `
      <div style="max-width:400px;margin:0 0 0 auto;background:${colors[type]};color:#fff;padding:14px 40px 14px 16px;border-radius:10px;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,0.2);position:relative;pointer-events:auto;animation:slideInRight 0.3s ease;">
        <span style="margin-right:8px;">${icons[type]}</span>${msg}
        <span onclick="this.parentElement.parentElement.remove();" style="position:absolute;top:8px;right:12px;cursor:pointer;font-size:18px;opacity:0.8;">✕</span>
      </div>
    `;
    document.body.appendChild(mask);
    // 5秒后自动消失
    setTimeout(function() { if (mask.parentElement) mask.remove(); }, 5000);
  },
  formatTime: function(min) {
    if (min < 60) return min + '分钟';
    return Math.floor(min/60) + '小时' + (min%60) + '分钟';
  },
  // 密码加密/解密（使用 Base64 编码，可逆）
  encryptPassword: function(password) {
    try {
      return btoa(unescape(encodeURIComponent(password)));
    } catch(e) {
      return password; // 降级处理
    }
  },
  decryptPassword: function(encrypted) {
    try {
      return decodeURIComponent(escape(atob(encrypted)));
    } catch(e) {
      return encrypted; // 降级处理
    }
  },
  // 获取当前学段对应的学科列表（支持数字年级和主要学段名称）
  getSubjects: function(grade) {
    if (!grade) grade = (window.App && window.App.state && window.App.state.grade) || '3';
    // 如果是数字年级，判断学段
    if (!isNaN(grade)) {
      var g = parseInt(grade);
      if (g <= 6) return ['语文','数学','英语'];
      if (g <= 9) return ['语文','数学','英语','物理','化学','生物','历史','地理','道德与法治'];
      return ['语文','数学','英语','物理','化学','生物','历史','地理','政治'];
    }
    // 兼容旧格式
    if (grade === '小学') return ['语文','数学','英语'];
    if (grade === '初中') return ['语文','数学','英语','物理','化学','生物','历史','地理','道德与法治'];
    return ['语文','数学','英语','物理','化学','生物','历史','地理','政治'];
  }
};

// -------- 路由系统 --------
window.Router = {
  current: '',
  pages: {},
  register: function(name, renderFn) {
    this.pages[name] = renderFn;
  },
  go: function(name, params) {
    if (this.current === name) return;
    this.current = name;
    var app = document.getElementById('app');
    if (!app) return;
    // 隐藏所有页面
    var allPages = app.querySelectorAll('.page');
    allPages.forEach(function(p) { p.style.display = 'none'; p.classList.remove('active'); });
    // 显示目标页面
    var target = document.getElementById('page-' + name);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
      window.scrollTo(0, 0);
    }
    // 调用页面渲染函数
    if (this.pages[name]) {
      try { this.pages[name](params || {}); } catch(e) { console.error('Render error ['+name+']:', e); }
    }
    // 更新 tabbar 高亮
    this.updateTabbar(name);
    // 记录到 history
    if (window.history && history.pushState) {
      try { history.pushState({page:name}, '', '#' + name); } catch(e) {}
    }
  },
  updateTabbar: function(name) {
    // 教师页面不显示学生 tabbar
    if (name && name.startsWith('teacher')) {
      var tabbar = document.getElementById('tabbar');
      if (tabbar) tabbar.style.display = 'none';
      return;
    }
    var items = document.querySelectorAll('#tabbar .tab-item');
    items.forEach(function(item) {
      if (item.dataset.page === name) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    // 登录页/引导页/教师页不显示 tabbar
    var tabbar = document.getElementById('tabbar');
    if (tabbar) {
      tabbar.style.display = (name === 'login' || name === 'onboard' || (name && name.startsWith('teacher'))) ? 'none' : 'flex';
    }
  }
};

// -------- 全局状态 --------
window.App = {
  state: {},
  defaultState: {
    grade: '小学',
    level: '三年级',
    textbook: '人教版',
    studyDays: 0,
    totalMinutes: 0,
    todayMinutes: 0,
    streak: 0,
    eyeProtect: false,
    fontSize: 16,
  },

  // 将"一年级"等转换为数字年级 "1"-"12"
  levelToGrade: function(lv) {
    var map = {'一年级':'1','二年级':'2','三年级':'3','四年级':'4','五年级':'5','六年级':'6','七年级':'7','八年级':'8','九年级':'9','高一':'10','高二':'11','高三':'12'};
    return map[lv] || '1';
  },

  init: function() {
    console.log('[App] init');
    // 加载Token
    this.loadToken();
    // 先检查是否是教师登录
    var curTeacher = localStorage.getItem('xuexi_cur_teacher');
    if (curTeacher) {
      this.state = {
        loggedIn: true,
        isTeacher: true,
        teacherName: curTeacher,
        teacherGrade: localStorage.getItem('xuexi_teacher_grade') || '3'
      };
      Router.go('teacher');
      console.log('[App] teacher ready, teacher:', curTeacher);
      return;
    }
    // 普通学生登录
    var curUser = localStorage.getItem('xuexi_cur_user');
    if (curUser) {
      // 尝试从后端加载数据
      var self = this;
      if (this.token) {
        this.apiRequest('/user/' + curUser, { method: 'GET' })
          .then(function(res) {
            if (res.ok) {
              self.state = Object.assign({}, self.defaultState, res.user);
              self.state.loggedIn = true;
              self.state.username = curUser;
              self.state.isTeacher = false;
              self.applyTheme();
              self.applyFontSize();
              // 启动在线时长跟踪（API模式）
              self.startOnlineTimerAPI();
              return;
            }
            // Token失效，使用localStorage
            self.loadFromLocalStorage(curUser);
          })
          .catch(function() { self.loadFromLocalStorage(curUser); });
      } else {
        this.loadFromLocalStorage(curUser);
      }
      return;
    }
    this.state = Object.assign({}, this.defaultState);
    // 隐藏启动屏
    var splash = document.getElementById('splash');
    if (splash) { splash.style.opacity='0'; setTimeout(function(){splash.style.display='none';},400); }
    Router.go('login');
    console.log('[App] ready, loggedIn:', !!this.state.loggedIn);
  },

  // 从localStorage加载用户数据
  loadFromLocalStorage: function(curUser) {
    try {
      var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
      if (users[curUser]) {
        this.state = Object.assign({}, this.defaultState, users[curUser]);
        this.state.loggedIn = true;
        this.state.username = curUser;
        this.state.isTeacher = false;
        // 数据迁移：将旧的年级格式（"小学"）转换为数字格式（"3"）
        if (this.state.grade && isNaN(this.state.grade)) {
          this.state.grade = this.levelToGrade(this.state.level || '三年级');
          this.saveUser();
        }
      } else {
        this.state = Object.assign({}, this.defaultState);
      }
    } catch(e) {
      this.state = Object.assign({}, this.defaultState);
    }
    this.applyTheme();
    this.applyFontSize();
    // 隐藏启动屏
    var splash = document.getElementById('splash');
    if (splash) { splash.style.opacity='0'; setTimeout(function(){splash.style.display='none';},400); }
    if (!this.state.loggedIn) {
      Router.go('login');
    } else if (!this.state.grade || this.state.grade === '') {
      Router.go('onboard');
    } else {
      Router.go('home');
    }
    console.log('[App] ready, loggedIn:', !!this.state.loggedIn);
    // 启动在线时长跟踪（localStorage模式）
    this.startOnlineTimer();
  },

  login: function(username, password) {
    var self = this;
    // 先尝试API登录
    return this.apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username: username, password: password })
    })
    .then(function(res) {
      if (res.ok) {
        // API登录成功
        self.setToken(res.token);
        self.state = Object.assign({}, self.defaultState, res.user);
        self.state.loggedIn = true;
        self.state.username = username;
        self.state.isTeacher = false;
        self.applyTheme();
        self.applyFontSize();
        // 启动在线时长跟踪（API模式）
        self.startOnlineTimerAPI();
        return { ok: true };
      }
      // API失败，降级到localStorage
      return self.loginLocal(username, password);
    })
    .catch(function() {
      // 网络错误，降级到localStorage
      return self.loginLocal(username, password);
    });
  },

  // 本地登录（降级方案）
  loginLocal: function(username, password) {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    if (!users[username]) {
      return { ok: false, msg: '用户名或密码错误' };
    }
    var storedPwd = users[username].password;
    // 支持加密和明文密码
    var encryptedInput = window.Utils.encryptPassword ? window.Utils.encryptPassword(password) : password;
    if (storedPwd === encryptedInput || storedPwd === password) {
      // 如果存储的是明文，升级为加密存储
      if (storedPwd !== encryptedInput && window.Utils.encryptPassword) {
        users[username].password = encryptedInput;
        localStorage.setItem('xuexi_users', JSON.stringify(users));
      }
      localStorage.setItem('xuexi_cur_user', username);
      this.state = Object.assign({}, this.defaultState, users[username]);
      this.state.loggedIn = true;
      this.state.username = username;
      this.state.isTeacher = false;
      this.applyTheme();
      this.applyFontSize();
      this.startOnlineTimer();
      return { ok: true };
    }
    return { ok: false, msg: '用户名或密码错误' };
  },

  // 教师登录
  teacherLogin: function(username, password, grade) {
    var self = this;
    // 先尝试API登录
    return this.apiRequest('/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ username: username, password: password, grade: grade })
    })
    .then(function(res) {
      if (res.ok) {
        // API登录成功
        self.setToken(res.token);
        self.state = {
          loggedIn: true,
          isTeacher: true,
          teacherName: username,
          teacherGrade: grade,
          name: res.teacher.name
        };
        localStorage.setItem('xuexi_cur_teacher', username);
        localStorage.setItem('xuexi_teacher_grade', grade);
        return { ok: true };
      }
      // API失败，降级到localStorage
      return self.teacherLoginLocal(username, password, grade);
    })
    .catch(function() {
      // 网络错误，降级到localStorage
      return self.teacherLoginLocal(username, password, grade);
    });
  },

  // 本地教师登录（降级方案）
  teacherLoginLocal: function(username, password, grade) {
    var teachers = JSON.parse(localStorage.getItem('xuexi_teachers') || '{}');
    if (Object.keys(teachers).length === 0) {
      teachers = {
        'teacher': {
          password: window.Utils && window.Utils.encryptPassword ? window.Utils.encryptPassword('123456') : '123456',
          name: '默认教师',
          grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
          createdAt: new Date().toISOString()
        }
      };
      localStorage.setItem('xuexi_teachers', JSON.stringify(teachers));
    }
    if (!teachers[username]) {
      return { ok: false, msg: '教师账号或密码错误' };
    }
    var storedPwd = teachers[username].password;
    var inputOk = false;
    if (window.Utils && window.Utils.encryptPassword) {
      inputOk = (storedPwd === window.Utils.encryptPassword(password)) || (storedPwd === password);
    } else {
      inputOk = (storedPwd === password);
    }
    if (!inputOk) {
      return { ok: false, msg: '教师账号或密码错误' };
    }
    if (teachers[username].grades.indexOf(grade) === -1) {
      return { ok: false, msg: '您不教授此年级，请联系管理员' };
    }
    localStorage.setItem('xuexi_cur_teacher', username);
    this.state = {
      loggedIn: true,
      isTeacher: true,
      teacherName: username,
      teacherGrade: grade,
      name: teachers[username].name
    };
    return { ok: true };
  },

  register: function(username, password, nickname) {
    var self = this;
    // 先尝试API注册
    return this.apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ username: username, password: password, nickname: nickname })
    })
    .then(function(res) {
      if (res.ok) {
        // API注册成功，自动登录
        return self.login(username, password);
      }
      // API失败，降级到localStorage
      return self.registerLocal(username, password, nickname);
    })
    .catch(function() {
      // 网络错误，降级到localStorage
      return self.registerLocal(username, password, nickname);
    });
  },

  // 本地注册（降级方案）
  registerLocal: function(username, password, nickname) {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    if (users[username]) return { ok: false, msg: '用户名已存在' };
    users[username] = {
      password: window.Utils && window.Utils.encryptPassword ? window.Utils.encryptPassword(password) : password,
      nickname: nickname || username, avatar: '',
      grade: '', level: '', textbook: '人教版',
      studyDays: 0, totalMinutes: 0, todayMinutes: 0, streak: 0,
      eyeProtect: false, fontSize: 16, createdAt: new Date().toISOString()
    };
    localStorage.setItem('xuexi_users', JSON.stringify(users));
    return { ok: true };
  },

  logout: function() {
    if (this.state.isTeacher) {
      localStorage.removeItem('xuexi_cur_teacher');
      localStorage.removeItem('xuexi_teacher_grade');
    } else {
      localStorage.removeItem('xuexi_cur_user');
    }
    this.state = Object.assign({}, this.defaultState);
    Router.go('login');
  },

  saveUser: function() {
    var users = JSON.parse(localStorage.getItem('xuexi_users') || '{}');
    if (this.state.username && users[this.state.username]) {
      var saved = Object.assign({}, users[this.state.username], this.state);
      delete saved.loggedIn;
      users[this.state.username] = saved;
      localStorage.setItem('xuexi_users', JSON.stringify(users));
    }
  },

  applyTheme: function() {
    var grade = this.state.grade || '3';
    // 将数字年级转为学段
    var level = parseInt(grade) || 1;
    var root = document.documentElement;
    if (level <= 6) {
      // 小学
      root.style.setProperty('--primary', '#FF8C00');
      root.style.setProperty('--primary-light', '#FFF3E0');
      root.style.setProperty('--accent', '#FF5722');
    } else if (level <= 9) {
      // 初中
      root.style.setProperty('--primary', '#1976D2');
      root.style.setProperty('--primary-light', '#E3F2FD');
      root.style.setProperty('--accent', '#1565C0');
    } else {
      // 高中
      root.style.setProperty('--primary', '#455A64');
      root.style.setProperty('--primary-light', '#ECEFF1');
      root.style.setProperty('--accent', '#37474F');
    }
    if (this.state.eyeProtect) {
      document.body.style.background = '#C7EDCC';
      document.body.style.color = '#333';
    } else {
      document.body.style.background = '#F5F6FA';
    }
  },

  applyFontSize: function() {
    document.body.style.fontSize = (this.state.fontSize || 16) + 'px';
  },

  // ============ API配置 ============
  // 自动检测API地址：本地用相对路径，线上用配置地址
  apiBase: (function() {
    var host = window.location.hostname;
    // 本地开发
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
    // 从页面meta标签读取API地址（部署时配置）
    var metaApi = document.querySelector('meta[name="api-base"]');
    if (metaApi) {
      return metaApi.getAttribute('content');
    }
    // 默认使用Render免费后端（需要替换为实际地址）
    return 'https://k12-learning-api.onrender.com/api';
  })(),
  token: '',

  // API请求封装
  apiRequest: function(endpoint, options) {
    var url = this.apiBase + endpoint;
    var headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }
    return fetch(url, Object.assign({
      headers: headers
    }, options))
    .then(function(res) { return res.json(); })
    .catch(function(e) { return { ok: false, msg: '网络错误，请检查后端是否启动' }; });
  },

  // 设置Token
  setToken: function(token) {
    this.token = token;
    try { localStorage.setItem('xuexi_token', token); } catch(e) {}
  },

  // 加载Token
  loadToken: function() {
    try {
      this.token = localStorage.getItem('xuexi_token') || '';
    } catch(e) { this.token = ''; }
  }
};

// -------- Tabbar 渲染 --------
window.renderTabbar = function(activePage) {
  var tabs = [
    { id: 'home',      icon: '🏠', label: '首页' },
    { id: 'knowledge', icon: '📖', label: '学习' },
    { id: 'quiz',      icon: '✏️', label: '题库' },
    { id: 'tools',     icon: '🔧', label: '工具' },
    { id: 'profile',   icon: '👤', label: '我的' },
  ];
  var html = '<nav id="tabbar" style="position:fixed;bottom:0;left:0;right:0;height:60px;background:#fff;display:flex;border-top:1px solid #eee;z-index:100;">';
  tabs.forEach(function(tab) {
    var active = tab.id === activePage ? 'active' : '';
    html += '<div class="tab-item ' + active + '" data-page="' + tab.id + '" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:' + (active ? 'var(--primary)' : '#999') + ';font-size:11px;gap:2px;">' +
      '<span style="font-size:20px;">' + tab.icon + '</span><span>' + tab.label + '</span></div>';
  });
  html += '</nav>';
  var old = document.getElementById('tabbar');
  if (old) old.remove();
  document.body.insertAdjacentHTML('beforeend', html);
  // 绑定点击
  document.querySelectorAll('#tabbar .tab-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = this.dataset.page;
      if (page && Router && Router.go) Router.go(page);
    });
  });
};

// -------- 启动 --------
document.addEventListener('DOMContentLoaded', function() {
  console.log('[DOM] ready');
  // 渲染所有页面容器
  var app = document.getElementById('app');
  if (app) {
    var pages = ['login','onboard','home','knowledge','quiz','tools','analysis','profile'];
    pages.forEach(function(p) {
      if (!document.getElementById('page-' + p)) {
        var div = document.createElement('div');
        div.id = 'page-' + p;
        div.className = 'page';
        div.style.display = 'none';
        app.appendChild(div);
      }
    });
  }
  // 初始化
  if (window.App && App.init) App.init();
});

// -------- 在线时长跟踪 --------
window.App.startOnlineTimer = function() {
  if (this._onlineTimer) return; // 避免重复启动
  var start = Date.now();
  this._onlineTimer = setInterval(function() {
    if (!App.state.loggedIn) return;
    var username = App.state.username;
    if (!username) return;
    var today = new Date().toISOString().slice(0, 10);
    var onlineData = JSON.parse(localStorage.getItem('xuexi_online_' + username) || '{}');
    if (!onlineData[today]) onlineData[today] = 0;
    onlineData[today] += 1; // 每分钟+1
    localStorage.setItem('xuexi_online_' + username, JSON.stringify(onlineData));
    // 更新今日分钟数
    App.state.todayMinutes = onlineData[today];
    App.state.totalMinutes = (App.state.totalMinutes || 0) + 1;
    App.saveState();
  }, 60000); // 每分钟保存一次
};

// 获取用户总在线时长（分钟）
window.App.getOnlineMinutes = function(username) {
  try {
    var onlineData = JSON.parse(localStorage.getItem('xuexi_online_' + username) || '{}');
    var total = 0;
    for (var date in onlineData) {
      total += onlineData[date];
    }
    return total;
  } catch(e) {
    return 0;
  }
};
