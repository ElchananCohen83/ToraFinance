import { Injectable } from "@nestjs/common";
import { PersonStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAvrechDto } from "./dto/create-avrech.dto";

type AvrechFilters = {
  q?: string;
  status?: PersonStatus;
};

@Injectable()
export class AvrechimService {
  constructor(private readonly prisma: PrismaService) {}

  findMany(filters: AvrechFilters) {
    const where: Prisma.AvrechWhereInput = {
      status: filters.status,
      OR: filters.q
        ? [
            { firstName: { contains: filters.q, mode: "insensitive" } },
            { lastName: { contains: filters.q, mode: "insensitive" } },
            { nationalId: { contains: filters.q } },
            { phone: { contains: filters.q } }
          ]
        : undefined
    };

    return this.prisma.avrech.findMany({
      where,
      orderBy: [{ status: "asc" }, { lastName: "asc" }],
      take: 100
    });
  }

  create(dto: CreateAvrechDto) {
    return this.prisma.avrech.create({
      data: {
        ...dto,
        joinedAt: new Date(dto.joinedAt)
      }
    });
  }
}
