import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { DonorsService } from "./donors.service";
import { CreateDonorDto } from "./dto/create-donor.dto";

@ApiTags("donors")
@Controller("donors")
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiOkResponse({ description: "List donors with optional search" })
  findMany(@Query("q") q?: string) {
    return this.donorsService.findMany(q);
  }

  @Post()
  @ApiCreatedResponse({ description: "Create a donor profile" })
  create(@Body() dto: CreateDonorDto) {
    return this.donorsService.create(dto);
  }
}
