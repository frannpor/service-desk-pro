// auth.controller.ts
import { 
  Controller, 
  Post, 
  UseGuards, 
  Get, 
  Request, 
  Logger, 
  HttpStatus, 
  HttpCode,
  Body,  // IMPORTANTE: Faltaba el decorador @Body
  ValidationPipe,
  UsePipes,
  UnauthorizedException
} from "@nestjs/common"
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth,
  ApiResponse,
  ApiBody 
} from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { LoginDto, RegisterDto } from "./dto/auth.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'REQUESTER'
        },
        token: 'jwt.token.here'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registering new user with email: ${registerDto.email}`)
    return this.authService.register(registerDto)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'REQUESTER'
        },
        token: 'jwt.token.here',
        refreshToken: 'refresh.token.here' // Opcional
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto) { // IMPORTANTE: @Body() decorator
    this.logger.log(`User attempting to login with email: ${loginDto.email}`)
    return this.authService.login(loginDto)
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user profile',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'REQUESTER',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    this.logger.log(`Getting profile for user: ${req.user.email}`)
    
    // Obtener información actualizada del usuario desde la DB
    const user = await this.authService.validateUser(req.user.sub)
    
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'new.jwt.token.here',
        refreshToken: 'new.refresh.token.here'
      }
    }
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    this.logger.log('Refreshing access token')
    return this.authService.refreshToken(refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard) // Añadir guard para obtener el usuario
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged out'
  })
  async logout(@Request() req) {
    const userId = req.user.sub
    this.logger.log(`User ${req.user.email} logged out`)
    
    // Aquí podrías invalidar el token en una blacklist si lo necesitas
    await this.authService.logout(userId)
    
    return {
      success: true,
      message: 'Logged out successfully'
    }
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string', minLength: 8 }
      }
    }
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: { currentPassword: string; newPassword: string }
  ) {
    const userId = req.user.sub
    this.logger.log(`Changing password for user: ${req.user.email}`)
    
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    )
  }
}