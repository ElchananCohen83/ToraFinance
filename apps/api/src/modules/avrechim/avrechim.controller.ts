import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PersonStatus } from "@prisma/client";
import { AvrechimService } from "./avrechim.service";
import { CreateAvrechDto } from "./dto/create-avrech.dto";
import { ListAvrechimQueryDto } from "./dto/list-avrechim-query.dto";
import { UpdateAvrechDto } from "./dto/update-avrech.dto";

@ApiTags("avrechim")
@Controller("avrechim")
export class AvrechimController {
  constructor(private readonly avrechimService: AvrechimService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "status", enum: PersonStatus, required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiOkResponse({ description: "List avrechim with optional search and status filtering" })
  findMany(@Query() query: ListAvrechimQueryDto) {
    return this.avrechimService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Get a single avrech profile" })
  findOne(@Param("id") id: string) {
    return this.avrechimService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: "Create an avrech profile" })
  create(@Body() dto: CreateAvrechDto) {
    return this.avrechimService.create(dto);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Update an avrech profile" })
  update(@Param("id") id: string, @Body() dto: UpdateAvrechDto) {
    return this.avrechimService.update(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Deactivate an avrech profile" })
  remove(@Param("id") id: string) {
    return this.avrechimService.remove(id);
  }
}
