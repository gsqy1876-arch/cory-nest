import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InventoryService } from "./inventory.service";
import { CreateInventoryDto, UpdateInventoryDto } from "./dto/create-inventory.dto";

@ApiTags("inventory")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: "Create inventory item" })
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all inventory items" })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get inventory item by ID" })
  findOne(@Param("id") id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update inventory item" })
  update(@Param("id") id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete inventory item" })
  remove(@Param("id") id: string) {
    return this.inventoryService.remove(id);
  }
}
