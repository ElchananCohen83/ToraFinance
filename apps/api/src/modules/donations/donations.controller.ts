import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { DonationsService } from "./donations.service";

@ApiTags("donations")
@Controller("donations")
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get()
  @ApiOkResponse({ description: "List recent donations" })
  findRecent() {
    return this.donationsService.findRecent();
  }

  @Post()
  @ApiCreatedResponse({ description: "Create a donation or pledge" })
  create(@Body() dto: CreateDonationDto) {
    return this.donationsService.create(dto);
  }
}
