/**
 * User 实体类
 *
 * 功能：定义 users 表的数据模型
 * 描述：用户实体包含基本信息、角色权限和审计字段
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
} from "typeorm";

const VALID_MENUS = ['dashboard', 'users', 'orders', 'inventory'];
const VALID_ACTIONS = ['view', 'create', 'edit', 'delete'];

export function isValidPermission(permission: string): boolean {
  const [menu, action] = permission.split(':');
  return VALID_MENUS.includes(menu) && VALID_ACTIONS.includes(action);
}

export function filterValidPermissions(permissions: string[]): string[] {
  return permissions.filter(p => isValidPermission(p));
}

export function filterPermissionsByMenus(permissions: string[], menus: string[]): string[] {
  return permissions.filter(perm => {
    const [menu] = perm.split(':');
    return menus.includes(menu);
  });
}

export function generateDefaultPermissions(role: string, menus: string[]): string[] {
  const actions = role === 'admin' ? VALID_ACTIONS : ['view', 'create', 'edit'];
  const permissions: string[] = [];
  for (const menu of menus) {
    for (const action of actions) {
      permissions.push(`${menu}:${action}`);
    }
  }
  return permissions;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  provider: string; // 'google', 'local', etc.

  @Column({ nullable: true })
  providerId: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'user' })
  role: string;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @Column('simple-array', { nullable: true })
  menus: string[];

  @AfterLoad()
  transformPermissions() {
    this.permissions = this.transformArrayField(this.permissions);
    this.menus = this.transformArrayField(this.menus);
  }

  private transformArrayField(value: string[] | string | null): string[] {
    if (!value || value.length === 0) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];

    const result = value
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map(s => s.replace(/^"|"$/g, '').trim())
      .filter(s => s.length > 0);

    return result;
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

/*
依赖关系图
═══════════════════════════════════════════════════════════════════════

User 实体
    │
    ├── 所属模块：UserModule
    ├── 被使用：UserService, UserController
    ├── 数据库表：users
    └── 字段类型：
        ├── id: uuid (主键)
        ├── email: string (唯一)
        ├── password: string (加密)
        ├── name: string
        ├── isActive: boolean
        ├── role: string
        ├── permissions: string[]
        ├── createdAt: Date
        ├── updatedAt: Date
        └── deletedAt: Date (软删除)
*/
