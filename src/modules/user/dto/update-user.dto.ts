/**
 * UpdateUserDto 类
 * 
 * 功能：定义更新用户的请求数据验证规则
 * 描述：继承 CreateUserDto，所有字段变为可选，用于 PATCH 请求
 */
import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsString, IsArray, MinLength, MaxLength } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  menus?: string[];
}

/*
依赖关系图
═══════════════════════════════════════════════════════════════════════

UpdateUserDto
    │
    ├── 继承：CreateUserDto (via PartialType)
    ├── 被使用：UserController.update()
    ├── 验证：ValidationPipe
    └── 特点：所有字段都是可选的
*/
