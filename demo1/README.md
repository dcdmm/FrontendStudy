### 执行脚本

```bash
# 后端TS
cd backend-ts
npm install

npm run dev  # 启动本地开发服务器(保存代码后自动重启生效)
npm run build  # 编译构建生产版本(TS编译成JS到dist文件夹)
npm start  # 启动生产服务器(运行build产物)
```


```bash
# 后端python
cd backend-py
uv sync              
uv run uvicorn main:app --reload --port 8000
```

```bash
# 前端
cd frontend

npm install

npm run dev 
```
