import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ListReceiptsQueryDto } from "./dto/list-receipts-query.dto";
import { ReceiptImportDto } from "./dto/receipt-import.dto";
import { UpdateReceiptDto } from "./dto/update-receipt.dto";
import { ReceiptsService } from "./receipts.service";

@ApiTags("receipts")
@Controller("receipts")
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "accountingSystem", required: false })
  @ApiQuery({ name: "donorId", required: false })
  @ApiQuery({ name: "donationId", required: false })
  @ApiQuery({ name: "dateFrom", required: false })
  @ApiQuery({ name: "dateTo", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortOrder", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiOkResponse({ description: "List externally synchronized receipts" })
  findMany(@Query() query: ListReceiptsQueryDto) {
    return this.receiptsService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Get a synchronized receipt record" })
  findOne(@Param("id") id: string) {
    return this.receiptsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: "Import a receipt record from an external accounting system" })
  create(@Body() dto: ReceiptImportDto) {
    return this.receiptsService.create(dto);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Update synchronized receipt metadata" })
  update(@Param("id") id: string, @Body() dto: UpdateReceiptDto) {
    return this.receiptsService.update(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Cancel a synchronized receipt record" })
  remove(@Param("id") id: string) {
    return this.receiptsService.remove(id);
  }
}
