import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PersonStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListAvrechimQueryDto {
  @ApiPropertyOptional({ description: "Search by first name, last name, national ID, or phone" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: PersonStatus })
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

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
