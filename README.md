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
SECRET_KEY=自定义密钥，用于认证授权（请不要将你的密钥泄露给他人）
MYSQL_ADDRESS=MySQL地址（e.g.`localhost:3306`）
MYSQL_USERNAME=MySQL用户名
MYSQL_PASSWORD=MySQL密码
```

`.env.development`

```dotenv
# 开发环境下的变量（仅在开发环境下有效 `npm run dev`）

MYSQL_DATABASE=指定要使用数据库名称

# 一一对应：登录用户名,用户昵称(可选/null),登录密码(可选/null)
# 会被转换为JSON格式，全部用双引号
SIGN_USERS='[["sign","开发用签到管理员","12345678"]]'
INTERVIEW_USERS='[["interview","开发用面试管理员","12345678"]]'
ADMIN_USERS='[["admin","开发用系统管理员","12345678"]]'
```

`.env.production`

```dotenv
# 正式环境下的变量（仅在正式环境下有效 `npm start`）

MYSQL_DATABASE=指定要使用数据库名称

# 一一对应：登录用户名,用户昵称(可选/null),登录密码(可选/null)
# 会被转换为JSON格式，全部用双引号
SIGN_USERS='[["sign1","一号签到管理员"],["sign2","二号签到管理员"],["sign3","三号签到管理员"],["sign4","四号签到管理员"],["sign5","五号签到管理员"]]'
INTERVIEW_USERS='[["iv1","一号面试管理员"],["iv2","二号面试管理员"],["iv3","三号面试管理员"],["iv4","四号面试管理员"],["iv5","五号面试管理员"]]'
ADMIN_USERS='[["admin1","一号系统管理员"],["admin2","二号系统管理员"],["admin3","三号系统管理员"]]'
```

`.env.test`

```dotenv
# 测试环境下的变量（仅在测试环境下有效 `npm test`）

MYSQL_DATABASE=指定要使用数据库名称

# 一一对应：登录用户名,用户昵称(可选/null)
# 会被转换为JSON格式，全部用双引号
SIGN_USERS='[["sign","测试用签到管理员"]]'
INTERVIEW_USERS='[["interview","测试用面试管理员"]]'
ADMIN_USERS='[["admin","测试用系统管理员"]]'

# 注意：测试环境如果为用户指定密码将全部无效，使用下面的变量进行替代
TEST_PASSWORD=用于测试环境的密码（必填）
```

环境变量配置完成后，启动服务

```shell
$ npm run dev
```

用于开发，支持热重载，拥有完善的日志

```shell
$ npm test
```

运行测试例子，可以测试接口，插件，覆盖率等

```shell
$ npm start
```

启动正式服务，为了确保正式环境下没有bug，建议先进行测试，一切没问题后再启动正式环境服务

## Maintainers

[@zjy040525](https://github.com/zjy040525)

## Contributing

非常欢迎你的加入！[提一个 Issue](https://github.com/zjy040525/interview-management-system/issues/new)或者提交一个Pull Request

标准Readme遵循[Contributor Covenant](http://contributor-covenant.org/version/1/3/0/)行为规范

### Contributors
