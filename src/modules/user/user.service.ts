/**
 * UserService 类
 *
 * 功能：处理用户业务逻辑
 * 描述：实现用户 CRUD 操作、密码加密、异常处理
 */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User, filterPermissionsByMenus, filterValidPermissions, generateDefaultPermissions } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    if (createUserDto.password) {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;
    }

    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  async findAll(excludeAdmin: boolean = false): Promise<User[]> {
    if (excludeAdmin) {
      return this.userRepository.find({
        where: { role: 'user' },
      });
    }
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.menus) {
      if (!updateUserDto.permissions) {
        updateUserDto.permissions = generateDefaultPermissions(user.role, updateUserDto.menus);
      } else {
        updateUserDto.permissions = filterPermissionsByMenus(updateUserDto.permissions, updateUserDto.menus);
        updateUserDto.permissions = filterValidPermissions(updateUserDto.permissions);
      }
    } else if (updateUserDto.permissions) {
      updateUserDto.permissions = filterValidPermissions(updateUserDto.permissions);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}

/*
依赖关系图
═══════════════════════════════════════════════════════════════════════

核心依赖架构
═══════════════════════════════════════════════════════════════════════

  UserService
       │
       ├── Repository<User>  ──→ TypeORM ──→ PostgreSQL
       ├── bcryptjs          ──→ 密码加密
       └── NestJS 异常       ──→ ConflictException, NotFoundException

方法调用流程
═══════════════════════════════════════════════════════════════════════

  create()     → findOne → bcrypt.hash → save → INSERT
  findAll()    → find (条件过滤)
  findOne()    → findOne → NotFoundException
  findByEmail()→ findOne
  update()     → findOne → bcrypt.hash → save → UPDATE
  remove()     → findOne → remove → DELETE
  softDelete() → softDelete → UPDATE (设置 deletedAt)

与其他模块的交互
═══════════════════════════════════════════════════════════════════════

  AuthService 调用 UserService：
  ├── login()        → findByEmail()
  ├── register()     → create()
  └── validateUser() → findOne()

被其他模块使用
═══════════════════════════════════════════════════════════════════════

  UserModule exports UserService
       │
       ▼
  AuthModule imports UserModule
       │
       ▼
  AuthService injects UserService
*/
