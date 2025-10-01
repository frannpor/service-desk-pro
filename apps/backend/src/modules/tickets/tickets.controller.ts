import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { TicketsService } from "./tickets.service"
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketQueryDto,
  CreateCommentDto
} from "./dto/ticket.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("tickets")
@Controller("tickets")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private ticketsService: TicketsService) { }

  @Post()
  @ApiOperation({ summary: "Create a new ticket" })
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() req: any
  ) {
    return this.ticketsService.create(createTicketDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: "Get tickets with filtering and pagination" })
  findAll(
    @Query() query: TicketQueryDto,
    @Req() req: any
  ) {
    return this.ticketsService.findAll(query, req.user.id, req.user.role)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get ticket by ID" })
  findOne(
    @Param("id") id: string,
    @Req() req: any
  ) {
    return this.ticketsService.findOne(id, req.user.id, req.user.role)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update ticket" })
  update(
    @Param("id") id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req: any
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id, req.user.role)
  }

  @Post(":id/comments")
  @ApiOperation({ summary: "Add comment to ticket" })
  addComment(
    @Param("id") id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any
  ) {
    return this.ticketsService.addComment(id, createCommentDto, req.user.id, req.user.role)
  }
}