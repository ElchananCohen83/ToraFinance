import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentOwnerType } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty({ description: "Public or signed URL returned by the storage provider" })
  @IsString()
  fileUrl!: string;

  @ApiProperty()
  @IsString()
  mimeType!: string;

  @ApiProperty({ minimum: 0, description: "File size in bytes" })
  @IsInt()
  @Min(0)
  size!: number;

  @ApiProperty({ enum: DocumentOwnerType })
  @IsEnum(DocumentOwnerType)
  ownerType!: DocumentOwnerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

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
}

