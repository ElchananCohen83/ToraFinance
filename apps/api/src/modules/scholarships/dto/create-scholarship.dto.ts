import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ScholarshipStatus } from "@prisma/client";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateScholarshipDto {
  @ApiProperty()
  @IsString()
  avrechId!: string;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ minimum: 2000 })
  @IsInt()
  @Min(2000)
  year!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ enum: ScholarshipStatus })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  status?: ScholarshipStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
