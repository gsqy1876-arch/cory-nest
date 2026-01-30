import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User, generateDefaultPermissions } from "../user/entities/user.entity";

export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
}

export interface LoginResponse {
  accessToken: string;
  username: string;
  role: string;
}

export interface AuthInfoResponse {
  permissions: string[];
  menus: MenuItem[];
}

const MENU_MAP: Record<string, MenuItem> = {
  dashboard: { path: "/", title: "基础数据", icon: "DataLine" },
  users: { path: "/users", title: "用户管理", icon: "User" },
  orders: { path: "/orders", title: "订单管理", icon: "List" },
  inventory: { path: "/inventory", title: "库存管理", icon: "Box" },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const user = await this.userService.create(registerDto);
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async getAuthInfo(userId: string): Promise<AuthInfoResponse> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    const role = user.role || "user";

    const userMenus = (user.menus && user.menus.length > 0) ? user.menus : this.getDefaultMenus(role);
    const menus = this.getMenusByMenus(userMenus);
    const userPermissions = (user.permissions && user.permissions.length > 0) ? user.permissions : generateDefaultPermissions(role, userMenus);

    return {
      permissions: userPermissions,
      menus,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };
    const role = user.role || "user";

    return {
      accessToken: this.jwtService.sign(payload),
      username: user.name,
      role: role,
    };
  }

  private getDefaultMenus(role: string): string[] {
    return role === "admin"
      ? ["dashboard", "users", "orders", "inventory"]
      : ["dashboard"];
  }

  private getMenusByMenus(userMenus: string[]): MenuItem[] {
    return userMenus
      .map(key => MENU_MAP[key])
      .filter((item): item is MenuItem => item !== undefined);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userService.findOne(userId);
  }

  async googleLogin(req: any): Promise<LoginResponse> {
    if (!req) {
      throw new UnauthorizedException('No user from google');
    }

    let user = await this.userService.findByEmail(req.email);

    if (!user) {
      // 如果用户不存在，则创建新用户
      // 注意：这里我们假设 Google 用户是普通用户
      const newUser = {
        email: req.email,
        name: `${req.firstName} ${req.lastName}`,
        picture: req.picture,
        password: '', // OAuth 用户无密码
        provider: 'google',
        providerId: req.providerId,
        role: 'user',
        isActive: true,
        permissions: ['dashboard:view'], // 默认权限，可根据需求调整
        menus: ['dashboard'],
      };
      // 需要调用 user service 的创建方法，可能需要调整 User Service create 接口或直接使用 repo
      // 这里为了简单，我们扩展 UserService 的功能或者调整 create 方法的 DTO
      // 由于 UserService.create 现在已经支持无密码，我们可以直接转换类型
      user = await this.userService.create(newUser as any);
    }

    const payload = { sub: user.id, email: user.email };
    const role = user.role || 'user';
    
    return {
      accessToken: this.jwtService.sign(payload),
      username: user.name,
      role: role,
    };
  }
}
