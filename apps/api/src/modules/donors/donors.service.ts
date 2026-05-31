import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDonorDto } from "./dto/create-donor.dto";

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  findMany(q?: string) {
    const where: Prisma.DonorWhereInput = q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { city: { contains: q, mode: "insensitive" } }
          ]
        }
      : {};

    return this.prisma.donor.findMany({
      where,
      orderBy: { fullName: "asc" },
      take: 100
    });
  }

  create(dto: CreateDonorDto) {
    return this.prisma.donor.create({ data: dto });
  }
}
