declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // 自定义的服务密钥
      SECRET_KEY?: string;
      // 运行环境
      NODE_ENV?: 'development' | 'production' | 'test';
      // 数据库配置
      MYSQL_ADDRESS?: string;
      MYSQL_USERNAME?: string;
      MYSQL_PASSWORD?: string;
      MYSQL_DATABASE?: string;
      // 用户定义
      SIGN_USERS?: string;
      INTERVIEW_USERS?: string;
      ADMIN_USERS?: string;
      // 测试环境用密码
      TEST_PASSWORD?: string;
      // 打印用文档的标题
      DOCUMENT_NAME?: string;
      // 应用名称
      APP_NAME?: string;
    }
  }
}

export {};
