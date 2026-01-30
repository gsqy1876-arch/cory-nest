/**
 * UserService 单元测试
 * 
 * 功能：测试 UserService 的所有方法
 * 描述：使用 Jest 和 mocking 进行单元测试
 */
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("UserService", () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: "test-uuid",
    email: "test@example.com",
    password: "hashedPassword",
    name: "Test User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new user successfully", async () => {
      const createUserDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      repository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it("should throw ConflictException if user already exists", async () => {
      const createUserDto = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      };

      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const users = [mockUser];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
    });
  });

  describe("findOne", () => {
    it("should return a user if found", async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a user successfully", async () => {
      const updateUserDto = { name: "Updated Name" };
      const updatedUser = { ...mockUser, name: "Updated Name" };

      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual(updatedUser);
    });

    it("should hash password when updating with new password", async () => {
      const updateUserDto = { password: "newPassword123" };

      repository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
      repository.save.mockImplementation((user) => Promise.resolve(user));

      await service.update(mockUser.id, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
    });
  });

  describe("remove", () => {
    it("should remove a user successfully", async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("softDelete", () => {
    it("should soft delete a user", async () => {
      repository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.softDelete(mockUser.id);

      expect(repository.softDelete).toHaveBeenCalledWith(mockUser.id);
    });
  });
});

/*
测试覆盖
═══════════════════════════════════════════════════════════════════════

测试套件：
├── create    → 成功创建、邮箱冲突
├── findAll   → 返回用户数组
├── findOne   → 找到用户、未找到用户
├── update    → 成功更新、密码加密
├── remove    → 成功删除
└── softDelete→ 软删除

Mock 依赖：
├── Repository<User>  → jest.fn() 模拟所有方法
└── bcryptjs          → jest.mock() 模拟加密
*/
