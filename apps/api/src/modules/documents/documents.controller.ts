import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { ListDocumentsQueryDto } from "./dto/list-documents-query.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { DocumentsService } from "./documents.service";

@ApiTags("documents")
@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "ownerType", required: false })
  @ApiQuery({ name: "relatedEntityId", required: false })
  @ApiQuery({ name: "avrechId", required: false })
  @ApiQuery({ name: "donorId", required: false })
  @ApiQuery({ name: "donationId", required: false })
  @ApiQuery({ name: "scholarshipId", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortOrder", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiOkResponse({ description: "List document metadata with search, filters, and pagination" })
  findMany(@Query() query: ListDocumentsQueryDto) {
    return this.documentsService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Get a single document metadata record with related entity details" })
  findOne(@Param("id") id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: "Create a document metadata record after a file is stored externally" })
  create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Update document metadata and ownership" })
  update(@Param("id") id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Delete document metadata without storing binary data in PostgreSQL" })
  remove(@Param("id") id: string) {
    return this.documentsService.remove(id);
  }
}

