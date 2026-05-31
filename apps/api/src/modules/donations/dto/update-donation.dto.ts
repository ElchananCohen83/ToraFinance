import { ApiPropertyOptional } from "@nestjs/swagger";
import { DonationStatus, PaymentMethod } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateDonationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ default: "ILS" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: DonationStatus })
  @IsOptional()
  @IsEnum(DonationStatus)
  status?: DonationStatus;

  @ApiPropertyOptional({ description: "Operational notes stored in the existing campaign field" })
  @IsOptional()
  @IsString()
  campaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  pledgeDueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
