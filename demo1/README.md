### 执行脚本

```bash
# 后端TS
cd backend-ts
npm install

npm run dev  # 启动本地开发服务器(保存代码后自动重启生效)
npm run build  # 编译构建生产版本(TS编译成JS到dist文件夹)
npm start  # 启动生产服务器(运行build产物)

npm test  # 运行测试(保存代码后自动重跑)
npm run test:run  # 只运行一次测试
npm run test:coverage  # 运行测试并统计覆盖率
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

npm run type-check  
npm run lint 

npm run dev  # 启动本地开发服务器(热更新)
npm run build  # 打包构建生产版本(代码压缩、优化到dist文件夹)
npm run preview  # 本地预览build产物

# 测试布局
# - 单元测试: `xxx.test.ts` 放在被测文件旁边
# - 集成测试: 放在顶层 `tests/`
npm test  # 运行测试(保存代码后自动重跑)
npm run test:run  # 只运行一次测试
npm run test:coverage  # 运行测试并统计覆盖率
```
