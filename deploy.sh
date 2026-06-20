#!/bin/bash
# ============================================
#  K12学习助手 - 云服务器一键部署脚本
#  适用系统: Ubuntu / Debian / CentOS
# ============================================

set -e

echo "========================================"
echo "  K12学习助手 - 云服务器部署脚本"
echo "========================================"

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "[1/6] 安装Python3..."
    if command -v apt &> /dev/null; then
        apt update && apt install -y python3
    elif command -v yum &> /dev/null; then
        yum install -y python3
    fi
else
    echo "[1/6] Python3 已安装: $(python3 --version)"
fi

# 创建项目目录
APP_DIR="/opt/k12-app"
echo "[2/6] 创建项目目录: $APP_DIR"
mkdir -p $APP_DIR

# 如果是首次部署，提示上传文件
if [ ! -f "$APP_DIR/backend/server.py" ]; then
    echo ""
    echo "========================================"
    echo "  请先上传项目文件到 $APP_DIR"
    echo "  目录结构应为:"
    echo "    $APP_DIR/"
    echo "    ├── backend/server.py"
    echo "    ├── miniapp/  (前端文件)"
    echo "    └── K12学习助手.exe (可选，用于下载)"
    echo ""
    echo "  上传命令（在你的本地电脑执行）:"
    echo "    scp -r backend miniapp K12学习助手.exe root@服务器IP:$APP_DIR/"
    echo "========================================"
    echo ""
    echo "上传完成后，重新运行此脚本: bash deploy.sh"
    exit 0
fi

# 设置环境变量
echo "[3/6] 配置环境..."
export PORT=80
export FRONTEND_DIR="$APP_DIR/miniapp"

# 初始化数据库
echo "[4/6] 初始化数据库..."
cd $APP_DIR/backend
python3 -c "from server import init_db; init_db()"
echo "  数据库初始化完成"

# 创建systemd服务（开机自启）
echo "[5/6] 创建系统服务..."
cat > /etc/systemd/system/k12-app.service << EOF
[Unit]
Description=K12 Learning Assistant
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR/backend
Environment=PORT=80
Environment=FRONTEND_DIR=$APP_DIR/miniapp
ExecStart=$(which python3) $APP_DIR/backend/server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable k12-app
systemctl restart k12-app
echo "  系统服务已创建并启动"

# 检查状态
echo "[6/6] 检查服务状态..."
sleep 2
if systemctl is-active --quiet k12-app; then
    echo ""
    echo "========================================"
    echo "  ✅ 部署成功！"
    echo "========================================"
    echo ""
    echo "  访问地址: http://$(curl -s ifconfig.me)"
    echo "  下载页面: http://$(curl -s ifconfig.me)/download"
    echo "  APP下载:  http://$(curl -s ifconfig.me)/app.exe"
    echo ""
    echo "  管理命令:"
    echo "    查看状态: systemctl status k12-app"
    echo "    重启服务: systemctl restart k12-app"
    echo "    查看日志: journalctl -u k12-app -f"
    echo ""
    echo "  默认账号:"
    echo "    管理员: admin / admin123"
    echo "    教师:   teacher / 123456"
    echo "========================================"
else
    echo "  ❌ 服务启动失败，请检查日志:"
    echo "  journalctl -u k12-app -f"
fi
