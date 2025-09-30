import { Controller, Get, Post, Patch, Param, UseGuards, Query, Request } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { TicketsService } from "./tickets.service"
import { CreateTicketDto, UpdateTicketDto, TicketQueryDto, CreateCommentDto } from "./dto/ticket.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("tickets")
@Controller("tickets")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private ticketsService: TicketsService) { }

  @Post()
  @ApiOperation({ summary: "Create a new ticket" })
  create(createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.id)
  }

  @Get()
  @ApiOperation({ summary: "Get tickets with filtering and pagination" })
  findAll(@Query() query: TicketQueryDto, @Request() req) {
    return this.ticketsService.findAll(query, req.user.id, req.user.role)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get ticket by ID" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.ticketsService.findOne(id, req.user.id, req.user.role)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update ticket" })
  update(@Param("id") id: string, updateTicketDto: UpdateTicketDto, @Request() req) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id, req.user.role)
  }

  @Post(":id/comments")
  @ApiOperation({ summary: "Add comment to ticket" })
  addComment(@Param("id") id: string, createCommentDto: CreateCommentDto, @Request() req) {
    return this.ticketsService.addComment(id, createCommentDto, req.user.id, req.user.role)
  }
}
