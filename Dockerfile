FROM python:3.13-slim

WORKDIR /app

# 复制后端代码
COPY backend/ ./backend/

# 复制前端代码
COPY miniapp/ ./miniapp/

# 复制exe安装包（用于下载）
COPY K12学习助手.exe ./K12学习助手.exe

# 设置环境变量
ENV PORT=80
ENV FRONTEND_DIR=/app/miniapp

# 暴露端口
EXPOSE 80

# 设置工作目录
WORKDIR /app/backend

# 启动命令
CMD ["python", "server.py"]
