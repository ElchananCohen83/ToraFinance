import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReceiptStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export const supportedAccountingSystems = ["PRIORITY", "HASHAVSHEVET", "SAP_BUSINESS_ONE", "RIVHIT", "OTHER"] as const;

export type AccountingSystem = (typeof supportedAccountingSystems)[number];

export class ReceiptImportDto {
  @ApiProperty()
  @IsString()
  donationId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donorId?: string;

  @ApiProperty()
  @IsString()
  receiptNumber!: string;

  @ApiProperty()
  @IsDateString()
  receiptDate!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ enum: ReceiptStatus })
  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;

  @ApiProperty({ enum: supportedAccountingSystems })
  @IsIn(supportedAccountingSystems)
  accountingSystem!: AccountingSystem;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalReceiptId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
