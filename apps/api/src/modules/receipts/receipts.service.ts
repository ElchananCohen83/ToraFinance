import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Receipt, ReceiptStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ListReceiptsQueryDto } from "./dto/list-receipts-query.dto";
import { ReceiptExportDto } from "./dto/receipt-export.dto";
import { ReceiptImportDto } from "./dto/receipt-import.dto";
import { UpdateReceiptDto } from "./dto/update-receipt.dto";

const receiptInclude = {
  donor: true,
  donation: {
    include: {
      donor: true
    }
  }
} satisfies Prisma.ReceiptInclude;

type ReceiptWithRelations = Prisma.ReceiptGetPayload<{ include: typeof receiptInclude }>;

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ListReceiptsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const search = query.q?.trim();
    const sortBy = query.sortBy ?? "receiptDate";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.ReceiptWhereInput = {
      donationId: query.donationId,
      donorId: query.donorId,
      status: query.status,
      accountingSystem: query.accountingSystem,
      receiptDate:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
              lte: query.dateTo ? new Date(query.dateTo) : undefined
            }
          : undefined,
      OR: search
        ? [
            { number: { contains: search, mode: "insensitive" } },
            { externalReceiptId: { contains: search, mode: "insensitive" } },
            { notes: { contains: search, mode: "insensitive" } },
            { donationId: { contains: search } },
            { donor: { fullName: { contains: search, mode: "insensitive" } } },
            { donor: { email: { contains: search, mode: "insensitive" } } },
            { donor: { phone: { contains: search } } }
          ]
        : undefined
    };

    const [receipts, total] = await this.prisma.$transaction([
      this.prisma.receipt.findMany({
        where,
        include: receiptInclude,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.receipt.count({ where })
    ]);

    return {
      data: receipts.map((receipt) => this.toDto(receipt)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    };
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: receiptInclude
    });

    if (!receipt) {
      throw new NotFoundException("Receipt not found");
    }

    return this.toDto(receipt);
  }

  async create(dto: ReceiptImportDto) {
    const donation = await this.prisma.donation.findUnique({
      where: { id: dto.donationId },
      include: { donor: true, receipt: true }
    });

    if (!donation) {
      throw new BadRequestException("Donation not found");
    }

    if (donation.receipt) {
      throw new ConflictException("Donation already has a receipt");
    }

    if (dto.donorId && dto.donorId !== donation.donorId) {
      throw new BadRequestException("Receipt donor must match the donation donor");
    }

    const receipt = await this.prisma.receipt.create({
      data: {
        donationId: donation.id,
        donorId: donation.donorId,
        number: dto.receiptNumber.trim(),
        receiptDate: new Date(dto.receiptDate),
        amount: dto.amount,
        status: dto.status ?? ReceiptStatus.ISSUED,
        accountingSystem: dto.accountingSystem,
        externalReceiptId: dto.externalReceiptId?.trim() || undefined,
        fileUrl: dto.pdfUrl?.trim() || undefined,
        notes: dto.notes?.trim() || undefined,
        issuedAt: dto.status === ReceiptStatus.DRAFT ? undefined : new Date(dto.receiptDate)
      },
      include: receiptInclude
    });

    return this.toDto(receipt);
  }

  async update(id: string, dto: UpdateReceiptDto) {
    await this.ensureExists(id);

    const receipt = await this.prisma.receipt.update({
      where: { id },
      data: {
        number: dto.receiptNumber?.trim(),
        receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : undefined,
        amount: dto.amount,
        status: dto.status,
        accountingSystem: dto.accountingSystem,
        externalReceiptId: dto.externalReceiptId?.trim() || undefined,
        fileUrl: dto.pdfUrl?.trim() || undefined,
        notes: dto.notes?.trim() || undefined,
        issuedAt: dto.receiptDate && dto.status !== ReceiptStatus.DRAFT ? new Date(dto.receiptDate) : undefined
      },
      include: receiptInclude
    });

    return this.toDto(receipt);
  }

  async remove(id: string) {
    await this.ensureExists(id);

    const receipt = await this.prisma.receipt.update({
      where: { id },
      data: {
        status: ReceiptStatus.CANCELLED
      },
      include: receiptInclude
    });

    return this.toDto(receipt);
  }

  private buildOrderBy(sortBy: NonNullable<ListReceiptsQueryDto["sortBy"]>, sortOrder: Prisma.SortOrder) {
    if (sortBy === "donorName") {
      return [{ donor: { fullName: sortOrder } }, { receiptDate: "desc" }] satisfies Prisma.ReceiptOrderByWithRelationInput[];
    }

    if (sortBy === "receiptNumber") {
      return [{ number: sortOrder }, { receiptDate: "desc" }] satisfies Prisma.ReceiptOrderByWithRelationInput[];
    }

    return [{ [sortBy]: sortOrder }, { createdAt: "desc" }] as Prisma.ReceiptOrderByWithRelationInput[];
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.receipt.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("Receipt not found");
    }
  }

  private toDto(receipt: ReceiptWithRelations): ReceiptExportDto & {
    donor: ReceiptWithRelations["donor"];
    donation: ReceiptWithRelations["donation"];
  } {
    return {
      id: receipt.id,
      donationId: receipt.donationId,
      donorId: receipt.donorId,
      receiptNumber: receipt.number,
      receiptDate: receipt.receiptDate.toISOString(),
      amount: this.toNumber(receipt),
      status: receipt.status,
      accountingSystem: receipt.accountingSystem,
      externalReceiptId: receipt.externalReceiptId,
      pdfUrl: receipt.fileUrl,
      notes: receipt.notes,
      createdAt: receipt.createdAt.toISOString(),
      updatedAt: receipt.updatedAt.toISOString(),
      donor: receipt.donor,
      donation: receipt.donation
    };
  }

  private toNumber(receipt: Pick<Receipt, "amount">) {
    return Number(receipt.amount);
  }
}
