import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateScholarshipDto } from "./dto/create-scholarship.dto";
import { ListScholarshipsQueryDto } from "./dto/list-scholarships-query.dto";
import { UpdateScholarshipDto } from "./dto/update-scholarship.dto";
import { ScholarshipsService } from "./scholarships.service";

@ApiTags("scholarships")
@Controller("scholarships")
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "month", required: false, type: Number })
  @ApiQuery({ name: "year", required: false, type: Number })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "avrechId", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortOrder", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiOkResponse({ description: "List scholarships with search, filters, attendance, and pagination" })
  findMany(@Query() query: ListScholarshipsQueryDto) {
    return this.scholarshipsService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Get a single scholarship with avrech and attendance details" })
  findOne(@Param("id") id: string) {
    return this.scholarshipsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: "Create a scholarship for an avrech" })
  create(@Body() dto: CreateScholarshipDto) {
    return this.scholarshipsService.create(dto);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Update scholarship amount, status, or notes" })
  update(@Param("id") id: string, @Body() dto: UpdateScholarshipDto) {
    return this.scholarshipsService.update(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Delete a scholarship record" })
  remove(@Param("id") id: string) {
    return this.scholarshipsService.remove(id);
  }
}
