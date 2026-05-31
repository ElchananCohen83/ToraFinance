import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDonationDto } from "./dto/create-donation.dto";

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  findRecent() {
    return this.prisma.donation.findMany({
      include: {
        donor: true,
        receipt: true
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  create(dto: CreateDonationDto) {
    return this.prisma.donation.create({
      data: {
        ...dto,
        pledgeDueDate: dto.pledgeDueDate ? new Date(dto.pledgeDueDate) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined
      }
    });
  }
}
