import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentOwnerType } from "@prisma/client";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListDocumentsQueryDto {
  @ApiPropertyOptional({ description: "Search by file name, title, MIME type, or related entity details" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: DocumentOwnerType })
  @IsOptional()
  @IsEnum(DocumentOwnerType)
  ownerType?: DocumentOwnerType;

  @ApiPropertyOptional({ description: "Filter by the id of the entity related to the document" })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avrechId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scholarshipId?: string;

  @ApiPropertyOptional({ default: "createdAt", enum: ["createdAt", "updatedAt", "fileName", "mimeType", "size", "ownerType"] })
  @IsOptional()
  @IsIn(["createdAt", "updatedAt", "fileName", "mimeType", "size", "ownerType"])
  sortBy?: "createdAt" | "updatedAt" | "fileName" | "mimeType" | "size" | "ownerType" = "createdAt";

  @ApiPropertyOptional({ default: "desc", enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}

