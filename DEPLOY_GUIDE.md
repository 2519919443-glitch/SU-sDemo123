# K12学习助手 - 公网部署指南

## 🌐 部署架构

```
前端（GitHub Pages）         后端API（Render.com）
https://用户名.github.io        https://k12-api.onrender.com
      ↓                              ↓
  静态文件(Html/JS/CSS)      Python后端 + SQLite数据库
```

---

## 📋 部署步骤

### 第一步：在GitHub创建仓库

1. 登录 https://github.com
2. 点击右上角 `+` → `New repository`
3. 仓库名填写：`k12-learning-app`
4. 选择 `Public`
5. **不要**勾选 "Initialize with README"
6. 点击 `Create repository`

### 第二步：推送代码到GitHub

在本地电脑打开终端（Git Bash），执行：

```bash
# 配置你的GitHub信息（替换成你的信息）
git config --global user.email "你的GitHub邮箱"
git config --global user.name "你的GitHub用户名"

# 进入项目目录
cd "C:\Users\BeEverYoung\WorkBuddy\2026-06-19-14-08-25"

# 添加所有文件到git
git add .

# 提交
git commit -m "Initial commit: K12学习助手"

# 添加远程仓库（替换成你的GitHub用户名）
git remote add origin https://github.com/你的用户名/k12-learning-app.git

# 推送到GitHub（首次需要输入GitHub用户名和密码/Token）
git push -u origin master
```

**注意**：GitHub 已不支持密码推送，需要使用 Personal Access Token：
- 创建Token：GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- 推送时，密码处粘贴Token

### 第三步：启用GitHub Pages（前端托管）

1. 在GitHub仓库页面，点击 `Settings`
2. 左侧菜单找到 `Pages`
3. `Source` 选择 `master` 分支
4. `Folder` 选择 `/ (root)` 或 `/miniapp`
5. 点击 `Save`

等待1-2分钟，你会看到：
```
Your site is live at https://你的用户名.github.io/k12-learning-app/
```

### 第四步：部署后端到Render.com（免费）

Render.com 提供免费的 Python 应用托管，步骤如下：

#### 4.1 注册Render
1. 访问 https://render.com
2. 点击 `Sign Up`，选择 `GitHub` 登录（授权访问你的仓库）

#### 4.2 创建Web Service
1. 登录后，点击 `New +` → `Web Service`
2. 选择你的GitHub仓库 `k12-learning-app`
3. 配置：
   - **Name**: `k12-learning-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && python server.py`
   - **Plan**: 选择 `Free`

4. 点击 `Create Web Service`

等待部署完成（约2-3分钟），你会得到一个公网地址：
```
https://k12-learning-api.onrender.com
```

#### 4.3 配置数据库持久化

Render 的免费版每次重启会清空本地文件，需要配置持久化存储：

1. 在Render控制台，进入你的服务
2. `Environment` → `Add Environment Variable`：
   - Key: `RENDER`
   - Value: `true`

3. 修改 `backend/server.py`，让数据库文件存储在持久化目录

### 第五步：配置前端API地址

1. 在 `miniapp/index.html` 的 `<head>` 中添加：

```html
<!-- 配置后端API地址（替换为你的Render地址） -->
<meta name="api-base" content="https://k12-learning-api.onrender.com/api">
```

2. 提交并推送修改：
```bash
git add miniapp/index.html
git commit -m "配置后端API地址"
git push
```

3. 等待GitHub Pages自动更新（约1分钟）

---

## ✅ 验证部署

### 前端访问
打开：`https://你的用户名.github.io/k12-learning-app/`

### 后端API测试
打开：`https://k12-learning-api.onrender.com/api/health`

应该看到：
```json
{"ok": true, "msg": "服务正常"}
```

### 完整功能测试
1. 在前端页面注册新用户
2. 登录并测试各项功能
3. 检查数据是否正确保存到后端

---

## 🔧 常用操作

### 更新代码
```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push

# GitHub Pages会自动更新
# Render会自动重新部署
```

### 查看后端日志
1. 登录 https://render.com
2. 进入你的服务
3. 点击 `Logs` 查看实时日志

### 自定义域名（可选）
#### GitHub Pages自定义域名
1. 购买域名（阿里云/腾讯云）
2. 添加 CNAME 记录指向 `你的用户名.github.io`
3. 在GitHub仓库 `Settings` → `Pages` → `Custom domain` 中填写域名

#### Render自定义域名
1. 在Render控制台，进入你的服务
2. `Settings` → `Custom Domain`
3. 按提示添加DNS记录

---

## 💡 免费服务限制

### GitHub Pages
- ✅ 免费
- ✅ 无限流量
- ✅ 自定义域名
- ❌ 只支持静态文件（HTML/JS/CSS）

### Render Free
- ✅ 免费
- ✅ 支持Python/Node等后端
- ⚠️ 每月750小时（足够24/7运行）
- ⚠️ 15分钟无访问会自动休眠（首次访问需等待30秒唤醒）
- ⚠️ 免费版重启会清空本地数据库（需要定期备份或升级付费版）

---

## 🆘 常见问题

### Q1: GitHub Pages显示404
**解决**：检查仓库设置，`Source` 是否选择了正确的分支和文件夹

### Q2: Render部署失败
**解决**：
1. 检查 `requirements.txt` 是否完整
2. 查看Render日志，确认错误信息
3. 确保 `Start Command` 正确

### Q3: 前端无法连接后端（CORS错误）
**解决**：后端已配置 `Access-Control-Allow-Origin: *`，如果还有问题，检查后端地址是否正确

### Q4: 数据库被清空
**解决**：Render免费版会定期清空本地文件。解决方案：
1. 定期备份数据库文件
2. 升级到付费版（$7/月，持久化存储）
3. 使用云数据库（如Supabase免费版）

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 [GitHub Pages 文档](https://pages.github.com/)
2. 查看 [Render 文档](https://render.com/docs)
3. 联系我获取支持
