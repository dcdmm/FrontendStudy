### 常用命令

```shell
# 运行
npx tsx file.ts               # 运行一次,执行完自动退出;改了代码需重新敲命令

# 类型检查
npx tsc --noEmit              # 检查整个目录

# 依赖管理
npm install                   # 安装package.json中的全部依赖
npm i -D <包名>               # 安装开发依赖(devDependencies)
npm i <包名>                  # 安装运行依赖(dependencies)
npm uninstall <包名>          # 卸载
npm ls                        # 查看当前项目node_modules中实际安装的版本(直接依赖)
npm ls --all                  # 显示完整依赖树(直接依赖 + 间接依赖)
                              # 直接依赖:你自己装的、写在package.json里的包,如tsx
                              # 间接依赖:直接依赖需要用到的包,如esbuild
npm ls <包名>                 # 查看某个包装在哪、被谁依赖(如 npm ls esbuild → tsx依赖了它)
npm outdated                  # 查看可更新的依赖
npm update <包名>             # 升级指定包,不跨大版本(如typescript "^6.0.3"只会升到6.x最新)
npm i -D <包名>@<版本>        # 安装指定版本:未安装则安装,已安装则升级/降级到该版本(可跨大版本);运行依赖去掉-D
                              # package.json中有该包则改版本号(如"^6.0.3"→"^7.0.2"),没有则新增一行
                              # 版本写法: typescript@6(6.x最新) / typescript@6.0.3(精确版本) / typescript@latest(最新版,等价于不带@: typescript)
                              
npm i -g <包名>               # 全局安装
npm uninstall -g <包名>       # 全局卸载
npm ls -g                     # 查看全局安装的包

# 版本查看
node -v                       # Node.js运行时版本(系统全局)
npx tsc -v                    # TypeScript编译器(tsc)的版本
```
