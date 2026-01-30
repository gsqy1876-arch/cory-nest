import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("AuthService", () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: "test-uuid",
    email: "test@example.com",
    password: "hashedPassword",
    name: "Test User",
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return access token", async () => {
      const registerDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue("test-jwt-token");

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: "test-jwt-token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
      expect(userService.create).toHaveBeenCalledWith(registerDto);
    });

    it("should throw ConflictException if email already exists", async () => {
      const registerDto = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      };

      userService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("login", () => {
    it("should login successfully and return access token", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue("test-jwt-token");

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: "test-jwt-token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const loginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("validateUser", () => {
    it("should return user if found", async () => {
      userService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      userService.findOne.mockResolvedValue(null);

      const result = await service.validateUser("non-existent-id");

      expect(result).toBeNull();
    });
  });
});
