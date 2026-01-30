# User Management API

<div align="center">
  <h3>🚀 基于 NestJS + TypeORM + PostgreSQL 的用户管理系统</h3>
  <p>企业级 · 高性能 · 易扩展</p>
</div>

## ✨ 特性

- 🎯 **现代技术栈**: NestJS 10 + TypeORM + PostgreSQL
- 🔐 **完善认证**: JWT + Passport 认证授权
- 📚 **API 文档**: Swagger/OpenAPI 自动生成
- 🛡️ **安全防护**: Helmet 安全中间件
- 📝 **日志系统**: Winston 日志管理
- ✅ **数据验证**: class-validator 自动验证
- 🎨 **代码规范**: ESLint + Prettier
- 🧪 **测试覆盖**: Jest 单元测试

## 📦 技术栈

| 技术       | 版本   | 说明                |
| ---------- | ------ | ------------------- |
| NestJS     | 10.3.0 | 渐进式 Node.js 框架 |
| TypeORM    | 0.3.19 | ORM 框架            |
| PostgreSQL | 8.11.3 | 关系型数据库        |
| JWT        | 10.2.0 | 身份认证            |
| Swagger    | 7.2.0  | API 文档            |
| Winston    | 3.11.0 | 日志系统            |
| Helmet     | 7.1.0  | 安全中间件          |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- npm >= 9.0.0

### 安装依赖

\`\`\`bash

# 使用 npm

npm install

# 或使用 pnpm (推荐)

pnpm install
\`\`\`

### 配置环境变量

\`\`\`bash

# 复制环境变量模板

cp .env.example .env

# 编辑 .env 文件，配置数据库等信息

\`\`\`

### 数据库设置

\`\`\`bash

# 创建数据库

createdb user_manage

# 运行迁移

npm run migration:run

# 运行种子数据（可选）

npm run seed:run
\`\`\`

### 启动开发服务器

\`\`\`bash

# 开发模式（热重载）

npm run start:dev

# 调试模式

npm run start:debug

# 生产模式

npm run start:prod
\`\`\`

访问 http://localhost:3000

### API 文档

访问 http://localhost:3000/api/docs 查看 Swagger API 文档

## 📁 项目结构

\`\`\`
nestProjrct/
├── src/
│ ├── common/ # 公共模块
│ │ ├── decorators/ # 装饰器
│ │ ├── filters/ # 异常过滤器
│ │ ├── interceptors/ # 拦截器
│ │ └── logger/ # 日志服务
│ ├── config/ # 配置文件
│ │ └── app.config.ts # 应用配置
│ ├── modules/ # 业务模块
│ │ ├── auth/ # 认证模块
│ │ ├── user/ # 用户模块
│ │ ├── inventory/ # 库存模块
│ │ └── health/ # 健康检查
│ ├── app.module.ts # 根模块
│ └── main.ts # 应用入口
├── scripts/ # 数据库脚本
│ └── db-utils.ts # 数据库工具
├── test/ # 测试文件
├── .env.example # 环境变量模板
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## 🔧 常用命令

### 开发

\`\`\`bash
npm run start:dev # 启动开发服务器
npm run start:debug # 启动调试模式
npm run build # 构建生产版本
npm run start:prod # 启动生产服务器
\`\`\`

### 代码质量

\`\`\`bash
npm run lint # 代码检查并修复
npm run lint:check # 仅检查不修复
npm run format # 格式化代码
npm run format:check # 检查代码格式
\`\`\`

### 测试

\`\`\`bash
npm run test # 运行单元测试
npm run test:watch # 监听模式
npm run test:cov # 测试覆盖率
npm run test:e2e # E2E 测试
\`\`\`

### 数据库

\`\`\`bash
npm run migration:generate # 生成迁移文件
npm run migration:run # 运行迁移
npm run migration:revert # 回滚迁移
npm run seed:run # 运行种子数据
npm run db:reset # 重置数据库
\`\`\`

## 🔑 核心功能

### 1. 用户认证

- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT Token 认证
- ✅ Refresh Token
- ✅ 密码加密（bcrypt）

### 2. 用户管理

- ✅ 用户 CRUD
- ✅ 角色权限
- ✅ 用户状态管理
- ✅ 数据验证

### 3. API 文档

- ✅ Swagger UI
- ✅ OpenAPI 规范
- ✅ 接口测试
- ✅ 自动生成

### 4. 安全性

- ✅ Helmet 安全头
- ✅ CORS 配置
- ✅ JWT 认证
- ✅ 数据验证
- ✅ 异常处理

## 📚 API 端点

### 认证

\`\`\`
POST /api/v1/auth/register # 用户注册
POST /api/v1/auth/login # 用户登录
POST /api/v1/auth/refresh # 刷新 Token
GET /api/v1/auth/profile # 获取个人信息
\`\`\`

### 用户管理

\`\`\`
GET /api/v1/users # 获取用户列表
GET /api/v1/users/:id # 获取用户详情
POST /api/v1/users # 创建用户
PUT /api/v1/users/:id # 更新用户
DELETE /api/v1/users/:id # 删除用户
\`\`\`

### 健康检查

\`\`\`
GET /api/v1/health # 健康检查
\`\`\`

## 🔒 环境变量

### 必需配置

\`\`\`env

# 数据库

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=user_manage

# JWT

JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d
\`\`\`

### 可选配置

\`\`\`env

# 服务器

PORT=3000
NODE_ENV=development

# CORS

CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# 日志

LOG_LEVEL=debug
LOG_DIR=logs
\`\`\`

详见 `.env.example`

## 🧪 测试

\`\`\`bash

# 运行所有测试

npm run test

# 测试覆盖率

npm run test:cov

# E2E 测试

npm run test:e2e
\`\`\`

## 📝 开发规范

### 代码风格

- 使用 ESLint + Prettier
- 遵循 NestJS 最佳实践
- TypeScript 严格模式

### 提交规范

\`\`\`
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具
\`\`\`

## 🚀 部署

### Docker 部署

\`\`\`bash

# 构建镜像

docker build -t user-management-api .

# 运行容器

docker run -p 3000:3000 user-management-api
\`\`\`

### 传统部署

\`\`\`bash

# 构建

npm run build

# 启动

npm run start:prod
\`\`\`

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)

---

<div align="center">
  Made with ❤️ by NestJS Team
</div>
