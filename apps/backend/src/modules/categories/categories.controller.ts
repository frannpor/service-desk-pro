import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body, Query } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiBody } from "@nestjs/swagger"
import { CategoriesService } from "./categories.service"
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@ApiTags("categories")
@Controller("categories")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: "Create a new category (Manager only)", description: "" })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiQuery({ name: "includeInactive", required: false, type: Boolean, description: "Include inactive categories" })
  findAll(@Query("includeInactive") includeInactive?: string) {
    return this.categoriesService.findAll(includeInactive === "true")
  }

  @Get(":id")
  @ApiOperation({ summary: "Get category by ID" })
  findOne(@Param("id") id: string) {
    return this.categoriesService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: "Update category (Manager only)" })
  update(@Param("id") id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: "Deactivate category (Manager only)" })
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(id)
  }
}
