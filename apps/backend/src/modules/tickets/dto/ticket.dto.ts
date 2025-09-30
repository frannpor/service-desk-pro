import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsDateString,
} from "class-validator"
import { Transform, Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { TicketStatus, TicketPriority } from "@prisma/client"

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  categoryId: string

  @ApiProperty({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority = TicketPriority.MEDIUM

  @ApiProperty({ description: "Custom field values as JSON object" })
  @IsOptional()
  @IsObject()
  customFieldValues?: Record<string, any> = {}
}

export class UpdateTicketDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: TicketStatus, required: false })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus

  @ApiProperty({ enum: TicketPriority, required: false })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agentId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  customFieldValues?: Record<string, any>

  @ApiProperty({ required: false, description: "For optimistic locking" })
  @IsOptional()
  @IsDateString()
  lastUpdatedAt?: string
}

export class TicketQueryDto {
  @ApiProperty({ required: false, enum: TicketStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TicketStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: TicketStatus[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10
}

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  content: string

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = false
}
