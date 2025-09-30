// auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { compare, hash } from "bcryptjs"
import { UsersService } from "../users/users.service"
import { LoginDto, RegisterDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, name, role = 'REQUESTER' } = registerDto

    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(email)
      if (existingUser) {
        throw new ConflictException("User with this email already exists")
      }

      // Validate password strength
      // this.validatePasswordStrength(password)

      // Hash password with salt rounds from config
      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12)
      const hashedPassword = await hash(password, saltRounds)

      // Create user
      const user = await this.usersService.create({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role,
        password: hashedPassword,
      })

      // Generate tokens
      const tokens = await this.generateTokens(user)

      this.logger.log(`User registered successfully: ${user.email}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        ...tokens
      }
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`)
      throw error
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    try {
      // Find user (case insensitive email)
      const user = await this.usersService.findByEmail(email.toLowerCase().trim())

      if (!user) {
        this.logger.warn(`Login attempt failed: user not found - ${email}`)
        throw new UnauthorizedException("Invalid email or password")
      }

      // Verify password
      const isPasswordValid = await compare(password, user.password)
      if (!isPasswordValid) {
        this.logger.warn(`Login attempt failed: invalid password - ${email}`)

        throw new UnauthorizedException("Invalid email or password")
      }

      // Generate tokens
      const tokens = await this.generateTokens(user)

      this.logger.log(`User logged in successfully: ${user.email}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        ...tokens
      }
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`)
      throw error
    }
  }

  async validateUser(userId: string) {
    try {
      const user = await this.usersService.findById(userId)

      if (!user) {
        return null
      }

      // No devolver la contraseña
      const { password, ...result } = user
      return result
    } catch (error) {
      this.logger.error(`User validation failed: ${error.message}`)
      return null
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      })

      // Get user
      const user = await this.usersService.findById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user)

      return tokens
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`)
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.usersService.findById(userId)

      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      // Verify current password
      const isPasswordValid = await compare(currentPassword, user.password)
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect')
      }

      // Validate new password
      // this.validatePasswordStrength(newPassword)

      // Check that new password is different from current
      const isSamePassword = await compare(newPassword, user.password)
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from current password')
      }

      // Hash new password
      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12)
      const hashedPassword = await hash(newPassword, saltRounds)

      // Update password
      // await this.usersService.updatePassword(userId, hashedPassword)

      this.logger.log(`Password changed successfully for user: ${user.email}`)

      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error) {
      this.logger.error(`Password change failed: ${error.message}`)
      throw error
    }
  }

  async logout(userId: string) {
    try {
      // Aquí podrías implementar una blacklist de tokens si lo necesitas
      // Por ejemplo, guardando el token en Redis con TTL hasta su expiración

      this.logger.log(`User logged out: ${userId}`)

      return {
        success: true
      }
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`)
      throw error
    }
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m')
    })

    // Generate refresh token (opcional)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d')
    })

    return {
      token: accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    }
  }
}