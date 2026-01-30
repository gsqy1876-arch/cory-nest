/**
 * UserModule 类
 * 
 * 功能：组织用户模块的依赖关系
 * 描述：注册 User 实体、UserService、UserController
 */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

/*
依赖关系图
═══════════════════════════════════════════════════════════════════════

UserModule
    │
    ├── imports：
    │    └── TypeOrmModule.forFeature([User])
    │         │
    │         ▼
    │    Repository<User> (数据库操作)
    │
    ├── controllers：
    │    └── UserController (HTTP 请求处理)
    │
    ├── providers：
    │    └── UserService (业务逻辑)
    │
    └── exports：
         └── UserService (供其他模块使用)

模块导入顺序
═══════════════════════════════════════════════════════════════════════

AppModule
    │
    ├── ConfigModule
    ├── LoggerModule
    ├── TypeOrmModule
    ├── UserModule      ← 当前模块
    │    │
    │    └── exports: UserService
    │
    └── AuthModule
         └── 导入 UserModule 使用 UserService
*/
