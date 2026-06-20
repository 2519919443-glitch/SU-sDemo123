# -*- coding: utf-8 -*-
"""
K12学习助手 - 桌面应用启动器
启动后端服务器 + 自动打开浏览器
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
import threading
import webbrowser
import time
import socket

# ============ 路径处理 ============
def get_app_dir():
    """获取应用目录（兼容PyInstaller打包和开发模式）"""
    if getattr(sys, 'frozen', False):
        # PyInstaller打包后的路径
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

def get_resource_dir():
    """获取资源目录"""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

APP_DIR = get_app_dir()
RESOURCE_DIR = get_resource_dir()
PORT = 3000
DB_PATH = os.path.join(APP_DIR, 'data', 'xuexi.db')
FRONTEND_DIR = os.path.join(RESOURCE_DIR, 'miniapp')

# ============ 数据库初始化 ============
def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

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

    c.execute('''CREATE TABLE IF NOT EXISTS teachers (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        grades TEXT,
        createdAt TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        createdAt TEXT
    )''')

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

    c.execute('''CREATE TABLE IF NOT EXISTS checkin_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        date TEXT,
        timestamp TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS study_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        minutes INTEGER,
        date TEXT,
        timestamp TEXT
    )''')

    c.execute('SELECT * FROM admins WHERE username = ?', ('admin',))
    if not c.fetchone():
        c.execute('INSERT INTO admins VALUES (?,?,?,?)',
                  ('admin', hash_password('admin123'), '系统管理员', datetime.datetime.now().isoformat()))

    c.execute('SELECT * FROM teachers WHERE username = ?', ('teacher',))
    if not c.fetchone():
        grades_json = json.dumps(['1','2','3','4','5','6','7','8','9','10','11','12'])
        c.execute('INSERT INTO teachers VALUES (?,?,?,?,?)',
                  ('teacher', hash_password('123456'), '默认教师', grades_json, datetime.datetime.now().isoformat()))

    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def generate_token(username, user_type):
    return secrets.token_hex(16) + '_' + username + '_' + user_type

# ============ HTTP 处理 ============
def send_json_response(handler, data, status=200):
    response = json.dumps(data, ensure_ascii=False).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.send_header('Content-Length', len(response))
    handler.end_headers()
    handler.wfile.write(response)

def serve_static_file(handler, filename):
    try:
        requested_path = os.path.normpath(os.path.join(FRONTEND_DIR, filename))
        if not requested_path.startswith(os.path.normpath(FRONTEND_DIR)):
            handler.send_response(403)
            handler.end_headers()
            return

        if not os.path.exists(requested_path):
            handler.send_response(404)
            handler.send_header('Content-Type', 'text/plain; charset=utf-8')
            handler.end_headers()
            handler.wfile.write(b'404 Not Found')
            return

        content_type = 'application/octet-stream'
        ext_map = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.ico': 'image/x-icon',
            '.svg': 'image/svg+xml',
        }
        for ext, ct in ext_map.items():
            if filename.endswith(ext):
                content_type = ct
                break

        if content_type.startswith('image/') or content_type == 'application/octet-stream':
            with open(requested_path, 'rb') as f:
                content = f.read()
            handler.send_response(200)
            handler.send_header('Content-Type', content_type)
            handler.send_header('Content-Length', len(content))
            handler.end_headers()
            handler.wfile.write(content)
        else:
            with open(requested_path, 'r', encoding='utf-8') as f:
                content = f.read()
            content_bytes = content.encode('utf-8')
            handler.send_response(200)
            handler.send_header('Content-Type', content_type)
            handler.send_header('Content-Length', len(content_bytes))
            handler.end_headers()
            handler.wfile.write(content_bytes)
    except Exception as e:
        handler.send_response(500)
        handler.end_headers()

class APIHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # 静默日志

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/'):
            self.handle_api_get(path, parsed.query)
            return

        if path == '/' or path == '/index.html':
            serve_static_file(self, 'index.html')
            return

        static_exts = ['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.ico', '.json', '.svg', '.woff', '.woff2', '.ttf']
        if any(path.endswith(ext) for ext in static_exts):
            serve_static_file(self, path.lstrip('/'))
            return

        self.send_response(404)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'404 Not Found')

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'

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

        if path == '/api/health':
            send_json_response(self, {'ok': True, 'msg': '服务正常'})
            return

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
                'ok': True, 'token': token,
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
                'ok': True, 'token': token,
                'teacher': {'username': teacher['username'], 'name': teacher['name'] or username, 'grades': grades},
                'currentGrade': grade
            })
            return

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
        if path == '/api/health':
            send_json_response(self, {'ok': True, 'msg': '服务正常'})
            return

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

        send_json_response(self, {'ok': False, 'msg': '接口不存在'}, 404)

# ============ 服务器启动 ============
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return '127.0.0.1'

def start_server():
    """启动HTTP服务器（后台线程）"""
    init_db()
    handler = APIHandler
    httpd = socketserver.TCPServer(('0.0.0.0', PORT), handler)
    httpd.serve_forever()

def main():
    # 启动服务器线程
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # 等待服务器就绪
    time.sleep(1.5)

    local_ip = get_local_ip()

    # 打开浏览器
    webbrowser.open(f'http://localhost:{PORT}')

    print(f'K12学习助手已启动')
    print(f'本机访问: http://localhost:{PORT}')
    print(f'手机访问: http://{local_ip}:{PORT}')
    print(f'按 Ctrl+C 或关闭窗口退出')

    # 保持运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('应用已退出')

if __name__ == '__main__':
    main()
