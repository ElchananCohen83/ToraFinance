import { ApiPropertyOptional } from "@nestjs/swagger";
import { MaritalStatus, PersonStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateAvrechDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  childrenCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @ApiPropertyOptional({ enum: PersonStatus })
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  track?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
