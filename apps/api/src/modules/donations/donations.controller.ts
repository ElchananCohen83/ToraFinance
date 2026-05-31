import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { ListDonationsQueryDto } from "./dto/list-donations-query.dto";
import { UpdateDonationDto } from "./dto/update-donation.dto";
import { DonationsService } from "./donations.service";

@ApiTags("donations")
@Controller("donations")
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "paymentMethod", required: false })
  @ApiQuery({ name: "currency", required: false })
  @ApiQuery({ name: "donorId", required: false })
  @ApiQuery({ name: "dateFrom", required: false })
  @ApiQuery({ name: "dateTo", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortOrder", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiOkResponse({ description: "List donations with search, filters, sorting, and pagination" })
  findMany(@Query() query: ListDonationsQueryDto) {
    return this.donationsService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Get a single donation with donor and receipt details" })
  findOne(@Param("id") id: string) {
    return this.donationsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: "Create a donation or pledge" })
  create(@Body() dto: CreateDonationDto) {
    return this.donationsService.create(dto);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Update a donation according to receipt business rules" })
  update(@Param("id") id: string, @Body() dto: UpdateDonationDto) {
    return this.donationsService.update(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Cancel a donation while preserving related records" })
  remove(@Param("id") id: string) {
    return this.donationsService.remove(id);
  }
}
