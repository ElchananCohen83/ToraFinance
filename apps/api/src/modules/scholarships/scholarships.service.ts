import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ScholarshipStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateScholarshipDto } from "./dto/create-scholarship.dto";
import { ListScholarshipsQueryDto } from "./dto/list-scholarships-query.dto";
import { UpdateScholarshipDto } from "./dto/update-scholarship.dto";

const scholarshipInclude = {
  avrech: true,
  documents: {
    orderBy: { createdAt: "desc" }
  }
} satisfies Prisma.ScholarshipInclude;

type ScholarshipWithRelations = Prisma.ScholarshipGetPayload<{ include: typeof scholarshipInclude }>;

@Injectable()
export class ScholarshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ListScholarshipsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const search = query.q?.trim();
    const sortBy = query.sortBy ?? "updatedAt";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.ScholarshipWhereInput = {
      month: query.month,
      year: query.year,
      status: query.status,
      avrechId: query.avrechId,
      OR: search
        ? [
            { notes: { contains: search, mode: "insensitive" } },
            { avrech: { firstName: { contains: search, mode: "insensitive" } } },
            { avrech: { lastName: { contains: search, mode: "insensitive" } } },
            { avrech: { nationalId: { contains: search } } },
            { avrech: { phone: { contains: search } } },
            { avrech: { track: { contains: search, mode: "insensitive" } } }
          ]
        : undefined
    };

    const [scholarships, total] = await this.prisma.$transaction([
      this.prisma.scholarship.findMany({
        where,
        include: scholarshipInclude,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.scholarship.count({ where })
    ]);

    return {
      data: await Promise.all(scholarships.map((scholarship) => this.toDto(scholarship))),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    };
  }

  async findOne(id: string) {
    const scholarship = await this.prisma.scholarship.findUnique({
      where: { id },
      include: scholarshipInclude
    });

    if (!scholarship) {
      throw new NotFoundException("Scholarship not found");
    }

    return this.toDto(scholarship, true);
  }

  async create(dto: CreateScholarshipDto) {
    await this.ensureAvrechExists(dto.avrechId);

    try {
      const scholarship = await this.prisma.scholarship.create({
        data: {
          avrechId: dto.avrechId,
          month: dto.month,
          year: dto.year,
          baseAmount: dto.amount,
          bonusAmount: 0,
          deduction: 0,
          finalAmount: dto.amount,
          status: dto.status ?? ScholarshipStatus.DRAFT,
          notes: dto.notes?.trim() || undefined
        },
        include: scholarshipInclude
      });

      return this.toDto(scholarship, true);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Scholarship already exists for this avrech, month, and year");
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateScholarshipDto) {
    await this.ensureExists(id);

    const scholarship = await this.prisma.scholarship.update({
      where: { id },
      data: {
        baseAmount: dto.amount,
        finalAmount: dto.amount,
        status: dto.status,
        notes: dto.notes?.trim() || undefined
      },
      include: scholarshipInclude
    });

    return this.toDto(scholarship, true);
  }

  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.scholarship.delete({
      where: { id },
      include: scholarshipInclude
    });
  }

  private buildOrderBy(sortBy: NonNullable<ListScholarshipsQueryDto["sortBy"]>, sortOrder: Prisma.SortOrder) {
    if (sortBy === "avrechName") {
      return [{ avrech: { lastName: sortOrder } }, { avrech: { firstName: sortOrder } }] satisfies Prisma.ScholarshipOrderByWithRelationInput[];
    }

    if (sortBy === "amount") {
      return [{ finalAmount: sortOrder }, { updatedAt: "desc" }] satisfies Prisma.ScholarshipOrderByWithRelationInput[];
    }

    return [{ [sortBy]: sortOrder }, { updatedAt: "desc" }] as Prisma.ScholarshipOrderByWithRelationInput[];
  }

  private async ensureAvrechExists(avrechId: string) {
    const avrech = await this.prisma.avrech.findUnique({
      where: { id: avrechId },
      select: { id: true }
    });

    if (!avrech) {
      throw new NotFoundException("Avrech not found");
    }
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.scholarship.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("Scholarship not found");
    }
  }

  private async toDto(scholarship: ScholarshipWithRelations, includeAttendanceRecords = false) {
    const attendance = await this.getAttendance(scholarship.avrechId, scholarship.month, scholarship.year, includeAttendanceRecords);

    return {
      id: scholarship.id,
      avrechId: scholarship.avrechId,
      avrech: scholarship.avrech,
      month: scholarship.month,
      year: scholarship.year,
      amount: Number(scholarship.finalAmount),
      baseAmount: Number(scholarship.baseAmount),
      bonusAmount: Number(scholarship.bonusAmount),
      deduction: Number(scholarship.deduction),
      finalAmount: Number(scholarship.finalAmount),
      status: scholarship.status,
      paidAt: scholarship.paidAt?.toISOString() ?? null,
      bankBatchId: scholarship.bankBatchId,
      notes: scholarship.notes,
      documents: scholarship.documents,
      attendance,
      createdAt: scholarship.createdAt.toISOString(),
      updatedAt: scholarship.updatedAt.toISOString()
    };
  }

  private async getAttendance(avrechId: string, month: number, year: number, includeRecords: boolean) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        avrechId,
        date: {
          gte: monthStart,
          lt: monthEnd
        }
      },
      orderBy: { date: "asc" }
    });

    const present = records.filter((record) => record.present).length;
    const total = records.length;

    return {
      present,
      total,
      rate: total === 0 ? null : Math.round((present / total) * 100),
      records: includeRecords ? records : undefined
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
