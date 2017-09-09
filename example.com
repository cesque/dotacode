server {
    listen 80;
    root /home/dotagsi;
    index index.html index.htm;
 
    server_name _;
 
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}