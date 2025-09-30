import { IsEmail, IsString, IsEnum, IsOptional } from "class-validator"
import { UserRole } from "@prisma/client"

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  name: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.REQUESTER
}
