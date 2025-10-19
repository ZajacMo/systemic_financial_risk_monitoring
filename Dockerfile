# 第一阶段：构建Vue应用
FROM node:14-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 第二阶段：使用Nginx提供静态文件服务
FROM nginx:alpine

# 复制构建产物到Nginx的静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义Nginx配置文件（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]