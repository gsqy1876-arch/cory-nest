import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataSource } from "typeorm";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: "Health check" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: this.dataSource.isInitialized ? "connected" : "disconnected",
    };
  }
}
