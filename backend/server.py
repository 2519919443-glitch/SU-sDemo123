#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
K12学习助手后端API服务
使用Python内置模块，无需安装任何依赖
"""

import http.server
import socketserver
import sqlite3
import json
import hashlib
import secrets
import datetime
import os
import sys
import urllib.parse
import re
import gzip
import io

# ============ 配置 ============
PORT = int(os.environ.get('PORT', 3000))
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'xuexi.db')
FRONTEND_DIR = os.environ.get('FRONTEND_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'miniapp'))

def init_db():
    """初始化数据库"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 用户表
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        nickname TEXT,
        avatar TEXT,
        grade TEXT,
        level TEXT,
        textbook TEXT DEFAULT '人教版',
        studyDays INTEGER DEFAULT 0,
        totalMinutes INTEGER DEFAULT 0,
        todayMinutes INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        eyeProtect INTEGER DEFAULT 0,
        fontSize INTEGER DEFAULT 16,
        isTeacher INTEGER DEFAULT 0,
        createdAt TEXT
    )''')
    
    # 教师表
    c.execute('''CREATE TABLE IF NOT EXISTS teachers (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        grades TEXT,
        createdAt TEXT
    )''')
    
    # 管理员表
    c.execute('''CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        createdAt TEXT
    )''')
    
    # 做题记录表
    c.execute('''CREATE TABLE IF NOT EXISTS quiz_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        question TEXT,
        options TEXT,
        answer TEXT,
        correct INTEGER,
        date TEXT,
        timestamp TEXT
    )''')
    
    # 打卡记录表
    c.execute('''CREATE TABLE IF NOT EXISTS checkin_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        date TEXT,
        timestamp TEXT
    )''')
    
    # 学习记录表
    c.execute('''CREATE TABLE IF NOT EXISTS study_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        minutes INTEGER,
        date TEXT,
        timestamp TEXT
    )''')
    
    # 初始化默认管理员
    c.execute('SELECT * FROM admins WHERE username = ?', ('admin',))
    if not c.fetchone():
        admin_pass = hash_password('admin123')
        c.execute('INSERT INTO admins VALUES (?,?,?,?)',
                  ('admin', admin_pass, '系统管理员', datetime.datetime.now().isoformat()))
    
    # 初始化默认教师
    c.execute('SELECT * FROM teachers WHERE username = ?', ('teacher',))
    if not c.fetchone():
        teacher_pass = hash_password('123456')
        grades_json = json.dumps(['1','2','3','4','5','6','7','8','9','10','11','12'])
        c.execute('INSERT INTO teachers VALUES (?,?,?,?,?)',
                  ('teacher', teacher_pass, '默认教师', grades_json, datetime.datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    print('[OK] 数据库初始化完成')

def hash_password(password):
    """SHA256哈希密码"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password, hashed):
    """验证密码"""
    return hash_password(password) == hashed

def generate_token(username, user_type):
    """生成简单token"""
    return secrets.token_hex(16) + '_' + username + '_' + user_type

def verify_token(token):
    """验证token"""
    try:
        parts = token.split('_')
        if len(parts) >= 3:
            return {'username': parts[1], 'type': parts[2]}
    except:
        pass
    return None

def send_json_response(handler, data, status=200):
    """发送JSON响应（带Gzip压缩）"""
    response = json.dumps(data, ensure_ascii=False).encode('utf-8')
    accept_encoding = handler.headers.get('Accept-Encoding', '')
    use_gzip = 'gzip' in accept_encoding and len(response) > 512
    
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if use_gzip:
        compressed = gzip.compress(response)
        handler.send_header('Content-Encoding', 'gzip')
        handler.send_header('Content-Length', len(compressed))
        handler.end_headers()
        handler.wfile.write(compressed)
    else:
        handler.send_header('Content-Length', len(response))
        handler.end_headers()
        handler.wfile.write(response)

def serve_static_file(handler, filename):
    """提供静态文件（带Gzip压缩和缓存）"""
    try:
        # 安全检查：防止目录遍历攻击
        requested_path = os.path.normpath(os.path.join(FRONTEND_DIR, filename))
        if not requested_path.startswith(os.path.normpath(FRONTEND_DIR)):
            handler.send_response(403)
            handler.send_header('Content-Length', '0')
            handler.end_headers()
            return
        
        if not os.path.exists(requested_path):
            handler.send_response(404)
            handler.send_header('Content-Type', 'text/plain; charset=utf-8')
            handler.send_header('Content-Length', '13')
            handler.end_headers()
            handler.wfile.write(b'404 Not Found')
            return
        
        # 确定Content-Type
        content_type = 'application/octet-stream'
        if filename.endswith('.html'):
            content_type = 'text/html; charset=utf-8'
        elif filename.endswith('.js'):
            content_type = 'application/javascript; charset=utf-8'
        elif filename.endswith('.css'):
            content_type = 'text/css; charset=utf-8'
        elif filename.endswith('.json'):
            content_type = 'application/json; charset=utf-8'
        elif filename.endswith('.png'):
            content_type = 'image/png'
        elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
            content_type = 'image/jpeg'
        elif filename.endswith('.ico'):
            content_type = 'image/x-icon'
        elif filename.endswith('.svg'):
            content_type = 'image/svg+xml'
        
        # 读取文件
        mode = 'rb' if content_type.startswith('image/') else 'r'
        with open(requested_path, mode, encoding=None if mode == 'rb' else 'utf-8') as f:
            content = f.read()
        
        # 转为bytes
        if mode == 'rb':
            content_bytes = content
        else:
            content_bytes = content.encode('utf-8')
        
        # 判断是否需要Gzip压缩（文本类文件且大于1KB才压缩）
        compressible = content_type.startswith('text/') or content_type.startswith('application/javascript') or content_type.startswith('application/json') or content_type.startswith('image/svg')
        accept_encoding = handler.headers.get('Accept-Encoding', '')
        use_gzip = compressible and 'gzip' in accept_encoding and len(content_bytes) > 1024
        
        # 发送响应头
        handler.send_response(200)
        handler.send_header('Content-Type', content_type)
        
        if use_gzip:
            # Gzip压缩
            compressed = gzip.compress(content_bytes)
            handler.send_header('Content-Encoding', 'gzip')
            handler.send_header('Content-Length', len(compressed))
            # 文本文件缓存1小时
            handler.send_header('Cache-Control', 'public, max-age=3600')
            handler.end_headers()
            handler.wfile.write(compressed)
        else:
            handler.send_header('Content-Length', len(content_bytes))
            # 图片缓存7天
            if content_type.startswith('image/'):
                handler.send_header('Cache-Control', 'public, max-age=604800')
            else:
                handler.send_header('Cache-Control', 'public, max-age=3600')
            handler.end_headers()
            handler.wfile.write(content_bytes)
        
    except Exception as e:
        handler.send_response(500)
        handler.send_header('Content-Length', '0')
        handler.end_headers()

class APIHandler(http.server.BaseHTTPRequestHandler):
    """API请求处理器"""
    
    # HTTP/1.1 支持keep-alive，复用TCP连接
    protocol_version = 'HTTP/1.1'
    
    def log_message(self, format, *args):
        """自定义日志（只打印API请求，不打印静态文件）"""
        pass  # 静默日志，避免I/O阻塞
    
    def do_OPTIONS(self):
        """处理OPTIONS请求（CORS预检）"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Length', '0')
        self.end_headers()
    
    def do_GET(self):
        """处理GET请求"""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        # API端点
        if path.startswith('/api/'):
            self.handle_api_get(path, parsed.query)
            return
        
        # 下载APP页面
        if path == '/download' or path == '/download.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            html = '''<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>下载K12学习助手</title><style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#667eea,#764ba2);}.card{background:#fff;border-radius:20px;padding:40px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);max-width:400px;}.icon{font-size:64px;margin-bottom:16px;}h1{color:#333;margin:0 0 8px;font-size:24px;}p{color:#666;margin:0 0 24px;font-size:14px;}.btn{display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#FF8C00,#FF6B35);color:#fff;text-decoration:none;border-radius:12px;font-size:18px;font-weight:600;transition:transform .2s;}.btn:hover{transform:scale(1.05);}.info{margin-top:16px;font-size:12px;color:#999;}</style></head><body><div class="card"><div class="icon">📚</div><h1>K12学习助手</h1><p>Windows桌面版 · 9.8MB · 双击即可运行</p><a class="btn" href="/app.exe">⬇ 下载安装包</a><div class="info">支持Windows 7/10/11 · 内置完整运行环境</div></div></div></html>'''.encode('utf-8')
            self.send_header('Content-Length', len(html))
            self.end_headers()
            self.wfile.write(html)
            return
        
        # 下载exe文件
        if path == '/app.exe':
            exe_paths = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'K12学习助手.exe'),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'K12学习助手.exe'),
            ]
            exe_path = None
            for p in exe_paths:
                if os.path.exists(p):
                    exe_path = p
                    break
            if exe_path:
                with open(exe_path, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Disposition', 'attachment; filename="K12-Learning-Assistant.exe"')
                self.send_header('Content-Length', len(content))
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_response(404)
                self.send_header('Content-Length', '0')
                self.end_headers()
            return
        
        # 静态文件服务
        if path == '/' or path == '/index.html':
            serve_static_file(self, 'index.html')
            return
        
        # 其他静态文件
        static_ext = ['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.ico', '.json', '.svg', '.woff', '.woff2', '.ttf']
        if any(path.endswith(ext) for ext in static_ext):
            # 移除开头的/
            filename = path.lstrip('/')
            serve_static_file(self, filename)
            return
        
        # 404
        self.send_response(404)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', '13')
        self.end_headers()
        self.wfile.write(b'404 Not Found')
    
    def do_POST(self):
        """处理POST请求"""
        # 读取请求体
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'

        # 尝试多种编码解码（UTF-8优先，GBK降级）
        body_str = None
        for enc in ('utf-8', 'gbk', 'gb2312', 'latin-1'):
            try:
                body_str = body.decode(enc)
                break
            except (UnicodeDecodeError, LookupError):
                continue
        if body_str is None:
            body_str = '{}'

        try:
            data = json.loads(body_str)
        except Exception:
            data = {}

        path = self.path
        
        # 健康检查
        if path == '/api/health':
            send_json_response(self, {'ok': True, 'msg': '服务正常'})
            return
        
        # 学生登录
        if path == '/api/login':
            username = data.get('username', '')
            password = data.get('password', '')
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT * FROM users WHERE username = ? AND (isTeacher IS NULL OR isTeacher = 0)', (username,))
            columns = [col[0] for col in c.description] if c.description else []
            row = c.fetchone()
            user = dict(zip(columns, row)) if row else None
            conn.close()
            
            if not user or not verify_password(password, user['password']):
                send_json_response(self, {'ok': False, 'msg': '用户名或密码错误'})
                return
            
            token = generate_token(username, 'student')
            send_json_response(self, {
                'ok': True,
                'token': token,
                'user': {
                    'username': user['username'],
                    'nickname': user['nickname'] or username,
                    'grade': user['grade'] or '',
                    'level': user['level'] or '',
                    'textbook': user['textbook'] or '人教版',
                    'studyDays': user['studyDays'] or 0,
                    'totalMinutes': user['totalMinutes'] or 0,
                    'todayMinutes': user['todayMinutes'] or 0,
                    'streak': user['streak'] or 0
                }
            })
            return
        
        # 教师登录
        if path == '/api/teacher/login':
            username = data.get('username', '')
            password = data.get('password', '')
            grade = data.get('grade', '')
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT * FROM teachers WHERE username = ?', (username,))
            columns = [col[0] for col in c.description] if c.description else []
            row = c.fetchone()
            teacher = dict(zip(columns, row)) if row else None
            conn.close()
            
            if not teacher or not verify_password(password, teacher['password']):
                send_json_response(self, {'ok': False, 'msg': '教师账号或密码错误'})
                return
            
            grades = json.loads(teacher['grades']) if teacher['grades'] else []
            if grade not in grades:
                send_json_response(self, {'ok': False, 'msg': '您不教授此年级'})
                return
            
            token = generate_token(username, 'teacher')
            send_json_response(self, {
                'ok': True,
                'token': token,
                'teacher': {
                    'username': teacher['username'],
                    'name': teacher['name'] or username,
                    'grades': grades
                },
                'currentGrade': grade
            })
            return
        
        # 管理员登录
        if path == '/api/admin/login':
            username = data.get('username', '')
            password = data.get('password', '')
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT * FROM admins WHERE username = ?', (username,))
            columns = [col[0] for col in c.description] if c.description else []
            row = c.fetchone()
            admin = dict(zip(columns, row)) if row else None
            conn.close()
            
            if not admin or not verify_password(password, admin['password']):
                send_json_response(self, {'ok': False, 'msg': '管理员账号或密码错误'})
                return
            
            token = generate_token(username, 'admin')
            send_json_response(self, {'ok': True, 'token': token})
            return
        
        # 学生注册
        if path == '/api/register':
            username = data.get('username', '')
            password = data.get('password', '')
            nickname = data.get('nickname', '')
            
            if not username or not password:
                send_json_response(self, {'ok': False, 'msg': '请输入用户名和密码'})
                return
            
            if len(password) < 6:
                send_json_response(self, {'ok': False, 'msg': '密码长度不少于6位'})
                return
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT * FROM users WHERE username = ?', (username,))
            if c.fetchone():
                conn.close()
                send_json_response(self, {'ok': False, 'msg': '用户名已存在'})
                return
            
            c.execute('INSERT INTO users (username, password, nickname, createdAt) VALUES (?,?,?,?)',
                      (username, hash_password(password), nickname or username, datetime.datetime.now().isoformat()))
            conn.commit()
            conn.close()
            
            send_json_response(self, {'ok': True, 'msg': '注册成功'})
            return

        # 更新用户数据
        if path == '/api/user/update':
            username = data.get('username', '')
            if not username:
                send_json_response(self, {'ok': False, 'msg': '缺少用户名'})
                return

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT * FROM users WHERE username = ?', (username,))
            if not c.fetchone():
                conn.close()
                send_json_response(self, {'ok': False, 'msg': '用户不存在'})
                return

            # 更新可修改的字段
            updatable = ['nickname', 'avatar', 'grade', 'level', 'textbook',
                         'studyDays', 'totalMinutes', 'todayMinutes', 'streak',
                         'eyeProtect', 'fontSize']
            sets = []
            vals = []
            for field in updatable:
                if field in data:
                    sets.append(f'{field} = ?')
                    vals.append(data[field])
            if sets:
                vals.append(username)
                c.execute(f'UPDATE users SET {", ".join(sets)} WHERE username = ?', vals)
                conn.commit()
            conn.close()
            send_json_response(self, {'ok': True, 'msg': '更新成功'})
            return

        # 学习时长记录
        if path == '/api/study/time':
            username = data.get('username', '')
            minutes = data.get('minutes', 0)
            if not username:
                send_json_response(self, {'ok': False, 'msg': '缺少用户名'})
                return

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            today = datetime.date.today().isoformat()
            c.execute('UPDATE users SET totalMinutes = totalMinutes + ?, todayMinutes = todayMinutes + ? WHERE username = ?',
                      (minutes, minutes, username))
            c.execute('INSERT INTO study_records (username, minutes, date, timestamp) VALUES (?,?,?,?)',
                      (username, minutes, today, datetime.datetime.now().isoformat()))
            conn.commit()
            conn.close()
            send_json_response(self, {'ok': True, 'msg': '学习时长已记录'})
            return

        # 打卡
        if path == '/api/checkin':
            username = data.get('username', '')
            if not username:
                send_json_response(self, {'ok': False, 'msg': '缺少用户名'})
                return

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            today = datetime.date.today().isoformat()
            c.execute('SELECT * FROM checkin_records WHERE username = ? AND date = ?', (username, today))
            if c.fetchone():
                conn.close()
                send_json_response(self, {'ok': False, 'msg': '今日已打卡'})
                return

            c.execute('INSERT INTO checkin_records (username, date, timestamp) VALUES (?,?,?)',
                      (username, today, datetime.datetime.now().isoformat()))
            c.execute('UPDATE users SET streak = streak + 1, studyDays = studyDays + 1 WHERE username = ?', (username,))
            c.execute('SELECT streak FROM users WHERE username = ?', (username,))
            row = c.fetchone()
            streak = row[0] if row else 0
            conn.commit()
            conn.close()
            send_json_response(self, {'ok': True, 'msg': '打卡成功', 'streak': streak})
            return

        # 做题记录
        if path == '/api/quiz/record':
            username = data.get('username', '')
            if not username:
                send_json_response(self, {'ok': False, 'msg': '缺少用户名'})
                return

            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('INSERT INTO quiz_records (username, question, options, answer, correct, date, timestamp) VALUES (?,?,?,?,?,?,?)',
                      (username, data.get('question', ''), json.dumps(data.get('options', []), ensure_ascii=False),
                       data.get('answer', ''), 1 if data.get('correct') else 0,
                       datetime.date.today().isoformat(), datetime.datetime.now().isoformat()))
            conn.commit()
            conn.close()
            send_json_response(self, {'ok': True, 'msg': '记录已保存'})
            return

        send_json_response(self, {'ok': False, 'msg': '接口不存在'}, 404)
    
    def handle_api_get(self, path, query):
        """处理API GET请求"""
        # 健康检查
        if path == '/api/health':
            send_json_response(self, {'ok': True, 'msg': '服务正常'})
            return
        
        # 获取用户信息
        user_match = re.match(r'^/api/user/([\w]+)$', path)
        if user_match:
            username = user_match.group(1)
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT * FROM users WHERE username = ?', (username,))
            columns = [col[0] for col in c.description] if c.description else []
            row = c.fetchone()
            user = dict(zip(columns, row)) if row else None
            conn.close()
            
            if not user:
                send_json_response(self, {'ok': False, 'msg': '用户不存在'})
                return
            
            send_json_response(self, {
                'ok': True,
                'user': {
                    'username': user['username'],
                    'nickname': user['nickname'] or username,
                    'grade': user['grade'] or '',
                    'level': user['level'] or '',
                    'textbook': user['textbook'] or '人教版',
                    'studyDays': user['studyDays'] or 0,
                    'totalMinutes': user['totalMinutes'] or 0,
                    'todayMinutes': user['todayMinutes'] or 0,
                    'streak': user['streak'] or 0
                }
            })
            return
        
        # 接口不存在
        send_json_response(self, {'ok': False, 'msg': '接口不存在'}, 404)

def get_local_ip():
    """获取本机IP"""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return '127.0.0.1'

if __name__ == '__main__':
    init_db()
    
    local_ip = get_local_ip()
    
    print('=' * 60)
    print('K12学习助手后端服务已启动')
    print(f'本机访问: http://localhost:{PORT}')
    print(f'手机访问: http://{local_ip}:{PORT}')
    print(f'确保手机和电脑在同一WiFi网络')
    print('=' * 60)
    
    try:
        # 使用ThreadingHTTPServer支持多线程并发
        socketserver.ThreadingTCPServer.allow_reuse_address = True
        with http.server.ThreadingHTTPServer(('0.0.0.0', PORT), APIHandler) as httpd:
            httpd.daemon_threads = True  # 主线程退出时子线程也退出
            httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n服务已停止')
    except Exception as e:
        print(f'启动失败: {e}')
