import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { CreateCategoryDto, UpdateCategoryDto, CustomFieldDto } from "./dto/category.dto"
import { Prisma } from "@prisma/client"

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const data: Prisma.CategoryCreateInput = {
      ...createCategoryDto,
      customFields: createCategoryDto.customFields as unknown as Prisma.InputJsonValue,
    }
    return this.prisma.category.create({ data })
  }

  async findAll(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: "asc" },
    })
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException("Category not found")
    }

    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id) // Verificar que existe

    const data: Prisma.CategoryUpdateInput = {
      ...updateCategoryDto,
      // Si hay customFields, castea el tipo; si no, undefined
      customFields: updateCategoryDto.customFields 
        ? (updateCategoryDto.customFields as unknown as Prisma.InputJsonValue)
        : undefined,
    }

    return this.prisma.category.update({
      where: { id },
      data,
    })
  }

  async remove(id: string) {
    const category = await this.findOne(id)

    // Soft delete - set as inactive
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    })
  }
}
