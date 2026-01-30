import { IsString, IsNumber, Min, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateInventoryDto {
  @ApiProperty({ example: "PRD001" })
  @IsString()
  productNo: string;

  @ApiProperty({ example: "产品A" })
  @IsString()
  name: string;

  @ApiProperty({ example: "电子产品" })
  @IsString()
  category: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  productNo?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
