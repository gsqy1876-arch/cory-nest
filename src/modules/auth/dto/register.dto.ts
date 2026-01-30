import { IsEmail, IsString, IsArray, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
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

  @ApiProperty({ example: ["view", "add", "edit", "delete"] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({ example: ["dashboard", "users"] })
  @IsArray()
  @IsString({ each: true })
  menus: string[];
}
