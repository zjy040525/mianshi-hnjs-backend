# mianshi-hnjs-backend

海宁技师学院面试管理系统后端

## Install

项目使用[Node.js](http://nodejs.org)，请确保你安装了它，版本建议 >=16

配置npm国内镜像源

```shell
$ npm config set registry https://registry.npmmirror.com
```

安装项目依赖

```shell
$ npm install
```

## Usage

配置环境变量，新建`.env` `.env.development` `.env.production` `.env.test`四个文件

`.env`

```dotenv
# 通用环境下的变量（所有环境下都有效）

APP_NAME=应用名称
DOCUMENT_NAME=打印用文档的标题
SECRET_KEY=自定义密钥，用于认证授权（请不要将你的密钥泄露出去）
MYSQL_ADDRESS=MySQL地址（e.g.`localhost:3306`）
MYSQL_USERNAME=MySQL用户名
MYSQL_PASSWORD=MySQL密码
```

`.env.development`

```dotenv
# 开发环境下的变量（仅在开发环境下有效 `npm run start:dev`）

MYSQL_DATABASE=指定要使用数据库名称

# 一一对应：登录用户名,用户昵称(可选/null),登录密码(可选/null)
# 会被转换为JSON格式，全部用双引号
SIGN_USERS='[["sign","开发用签到管理员","12345678"]]'
INTERVIEW_USERS='[["interview","开发用面试管理员","12345678"]]'
ADMIN_USERS='[["admin","开发用系统管理员","12345678"]]'
```

`.env.production`

```dotenv
# 正式环境下的变量（仅在正式环境下有效 `npm start:prod`）

MYSQL_DATABASE=指定要使用数据库名称

# 一一对应：登录用户名,用户昵称(可选/null),登录密码(可选/null)
# 会被转换为JSON格式，全部用双引号
SIGN_USERS='[["sign1","一号签到管理员"],["sign2","二号签到管理员"],["sign3","三号签到管理员"],["sign4","四号签到管理员"],["sign5","五号签到管理员"]]'
INTERVIEW_USERS='[["iv1","一号面试管理员"],["iv2","二号面试管理员"],["iv3","三号面试管理员"],["iv4","四号面试管理员"],["iv5","五号面试管理员"]]'
ADMIN_USERS='[["admin1","一号系统管理员"],["admin2","二号系统管理员"],["admin3","三号系统管理员"]]'
```

`.env.test`

```dotenv
# 测试环境下的变量（仅在测试环境下有效 `npm run start:test`）

MYSQL_DATABASE=指定要使用数据库名称

# 一一对应：登录用户名,用户昵称(可选/null)
# 会被转换为JSON格式，全部用双引号
SIGN_USERS='[["sign","测试用签到管理员"]]'
INTERVIEW_USERS='[["interview","测试用面试管理员"]]'
ADMIN_USERS='[["admin","测试用系统管理员"]]'

# 注意：测试环境如果为用户指定密码将全部无效，必须使用下面的变量设置密码
# 用于所有测试环境下的用户进行登录
TEST_PASSWORD=用于测试环境的密码（必须）
```

环境变量配置完成后，启动本地服务

```shell
$ npm run start:dev
```

启动开发服务，该环境下，有详细的日志，可进行接口的开发和调试（对应分支：所有）

```shell
$ npm test
```

运行测试案例，由后端直接运行的，模拟前端发送网络请求，可以测试接口、插件、覆盖率等。如果你不习惯使用`npm run start:dev`进行调试，你可以使用这个（对应分支：所有）

```shell
$ npm run start:test
```

启动测试服务，该环境下的分支（test）永远超前正式环境的分支（main），仅用于前后端联调，不可作为正式环境使用（对应分支：test）

```shell
$ npm run start:prod
```

启动正式服务，该环境下的接口永远是可用的，稳定的（对应分支：main）

## Pulls

### 开发新功能

1. 基于`main`分支创建你的个人功能分支，一般为`feature/日期-功能简述`
2. 在你的个人功能分支上开发新功能
3. 用`start:dev`启动开发服务，可以用第三方工具进行调试，例如Postman，Apifox等
   1. 当然，如果不习惯可以使用`npm test`，只不过需要手动编写测试案例
4. 本地测试没问题后，把你的个人功能分支合并到`test`分支，之后自动运行测试部署流水线
5. 进行前后端联调
   1. 联调没有出现bug，将你的个人功能分支合并到`main`分支，之后自动运行线上部署流水线，此时可以删除你的个人分支
   2. 联调出现了bug，在个人功能分支上修复bug，然后再次合并到`test`分支，继续回到第5步，进行前后端联调
6. 新功能上线
   1. 在线上测出bug，测试环境没有测出bug，基于`main`分支创建你的个人修复分支，一般为`hotfix/日期-bug简述`，线上bug在你的本地修复分支修复后，将你的个人修复分支合并到`test`分支，继续回到第5步，进行前后端联调
   2. 线上没问题，走完流程

## Maintainers

[@zjy040525](https://github.com/zjy040525)

## Contributing

非常欢迎你的加入！[提一个 Issue](https://github.com/zjy040525/mianshi-hnjs-backend/issues/new)或者提交一个Pull Request

标准Readme遵循[Contributor Covenant](http://contributor-covenant.org/version/1/3/0/)行为规范

### Contributors
