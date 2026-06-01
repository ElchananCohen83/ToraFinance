import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DocumentOwnerType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { ListDocumentsQueryDto } from "./dto/list-documents-query.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { FILE_STORAGE_PROVIDER, FileStorageProvider } from "./storage/file-storage-provider.interface";

const documentInclude = {
  avrech: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      nationalId: true,
      phone: true
    }
  },
  donor: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true
    }
  },
  donation: {
    include: {
      donor: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  },
  scholarship: {
    include: {
      avrech: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  }
} satisfies Prisma.DocumentInclude;

type DocumentWithRelations = Prisma.DocumentGetPayload<{ include: typeof documentInclude }>;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE_PROVIDER) private readonly storageProvider: FileStorageProvider
  ) {}

  async findMany(query: ListDocumentsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const search = query.q?.trim();
    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.DocumentWhereInput = {
      ownerType: query.ownerType,
      ...this.buildEntityFilters(query),
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { fileName: { contains: search, mode: "insensitive" } },
            { mimeType: { contains: search, mode: "insensitive" } },
            { avrech: { firstName: { contains: search, mode: "insensitive" } } },
            { avrech: { lastName: { contains: search, mode: "insensitive" } } },
            { avrech: { nationalId: { contains: search } } },
            { donor: { fullName: { contains: search, mode: "insensitive" } } },
            { donor: { email: { contains: search, mode: "insensitive" } } },
            { donation: { donor: { fullName: { contains: search, mode: "insensitive" } } } },
            { scholarship: { avrech: { firstName: { contains: search, mode: "insensitive" } } } },
            { scholarship: { avrech: { lastName: { contains: search, mode: "insensitive" } } } }
          ]
        : undefined
    };

    const [documents, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        include: documentInclude,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.document.count({ where })
    ]);

    return {
      data: documents.map((document) => this.toDto(document)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: documentInclude
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return this.toDto(document);
  }

  async create(dto: CreateDocumentDto) {
    await this.validateOwner(dto.ownerType, dto);
    const fileUrl = dto.fileUrl.trim();

    const document = await this.prisma.document.create({
      data: {
        title: dto.title?.trim() || dto.fileName.trim(),
        fileName: dto.fileName.trim(),
        fileUrl,
        mimeType: dto.mimeType.trim(),
        size: dto.size,
        storageKey: this.storageProvider.resolveStorageKey(fileUrl),
        ownerType: dto.ownerType,
        avrechId: dto.ownerType === DocumentOwnerType.AVRECH ? dto.avrechId : undefined,
        donorId: dto.ownerType === DocumentOwnerType.DONOR ? dto.donorId : undefined,
        donationId: dto.ownerType === DocumentOwnerType.DONATION ? dto.donationId : undefined,
        scholarshipId: dto.ownerType === DocumentOwnerType.SCHOLARSHIP ? dto.scholarshipId : undefined
      },
      include: documentInclude
    });

    return this.toDto(document);
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const existing = await this.prisma.document.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException("Document not found");
    }

    const ownerType = dto.ownerType ?? existing.ownerType;
    const ownerPayload = {
      avrechId: dto.avrechId ?? existing.avrechId ?? undefined,
      donorId: dto.donorId ?? existing.donorId ?? undefined,
      donationId: dto.donationId ?? existing.donationId ?? undefined,
      scholarshipId: dto.scholarshipId ?? existing.scholarshipId ?? undefined
    };

    await this.validateOwner(ownerType, ownerPayload);

    const fileUrl = dto.fileUrl?.trim();

    const document = await this.prisma.document.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        fileName: dto.fileName?.trim(),
        fileUrl,
        mimeType: dto.mimeType?.trim(),
        size: dto.size,
        storageKey: fileUrl ? this.storageProvider.resolveStorageKey(fileUrl) : undefined,
        ownerType,
        avrechId: ownerType === DocumentOwnerType.AVRECH ? ownerPayload.avrechId : null,
        donorId: ownerType === DocumentOwnerType.DONOR ? ownerPayload.donorId : null,
        donationId: ownerType === DocumentOwnerType.DONATION ? ownerPayload.donationId : null,
        scholarshipId: ownerType === DocumentOwnerType.SCHOLARSHIP ? ownerPayload.scholarshipId : null
      },
      include: documentInclude
    });

    return this.toDto(document);
  }

  async remove(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      select: { id: true, storageKey: true }
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    await this.storageProvider.deleteObject(document.storageKey);

    return this.prisma.document.delete({
      where: { id }
    });
  }

  private buildEntityFilters(query: ListDocumentsQueryDto): Prisma.DocumentWhereInput {
    const relatedEntityId = query.relatedEntityId?.trim();

    return {
      avrechId: query.avrechId ?? (query.ownerType === DocumentOwnerType.AVRECH ? relatedEntityId : undefined),
      donorId: query.donorId ?? (query.ownerType === DocumentOwnerType.DONOR ? relatedEntityId : undefined),
      donationId: query.donationId ?? (query.ownerType === DocumentOwnerType.DONATION ? relatedEntityId : undefined),
      scholarshipId: query.scholarshipId ?? (query.ownerType === DocumentOwnerType.SCHOLARSHIP ? relatedEntityId : undefined)
    };
  }

  private buildOrderBy(sortBy: NonNullable<ListDocumentsQueryDto["sortBy"]>, sortOrder: Prisma.SortOrder) {
    return [{ [sortBy]: sortOrder }, { createdAt: "desc" }] as Prisma.DocumentOrderByWithRelationInput[];
  }

  private async validateOwner(ownerType: DocumentOwnerType, payload: Pick<CreateDocumentDto, "avrechId" | "donorId" | "donationId" | "scholarshipId">) {
    if (ownerType === DocumentOwnerType.AVRECH) {
      return this.ensureEntityExists("avrech", payload.avrechId, "Avrech not found");
    }

    if (ownerType === DocumentOwnerType.DONOR) {
      return this.ensureEntityExists("donor", payload.donorId, "Donor not found");
    }

    if (ownerType === DocumentOwnerType.DONATION) {
      return this.ensureEntityExists("donation", payload.donationId, "Donation not found");
    }

    if (ownerType === DocumentOwnerType.SCHOLARSHIP) {
      return this.ensureEntityExists("scholarship", payload.scholarshipId, "Scholarship not found");
    }

    throw new BadRequestException("Document owner type is not supported by the current schema");
  }

  private async ensureEntityExists(model: "avrech" | "donor" | "donation" | "scholarship", id: string | undefined, notFoundMessage: string) {
    if (!id) {
      throw new BadRequestException(`Missing ${model} id for document owner`);
    }

    const count = await this.countOwnerRecords(model, id);

    if (count === 0) {
      throw new BadRequestException(notFoundMessage);
    }
  }

  private countOwnerRecords(model: "avrech" | "donor" | "donation" | "scholarship", id: string) {
    if (model === "avrech") {
      return this.prisma.avrech.count({ where: { id } });
    }

    if (model === "donor") {
      return this.prisma.donor.count({ where: { id } });
    }

    if (model === "donation") {
      return this.prisma.donation.count({ where: { id } });
    }

    return this.prisma.scholarship.count({ where: { id } });
  }

  private toDto(document: DocumentWithRelations) {
    const fileUrl = document.fileUrl ?? this.storageProvider.getPublicUrl(document.storageKey);

    return {
      id: document.id,
      fileName: document.fileName,
      fileUrl,
      mimeType: document.mimeType,
      size: document.size,
      ownerType: document.ownerType,
      avrechId: document.avrechId,
      donorId: document.donorId,
      donationId: document.donationId,
      scholarshipId: document.scholarshipId,
      title: document.title,
      storageKey: document.storageKey,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      relatedEntity: this.resolveRelatedEntity(document),
      avrech: document.avrech,
      donor: document.donor,
      donation: document.donation,
      scholarship: document.scholarship
    };
  }

  private resolveRelatedEntity(document: DocumentWithRelations) {
    if (document.ownerType === DocumentOwnerType.AVRECH && document.avrech) {
      return {
        type: document.ownerType,
        id: document.avrech.id,
        label: `${document.avrech.firstName} ${document.avrech.lastName}`
      };
    }

    if (document.ownerType === DocumentOwnerType.DONOR && document.donor) {
      return {
        type: document.ownerType,
        id: document.donor.id,
        label: document.donor.fullName
      };
    }

    if (document.ownerType === DocumentOwnerType.DONATION && document.donation) {
      return {
        type: document.ownerType,
        id: document.donation.id,
        label: `Donation ${document.donation.id.slice(-8).toUpperCase()}`
      };
    }

    if (document.ownerType === DocumentOwnerType.SCHOLARSHIP && document.scholarship) {
      return {
        type: document.ownerType,
        id: document.scholarship.id,
        label: `${document.scholarship.avrech.firstName} ${document.scholarship.avrech.lastName} - ${document.scholarship.month}/${document.scholarship.year}`
      };
    }

    return null;
  }
}
