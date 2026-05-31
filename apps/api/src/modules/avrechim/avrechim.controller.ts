import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PersonStatus } from "@prisma/client";
import { AvrechimService } from "./avrechim.service";
import { CreateAvrechDto } from "./dto/create-avrech.dto";

@ApiTags("avrechim")
@Controller("avrechim")
export class AvrechimController {
  constructor(private readonly avrechimService: AvrechimService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "status", enum: PersonStatus, required: false })
  @ApiOkResponse({ description: "List avrechim with optional search and status filtering" })
  findMany(@Query("q") q?: string, @Query("status") status?: PersonStatus) {
    return this.avrechimService.findMany({ q, status });
  }

  @Post()
  @ApiCreatedResponse({ description: "Create an avrech profile" })
  create(@Body() dto: CreateAvrechDto) {
    return this.avrechimService.create(dto);
  }
}
