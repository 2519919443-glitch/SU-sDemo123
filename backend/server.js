const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'xuexi_secret_key_2026';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../miniapp')));

// ============ 数据文件路径 ============
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  teachers: path.join(DATA_DIR, 'teachers.json'),
  admins: path.join(DATA_DIR, 'admins.json'),
  quizRecords: path.join(DATA_DIR, 'quiz_records.json'),
  checkinRecords: path.join(DATA_DIR, 'checkin_records.json'),
  studyRecords: path.join(DATA_DIR, 'study_records.json')
};

// ============ 数据读写工具 ============
function readJSON(filePath, defaultVal = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filePath, defaultVal);
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('读取文件失败:', filePath, e);
    return defaultVal;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('写入文件失败:', filePath, e);
    return false;
  }
}

// ============ 初始化默认数据 ============
function initDefaultData() {
  // 初始化管理员
  const admins = readJSON(DB_FILES.admins);
  if (!admins['admin']) {
    admins['admin'] = {
      password: bcrypt.hashSync('admin123', 10),
      name: '系统管理员',
      createdAt: new Date().toISOString()
    };
    writeJSON(DB_FILES.admins, admins);
  }

  // 初始化默认教师
  const teachers = readJSON(DB_FILES.teachers);
  if (!teachers['teacher']) {
    teachers['teacher'] = {
      password: bcrypt.hashSync('123456', 10),
      name: '默认教师',
      grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
      createdAt: new Date().toISOString()
    };
    writeJSON(DB_FILES.teachers, teachers);
  }
}
initDefaultData();

// ============ 认证中间件 ============
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'] || req.body.token || req.query.token;
  if (!token) {
    return res.status(401).json({ ok: false, msg: '请先登录' });
  }
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: '登录已过期，请重新登录' });
  }
}

// ============ API路由 ============

// 1. 学生登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ ok: false, msg: '请输入用户名和密码' });
  }
  const users = readJSON(DB_FILES.users);
  const user = users[username];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ ok: false, msg: '用户名或密码错误' });
  }
  const token = jwt.sign({ username, type: 'student' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({
    ok: true,
    token,
    user: {
      username,
      nickname: user.nickname || username,
      grade: user.grade || '',
      level: user.level || '',
      textbook: user.textbook || '人教版',
      studyDays: user.studyDays || 0,
      totalMinutes: user.totalMinutes || 0,
      todayMinutes: user.todayMinutes || 0,
      streak: user.streak || 0,
      eyeProtect: user.eyeProtect || false,
      fontSize: user.fontSize || 16
    }
  });
});

// 2. 教师登录
app.post('/api/teacher/login', (req, res) => {
  const { username, password, grade } = req.body;
  if (!username || !password || !grade) {
    return res.json({ ok: false, msg: '请输入完整信息' });
  }
  const teachers = readJSON(DB_FILES.teachers);
  const teacher = teachers[username];
  if (!teacher || !bcrypt.compareSync(password, teacher.password)) {
    return res.json({ ok: false, msg: '教师账号或密码错误' });
  }
  if (teacher.grades.indexOf(grade) === -1) {
    return res.json({ ok: false, msg: '您不教授此年级，请联系管理员' });
  }
  const token = jwt.sign({ username, type: 'teacher' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({
    ok: true,
    token,
    teacher: {
      username,
      name: teacher.name || username,
      grades: teacher.grades
    },
    currentGrade: grade
  });
});

// 3. 管理员登录
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ ok: false, msg: '请输入用户名和密码' });
  }
  const admins = readJSON(DB_FILES.admins);
  const admin = admins[username];
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.json({ ok: false, msg: '管理员账号或密码错误' });
  }
  const token = jwt.sign({ username, type: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ ok: true, token });
});

// 4. 学生注册
app.post('/api/register', (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) {
    return res.json({ ok: false, msg: '请输入用户名和密码' });
  }
  if (password.length < 6) {
    return res.json({ ok: false, msg: '密码长度不少于6位' });
  }
  const users = readJSON(DB_FILES.users);
  if (users[username]) {
    return res.json({ ok: false, msg: '用户名已存在' });
  }
  users[username] = {
    password: bcrypt.hashSync(password, 10),
    nickname: nickname || username,
    avatar: '',
    grade: '',
    level: '',
    textbook: '人教版',
    studyDays: 0,
    totalMinutes: 0,
    todayMinutes: 0,
    streak: 0,
    eyeProtect: false,
    fontSize: 16,
    createdAt: new Date().toISOString()
  };
  writeJSON(DB_FILES.users, users);
  res.json({ ok: true, msg: '注册成功' });
});

// 5. 获取用户信息
app.get('/api/user/:username', authMiddleware, (req, res) => {
  const users = readJSON(DB_FILES.users);
  const user = users[req.params.username];
  if (!user) {
    return res.json({ ok: false, msg: '用户不存在' });
  }
  res.json({
    ok: true,
    user: {
      username: req.params.username,
      nickname: user.nickname || req.params.username,
      grade: user.grade || '',
      level: user.level || '',
      textbook: user.textbook || '人教版',
      studyDays: user.studyDays || 0,
      totalMinutes: user.totalMinutes || 0,
      todayMinutes: user.todayMinutes || 0,
      streak: user.streak || 0
    }
  });
});

// 6. 更新用户信息
app.post('/api/user/update', authMiddleware, (req, res) => {
  const { username, ...updates } = req.body;
  if (!username) {
    return res.json({ ok: false, msg: '用户名不能为空' });
  }
  const users = readJSON(DB_FILES.users);
  if (!users[username]) {
    return res.json({ ok: false, msg: '用户不存在' });
  }
  // 不允许更新密码（需要单独接口）
  delete updates.password;
  Object.assign(users[username], updates);
  writeJSON(DB_FILES.users, users);
  res.json({ ok: true, msg: '更新成功' });
});

// 7. 修改密码
app.post('/api/user/change-password', authMiddleware, (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) {
    return res.json({ ok: false, msg: '请输入完整信息' });
  }
  if (newPassword.length < 6) {
    return res.json({ ok: false, msg: '新密码长度不少于6位' });
  }
  const users = readJSON(DB_FILES.users);
  if (!users[username]) {
    return res.json({ ok: false, msg: '用户不存在' });
  }
  if (!bcrypt.compareSync(oldPassword, users[username].password)) {
    return res.json({ ok: false, msg: '原密码错误' });
  }
  users[username].password = bcrypt.hashSync(newPassword, 10);
  writeJSON(DB_FILES.users, users);
  res.json({ ok: true, msg: '密码修改成功' });
});

// 8. 管理员重置密码
app.post('/api/admin/reset-password', authMiddleware, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.json({ ok: false, msg: '权限不足' });
  }
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.json({ ok: false, msg: '请输入完整信息' });
  }
  const users = readJSON(DB_FILES.users);
  if (!users[username]) {
    return res.json({ ok: false, msg: '用户不存在' });
  }
  users[username].password = bcrypt.hashSync(newPassword, 10);
  writeJSON(DB_FILES.users, users);
  res.json({ ok: true, msg: '密码已重置为：' + newPassword, newPassword });
});

// 9. 保存做题记录
app.post('/api/quiz/save', authMiddleware, (req, res) => {
  const { username, records } = req.body;
  if (!username || !records) {
    return res.json({ ok: false, msg: '参数错误' });
  }
  const allRecords = readJSON(DB_FILES.quizRecords);
  if (!allRecords[username]) {
    allRecords[username] = [];
  }
  // 添加新记录
  records.forEach(r => {
    r.timestamp = new Date().toISOString();
    allRecords[username].push(r);
  });
  writeJSON(DB_FILES.quizRecords, allRecords);
  res.json({ ok: true, msg: '保存成功' });
});

// 10. 获取做题记录
app.get('/api/quiz/:username', authMiddleware, (req, res) => {
  const allRecords = readJSON(DB_FILES.quizRecords);
  const records = allRecords[req.params.username] || [];
  res.json({ ok: true, records });
});

// 11. 打卡
app.post('/api/checkin', authMiddleware, (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.json({ ok: false, msg: '用户名不能为空' });
  }
  const today = new Date().toISOString().slice(0, 10);
  const allCheckins = readJSON(DB_FILES.checkinRecords);
  if (!allCheckins[username]) {
    allCheckins[username] = [];
  }
  // 检查今天是否已打卡
  const todayCheckin = allCheckins[username].find(c => c.date === today);
  if (todayCheckin) {
    return res.json({ ok: false, msg: '今天已经打卡了' });
  }
  allCheckins[username].push({ date: today, timestamp: new Date().toISOString() });
  writeJSON(DB_FILES.checkinRecords, allCheckins);

  // 更新用户连续打卡天数
  const users = readJSON(DB_FILES.users);
  if (users[username]) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const yesterdayCheckin = allCheckins[username].find(c => c.date === yesterday);
    users[username].streak = yesterdayCheckin ? (users[username].streak || 0) + 1 : 1;
    users[username].studyDays = (users[username].studyDays || 0) + 1;
    writeJSON(DB_FILES.users, users);
  }

  res.json({ ok: true, msg: '打卡成功' });
});

// 12. 获取打卡记录
app.get('/api/checkin/:username', authMiddleware, (req, res) => {
  const allCheckins = readJSON(DB_FILES.checkinRecords);
  const checkins = allCheckins[req.params.username] || [];
  res.json({ ok: true, checkins });
});

// 13. 保存学习时长
app.post('/api/study/time', authMiddleware, (req, res) => {
  const { username, minutes } = req.body;
  if (!username || !minutes) {
    return res.json({ ok: false, msg: '参数错误' });
  }
  const users = readJSON(DB_FILES.users);
  if (users[username]) {
    users[username].totalMinutes = (users[username].totalMinutes || 0) + minutes;
    users[username].todayMinutes = (users[username].todayMinutes || 0) + minutes;
    writeJSON(DB_FILES.users, users);
  }
  res.json({ ok: true, msg: '保存成功' });
});

// 14. 管理员：获取所有学生
app.get('/api/admin/students', authMiddleware, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.json({ ok: false, msg: '权限不足' });
  }
  const users = readJSON(DB_FILES.users);
  const quizRecords = readJSON(DB_FILES.quizRecords);
  const checkinRecords = readJSON(DB_FILES.checkinRecords);
  const students = [];
  for (let u in users) {
    if (!users[u].isTeacher) {
      const stu = {
        username: u,
        nickname: users[u].nickname || u,
        grade: users[u].grade || '',
        studyDays: users[u].studyDays || 0,
        totalMinutes: users[u].totalMinutes || 0,
        streak: users[u].streak || 0,
        password: '' // 不返回密码
      };
      // 统计做题数
      if (quizRecords[u]) {
        stu.totalQuiz = quizRecords[u].length;
        stu.correctQuiz = 0;
        quizRecords[u].forEach(r => { if (r.correct) stu.correctQuiz++; });
        stu.accuracy = stu.totalQuiz > 0 ? Math.round(stu.correctQuiz / stu.totalQuiz * 100) + '%' : '0%';
      } else {
        stu.totalQuiz = 0;
        stu.accuracy = '0%';
      }
      // 打卡次数
      stu.checkinCount = checkinRecords[u] ? checkinRecords[u].length : 0;
      students.push(stu);
    }
  }
  res.json({ ok: true, students });
});

// 15. 管理员：获取所有教师
app.get('/api/admin/teachers', authMiddleware, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.json({ ok: false, msg: '权限不足' });
  }
  const teachers = readJSON(DB_FILES.teachers);
  const result = [];
  for (let t in teachers) {
    result.push({
      username: t,
      name: teachers[t].name || t,
      grades: teachers[t].grades || []
    });
  }
  res.json({ ok: true, teachers: result });
});

// 16. 管理员：添加教师
app.post('/api/admin/teacher/add', authMiddleware, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.json({ ok: false, msg: '权限不足' });
  }
  const { username, password, name, grades } = req.body;
  if (!username || !password) {
    return res.json({ ok: false, msg: '请输入完整信息' });
  }
  const teachers = readJSON(DB_FILES.teachers);
  if (teachers[username]) {
    return res.json({ ok: false, msg: '教师账号已存在' });
  }
  teachers[username] = {
    password: bcrypt.hashSync(password, 10),
    name: name || username,
    grades: grades || ['1','2','3','4','5','6'],
    createdAt: new Date().toISOString()
  };
  writeJSON(DB_FILES.teachers, teachers);
  res.json({ ok: true, msg: '教师添加成功', password });
});

// 17. 获取题库数据
app.get('/api/quiz-bank', (req, res) => {
  // 直接从data.js读取题库数据
  try {
    const dataPath = path.join(__dirname, '../miniapp/src/data.js');
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    // 提取 quizBanks 数组
    const match = dataContent.match(/const quizBanks = (\[[\s\S]*?\]);/);
    if (match) {
      res.json({ ok: true, data: match[1] });
    } else {
      res.json({ ok: false, msg: '题库数据不存在' });
    }
  } catch (e) {
    res.json({ ok: false, msg: '读取题库失败' });
  }
});

// 18. 获取古诗数据
app.get('/api/poems', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../miniapp/src/data.js');
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const match = dataContent.match(/const poems = (\[[\s\S]*?\]);/);
    if (match) {
      res.json({ ok: true, data: match[1] });
    } else {
      res.json({ ok: true, data: '[]' });
    }
  } catch (e) {
    res.json({ ok: true, data: '[]' });
  }
});

// 19. 获取成语数据
app.get('/api/idioms', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../miniapp/src/data.js');
    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const match = dataContent.match(/const idioms = (\[[\s\S]*?\]);/);
    if (match) {
      res.json({ ok: true, data: match[1] });
    } else {
      res.json({ ok: true, data: '[]' });
    }
  } catch (e) {
    res.json({ ok: true, data: '[]' });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('  K12学习助手后端服务已启动');
  console.log('  访问地址: http://localhost:' + PORT);
  console.log('  手机访问: http://' + getLocalIP() + ':' + PORT);
  console.log('=================================');
});

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (let dev in interfaces) {
    for (let i = 0; i < interfaces[dev].length; i++) {
      const face = interfaces[dev][i];
      if (face.family === 'IPv4' && !face.internal) {
        return face.address;
      }
    }
  }
  return 'localhost';
}
