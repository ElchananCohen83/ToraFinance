import { Injectable, NotFoundException } from "@nestjs/common";
import { PersonStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAvrechDto } from "./dto/create-avrech.dto";
import { ListAvrechimQueryDto } from "./dto/list-avrechim-query.dto";
import { UpdateAvrechDto } from "./dto/update-avrech.dto";

type AvrechFilters = {
  q?: string;
  status?: PersonStatus;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class AvrechimService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters: AvrechFilters | ListAvrechimQueryDto) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    const search = filters.q?.trim();
    const where: Prisma.AvrechWhereInput = {
      status: filters.status,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { nationalId: { contains: search } },
            { phone: { contains: search } }
          ]
        : undefined
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.avrech.findMany({
        where,
        orderBy: [{ status: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
        include: {
          _count: {
            select: {
              attendanceRecords: true,
              documents: true,
              scholarships: true
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.avrech.count({ where })
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    };
  }

  async findOne(id: string) {
    const avrech = await this.prisma.avrech.findUnique({
      where: { id },
      include: {
        attendanceRecords: {
          orderBy: { date: "desc" },
          take: 30
        },
        documents: {
          orderBy: { createdAt: "desc" }
        },
        scholarships: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 24
        }
      }
    });

    if (!avrech) {
      throw new NotFoundException("Avrech not found");
    }

    return avrech;
  }

  create(dto: CreateAvrechDto) {
    return this.prisma.avrech.create({
      data: {
        ...dto,
        joinedAt: new Date(dto.joinedAt)
      }
    });
  }

  async update(id: string, dto: UpdateAvrechDto) {
    await this.ensureExists(id);

    return this.prisma.avrech.update({
      where: { id },
      data: {
        ...dto,
        joinedAt: dto.joinedAt ? new Date(dto.joinedAt) : undefined
      }
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.avrech.update({
      where: { id },
      data: {
        status: PersonStatus.INACTIVE
      }
    });
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.avrech.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("Avrech not found");
    }
  }
}
