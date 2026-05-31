import { ApiPropertyOptional } from "@nestjs/swagger";
import { ReceiptStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { supportedAccountingSystems } from "./receipt-import.dto";

export class UpdateReceiptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ enum: ReceiptStatus })
  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;

  @ApiPropertyOptional({ enum: supportedAccountingSystems })
  @IsOptional()
  @IsIn(supportedAccountingSystems)
  accountingSystem?: string;

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
