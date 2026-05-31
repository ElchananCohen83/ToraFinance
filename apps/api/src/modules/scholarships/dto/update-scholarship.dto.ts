import { ApiPropertyOptional } from "@nestjs/swagger";
import { ScholarshipStatus } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateScholarshipDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ enum: ScholarshipStatus })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  status?: ScholarshipStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
