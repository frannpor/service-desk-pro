import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export class CustomFieldDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ enum: ["text", "textarea", "select", "multiselect", "number", "date"] })
  @IsString()
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "date"

  @ApiProperty()
  @IsBoolean()
  required: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeholder?: string
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: "First response SLA in minutes" })
  @IsInt()
  @Min(1)
  firstResponseSLA: number

  @ApiProperty({ description: "Resolution SLA in minutes" })
  @IsInt()
  @Min(1)
  resolutionSLA: number

  @ApiProperty({ type: [CustomFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields: CustomFieldDto[]

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  firstResponseSLA?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  resolutionSLA?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields?: CustomFieldDto[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
