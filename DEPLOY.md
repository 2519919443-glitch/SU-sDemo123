# K12学习助手 - 云服务器部署指南

## 📋 方案概览

| 项目 | 说明 |
|------|------|
| 立即可用 | 前端已部署到 CloudStudio（单用户模式） |
| 完整部署 | 需要一台云服务器（多用户模式 + APP下载） |
| 预估成本 | 腾讯云轻量服务器 2核2G ≈ 50-100元/年 |

---

## 一、立即可用（已完成 ✅）

前端已部署到公网，任何人都可以访问：

**访问地址：** https://b71fbb7fb08c4c31badba32c0a49a66b.app.codebuddy.work

> ⚠️ 这是单用户模式（数据存在浏览器本地），多用户功能需要部署后端。

---

## 二、购买云服务器（推荐）

### 推荐：腾讯云轻量应用服务器

1. 打开 https://cloud.tencent.com/product/lighthouse
2. 选择 **2核2G3M** 套餐（足够使用）
3. 系统选择 **Ubuntu 22.04**
4. 价格约 50-100元/年（新用户优惠）
5. 购买后在控制台获取 **公网IP地址**

### 备选：阿里云ECS

1. 打开 https://www.aliyun.com/product/ecs
2. 选择 **突发性能型 t6** 2核2G
3. 系统选择 **Ubuntu 22.04**

---

## 三、部署步骤（购买服务器后）

### 步骤1：开放端口

在云服务器控制台的「防火墙/安全组」中，添加规则：
- 协议：TCP
- 端口：80
- 来源：0.0.0.0/0（所有IP）

### 步骤2：上传项目文件

在你的本地电脑打开终端（PowerShell/Git Bash），执行：

```bash
# 替换 服务器IP 为你的实际IP
scp -r backend miniapp "K12学习助手.exe" root@你的服务器IP:/opt/k12-app/
```

如果提示输入密码，输入服务器root密码。

### 步骤3：运行部署脚本

SSH 登录服务器：

```bash
ssh root@你的服务器IP
```

然后执行：

```bash
cd /opt/k12-app
bash deploy.sh
```

脚本会自动完成：
- 安装 Python3
- 初始化数据库
- 创建开机自启服务
- 启动服务

### 步骤4：验证

部署完成后，在浏览器访问：
- **网站：** http://你的服务器IP
- **下载页：** http://你的服务器IP/download
- **直接下载APP：** http://你的服务器IP/app.exe

---

## 四、管理命令

```bash
# 查看服务状态
systemctl status k12-app

# 重启服务
systemctl restart k12-app

# 停止服务
systemctl stop k12-app

# 查看实时日志
journalctl -u k12-app -f
```

---

## 五、可选：绑定域名

如果你后续购买了域名（约30-50元/年）：

1. 在域名服务商处添加 A 记录，指向服务器IP
2. 修改 deploy.sh 中的配置（或联系我帮你配置 Nginx + SSL）

---

## 六、技术架构

```
用户浏览器/手机
    ↓
云服务器 (Ubuntu, 80端口)
    ↓
Python HTTP Server (server.py)
    ├── 静态文件服务 (miniapp/)
    ├── API接口 (/api/*)
    ├── APP下载 (/app.exe)
    └── SQLite数据库 (data/xuexi.db)
```

---

## 七、默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 教师 | teacher | 123456 |
| 学生 | 自行注册 | - |

---

## 八、常见问题

**Q: 手机能访问吗？**
A: 可以，手机浏览器输入 http://服务器IP 即可。可"添加到主屏幕"作为APP使用。

**Q: 多少人同时使用没问题？**
A: 2核2G服务器可支撑约50-100人同时在线。

**Q: 数据会丢失吗？**
A: 不会。数据存在 SQLite 数据库文件中。建议定期备份 `/opt/k12-app/backend/data/xuexi.db`。

**Q: 服务器重启后服务会自动启动吗？**
A: 会。deploy.sh 已配置 systemd 开机自启。
