# uniapp-harmony-sdk

uniapp 离线打包鸿蒙 App 所需要的 har 依赖。

- `files.json`: md5 索引，防止重复的文件
- `copy.mjs`: 处理 har 文件的脚本。
- `index.mjs`: 部署脚本

## 提交新版本

1. 使用 HBuilderX 创建 uniapp 项目，然后执行发布-本地打包 App-Harmony。
1. 在 [NPM](https://www.npmjs.com/package/@dcloudio/uni-app-plus?activeTab=versions) 上查找该 HBuilderX 版本所对应的 UniApp SDK 版本号。比如:

   - `4.29` 对应 `3.0.0-4020920240930001`
   - `4.28` 对应 `3.0.0-4020820240925001`

1. 在本项目根目录，执行下面命令，处理生成的 har 依赖文件，使之有效的文件自动复制到本项目。

   ```shell
   node copy.mjs <HBuilderX所创建的项目目录> <所对应的UniApp SDK版本号>
   ```

1. 提交 Git。
