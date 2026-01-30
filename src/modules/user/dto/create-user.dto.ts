import { IsEmail, IsString, IsArray, MinLength, MaxLength, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", minLength: 6, maxLength: 20 })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: "user" })
  @IsString()
  role: string;

  @ApiPropertyOptional({ example: ["view", "add", "edit", "delete"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions: string[];

  @ApiPropertyOptional({ example: ["dashboard", "users"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  menus: string[];
}
