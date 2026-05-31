import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { DonationStatus, PaymentMethod } from "@prisma/client";
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListDonationsQueryDto {
  @ApiPropertyOptional({ description: "Search by donation ID, donor name, donor contact, currency, or notes" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: DonationStatus })
  @IsOptional()
  @IsEnum(DonationStatus)
  status?: DonationStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ default: "createdAt", enum: ["createdAt", "amount", "status", "paymentMethod", "donorName"] })
  @IsOptional()
  @IsIn(["createdAt", "amount", "status", "paymentMethod", "donorName"])
  sortBy?: "createdAt" | "amount" | "status" | "paymentMethod" | "donorName" = "createdAt";

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
