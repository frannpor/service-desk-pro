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
      customFields: createCategoryDto.customFields ? JSON.stringify(createCategoryDto.customFields) : undefined,
    }
    return this.prisma.category.create({ data })
  }

  private processCustomFields(customFields?: CustomFieldDto[]): Prisma.InputJsonValue | undefined {
    if (customFields) {
      return JSON.stringify(customFields)
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // TODO: Fix this type issue
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
    const category = await this.findOne(id)

    const customFields = this.processCustomFields(updateCategoryDto.customFields)

    return this.prisma.category.update({
      where: { id },
      data: { ...updateCategoryDto, customFields },
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
