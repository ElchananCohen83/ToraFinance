import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ReceiptStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { supportedAccountingSystems } from "./receipt-import.dto";

export class ListReceiptsQueryDto {
  @ApiPropertyOptional({ description: "Search by receipt number, external ID, donor, donation ID, or notes" })
  @IsOptional()
  @IsString()
  q?: string;

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
  donorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ default: "receiptDate", enum: ["receiptDate", "createdAt", "amount", "status", "accountingSystem", "receiptNumber", "donorName"] })
  @IsOptional()
  @IsIn(["receiptDate", "createdAt", "amount", "status", "accountingSystem", "receiptNumber", "donorName"])
  sortBy?: "receiptDate" | "createdAt" | "amount" | "status" | "accountingSystem" | "receiptNumber" | "donorName" = "receiptDate";

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
