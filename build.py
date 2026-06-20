# -*- coding: utf-8 -*-
# K12学习助手 PyInstaller 打包脚本
# 用法: python build.py

import os
import sys
import shutil
import subprocess

APP_NAME = 'K12学习助手'
APP_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON = r'C:\Users\BeEverYoung\.workbuddy\binaries\python\envs\default\Scripts\python.exe'

def main():
    print('=' * 60)
    print(f'正在打包 {APP_NAME}...')
    print('=' * 60)

    # 清理旧的构建文件
    for d in ['build', 'dist']:
        p = os.path.join(APP_DIR, d)
        if os.path.exists(p):
            print(f'清理 {d}...')
            shutil.rmtree(p, ignore_errors=True)

    spec_file = os.path.join(APP_DIR, f'{APP_NAME}.spec')
    if os.path.exists(spec_file):
        os.remove(spec_file)

    # PyInstaller 命令
    cmd = [
        PYTHON, '-m', 'PyInstaller',
        '--noconfirm',
        '--noconsole',
        '--onefile',
        '--name', APP_NAME,
        '--add-data', f'miniapp{os.pathsep}miniapp',
        '--hidden-import', 'http.server',
        '--hidden-import', 'sqlite3',
        '--hidden-import', 'hashlib',
        '--hidden-import', 'secrets',
        '--hidden-import', 'json',
        '--hidden-import', 'urllib.parse',
        'app.pyw'
    ]

    print(f'执行: {" ".join(cmd)}')
    print('-' * 60)

    result = subprocess.run(cmd, cwd=APP_DIR)

    if result.returncode == 0:
        print('-' * 60)
        exe_path = os.path.join(APP_DIR, 'dist', f'{APP_NAME}.exe')
        if os.path.exists(exe_path):
            size_mb = os.path.getsize(exe_path) / (1024 * 1024)
            print(f'[OK] 打包成功!')
            print(f'文件位置: {exe_path}')
            print(f'文件大小: {size_mb:.1f} MB')
        else:
            print('[WARN] exe文件未找到，请检查 dist 目录')
    else:
        print(f'[ERROR] 打包失败，返回码: {result.returncode}')

if __name__ == '__main__':
    main()
