FROM nginx:alpine

    # 1. 删除容器内默认的Nginx配置（彻底清除旧配置）
    RUN rm -rf /etc/nginx/conf.d/*

    # 2. 将本地的nginx.conf（监听3000端口）复制到容器的配置目录
    # 命名为default.conf，确保Nginx会加载它
    COPY nginx.conf /etc/nginx/conf.d/default.conf

    # 3. 复制前端打包后的静态文件到Nginx目录
    COPY dist/ /usr/share/nginx/html/

    # 4. 暴露3000端口（与配置文件一致）
    EXPOSE 3000

    # 启动Nginx
    CMD ["nginx", "-g", "daemon off;"]
    