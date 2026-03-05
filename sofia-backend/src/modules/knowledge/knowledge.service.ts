import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { UpdateCollectionDto } from './dtos/update-collection.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class KnowledgeService {
    constructor(private prisma: PrismaService) { }

    async findAllCollections() {
        // Return all active collections with document counts
        const collections = await this.prisma.collection.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return collections;
    }

    async findCollectionById(id: string, paginationQuery: PaginationQueryDto) {
        const { page = 1, limit = 10 } = paginationQuery;
        const skip = (page - 1) * limit;

        const collection = await this.prisma.collection.findUnique({
            where: { id },
        });

        if (!collection) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }

        // Getting paginated documents
        const [totalDocs, documents] = await this.prisma.$transaction([
            this.prisma.document.count({ where: { collectionId: id } }),
            this.prisma.document.findMany({
                where: { collectionId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    originalFilename: true,
                    fileType: true,
                    status: true,
                    createdAt: true,
                    indexedAt: true,
                    totalChunks: true
                }
            })
        ]);

        return {
            collection,
            documents: {
                data: documents,
                meta: {
                    total: totalDocs,
                    page,
                    limit,
                    totalPages: Math.ceil(totalDocs / limit)
                }
            }
        };
    }

    async createCollection(createDto: CreateCollectionDto) {
        const existingCode = await this.prisma.collection.findUnique({ where: { code: createDto.code } });
        if (existingCode) throw new ConflictException(`Collection code ${createDto.code} already exists`);

        return this.prisma.collection.create({
            data: createDto
        });
    }

    async updateCollection(id: string, updateDto: UpdateCollectionDto) {
        await this.findCollectionById(id, { page: 1, limit: 1 }); // Just to check existence

        if (updateDto.code) {
            const existingCode = await this.prisma.collection.findUnique({ where: { code: updateDto.code } });
            if (existingCode && existingCode.id !== id) {
                throw new ConflictException(`Collection code ${updateDto.code} already exists`);
            }
        }

        return this.prisma.collection.update({
            where: { id },
            data: updateDto
        });
    }
}
