import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ScholarshipStatus } from "@prisma/client";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListScholarshipsQueryDto {
  @ApiPropertyOptional({ description: "Search by avrech name, national ID, phone, track, or notes" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ minimum: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;

  @ApiPropertyOptional({ enum: ScholarshipStatus })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  status?: ScholarshipStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avrechId?: string;

  @ApiPropertyOptional({ default: "updatedAt", enum: ["updatedAt", "amount", "status", "month", "year", "avrechName"] })
  @IsOptional()
  @IsIn(["updatedAt", "amount", "status", "month", "year", "avrechName"])
  sortBy?: "updatedAt" | "amount" | "status" | "month" | "year" | "avrechName" = "updatedAt";

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
