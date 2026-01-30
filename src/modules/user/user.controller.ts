/**
 * UserController 类
 * 
 * 功能：处理用户相关的 HTTP 请求
 * 描述：定义 /users 路由的 CRUD 接口
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users" })
  findAll(@CurrentUser() currentUser: any) {
    const excludeAdmin = currentUser?.role !== 'admin';
    return this.userService.findAll(excludeAdmin);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by ID" })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete user" })
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}

/*
依赖关系图
═══════════════════════════════════════════════════════════════════════

HTTP 请求流程
═══════════════════════════════════════════════════════════════════════

  HTTP Request
       │
       ▼
  JwtAuthGuard (验证 JWT Token)
       │
       ▼
  UserController
       │
       ├── POST   /           → create()
       ├── GET    /           → findAll()
       ├── GET    /:id        → findOne(id)
       ├── PATCH  /:id        → update(id, dto)
       └── DELETE /:id        → remove(id)
       │
       ▼
  UserService
       │
       ▼
  Repository → Database

依赖关系
═══════════════════════════════════════════════════════════════════════

UserController
    │
    ├── 依赖注入：UserService
    ├── 使用守卫：JwtAuthGuard
    ├── 使用装饰器：@CurrentUser()
    ├── 使用 DTO：CreateUserDto, UpdateUserDto
    └── 路由前缀：/users
*/
