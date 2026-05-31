import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DonationStatus, Prisma, ReceiptStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { ListDonationsQueryDto } from "./dto/list-donations-query.dto";
import { UpdateDonationDto } from "./dto/update-donation.dto";

const donationInclude = {
  donor: true,
  receipt: true
} satisfies Prisma.DonationInclude;

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ListDonationsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const search = query.q?.trim();
    const sortOrder = query.sortOrder ?? "desc";
    const sortBy = query.sortBy ?? "createdAt";

    const where: Prisma.DonationWhereInput = {
      donorId: query.donorId,
      status: query.status,
      paymentMethod: query.paymentMethod,
      currency: query.currency?.trim() || undefined,
      createdAt:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
              lte: query.dateTo ? new Date(query.dateTo) : undefined
            }
          : undefined,
      OR: search
        ? [
            { id: { contains: search } },
            { currency: { contains: search, mode: "insensitive" } },
            { campaign: { contains: search, mode: "insensitive" } },
            { donor: { fullName: { contains: search, mode: "insensitive" } } },
            { donor: { email: { contains: search, mode: "insensitive" } } },
            { donor: { phone: { contains: search } } }
          ]
        : undefined
    };

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.donation.findMany({
        where,
        orderBy,
        include: donationInclude,
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.donation.count({ where })
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
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: donationInclude
    });

    if (!donation) {
      throw new NotFoundException("Donation not found");
    }

    return donation;
  }

  async create(dto: CreateDonationDto) {
    await this.ensureDonorExists(dto.donorId);

    return this.prisma.donation.create({
      data: {
        ...dto,
        currency: dto.currency?.trim().toUpperCase() || "ILS",
        campaign: dto.campaign?.trim() || undefined,
        pledgeDueDate: dto.pledgeDueDate ? new Date(dto.pledgeDueDate) : undefined,
        paidAt: this.resolvePaidAt(dto.status, dto.paidAt)
      },
      include: donationInclude
    });
  }

  async update(id: string, dto: UpdateDonationDto) {
    const existing = await this.findOne(id);

    if (dto.donorId) {
      await this.ensureDonorExists(dto.donorId);
    }

    if (this.hasIssuedReceipt(existing.receipt?.status) && this.changesReceiptLockedFields(dto)) {
      throw new BadRequestException("Cannot change donor, amount, currency, or payment method after a receipt is issued");
    }

    return this.prisma.donation.update({
      where: { id },
      data: {
        donorId: dto.donorId,
        amount: dto.amount,
        currency: dto.currency?.trim().toUpperCase(),
        paymentMethod: dto.paymentMethod,
        status: dto.status,
        campaign: dto.campaign?.trim() || undefined,
        pledgeDueDate: dto.pledgeDueDate ? new Date(dto.pledgeDueDate) : undefined,
        paidAt: this.resolvePaidAt(dto.status ?? existing.status, dto.paidAt ?? existing.paidAt?.toISOString())
      },
      include: donationInclude
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.donation.update({
      where: { id },
      data: {
        status: DonationStatus.CANCELLED
      },
      include: donationInclude
    });
  }

  private buildOrderBy(sortBy: NonNullable<ListDonationsQueryDto["sortBy"]>, sortOrder: Prisma.SortOrder) {
    if (sortBy === "donorName") {
      return [{ donor: { fullName: sortOrder } }, { createdAt: "desc" }] satisfies Prisma.DonationOrderByWithRelationInput[];
    }

    return [{ [sortBy]: sortOrder }, { createdAt: "desc" }] as Prisma.DonationOrderByWithRelationInput[];
  }

  private async ensureDonorExists(donorId: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
      select: { id: true }
    });

    if (!donor) {
      throw new BadRequestException("Donor not found");
    }
  }

  private resolvePaidAt(status?: DonationStatus, paidAt?: string) {
    if (paidAt) {
      return new Date(paidAt);
    }

    if (status === DonationStatus.PAID) {
      return new Date();
    }

    return undefined;
  }

  private hasIssuedReceipt(status?: ReceiptStatus) {
    return status === ReceiptStatus.ISSUED || status === ReceiptStatus.SENT;
  }

  private changesReceiptLockedFields(dto: UpdateDonationDto) {
    return dto.donorId !== undefined || dto.amount !== undefined || dto.currency !== undefined || dto.paymentMethod !== undefined;
  }
}
