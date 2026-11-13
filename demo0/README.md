### 执行脚本

#### 后端

```shell
cd backend

uv lock
uv sync  
uv run uvicorn main:app --reload 
```

#### 前端

```shell
cd frontend

npm install

npm run type-check  
npm run lint 

npm run dev  
npm run build  
npm run preview  
```

#### 本地部署

```shell
cd deploy

bash deploy.sh
```

#### Docker+Nginx生产环境

```shell
docker compose build   
docker compose up -d  
docker compose down  
```
