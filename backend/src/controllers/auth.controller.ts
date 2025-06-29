import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Req, 
  Headers,
  Logger,
  Delete,
  Param,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiHeader,
  ApiBody
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserEntity } from '../entities/user.entity';
import { 
  LoginDto, 
  LoginResponseDto, 
  LogoutDto, 
  ValidateTokenDto, 
  TokenValidationResponseDto 
} from '../dto/auth.dto';
import { JwtService } from '../services/jwt.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Authenticate user', 
    description: 'Login with username and password to receive JWT token' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful', 
    type: LoginResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    try {
      // Extract IP and User-Agent from request if not provided in DTO
      const ipAddress = loginDto.ipAddress || request.ip || request.socket.remoteAddress;
      const userAgent = loginDto.userAgent || request.get('User-Agent');

      const loginData = {
        ...loginDto,
        ipAddress,
        userAgent,
      };

      const result = await this.authService.login(loginData);
      
      this.logger.log(`Login successful for user: ${loginDto.username}`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed for user: ${loginDto.username}`, error.stack);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout user', 
    description: 'Revoke JWT token and end session' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async logout(@Headers('authorization') authHeader: string): Promise<{ message: string }> {
    try {
      // Extract token from Authorization header
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const result = await this.authService.logout(token);
      this.logger.log('User logged out successfully');
      return result;
    } catch (error) {
      this.logger.error('Logout failed', error.stack);
      throw error;
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validate JWT token', 
    description: 'Check if JWT token is valid and return user information' 
  })
  @ApiBody({ type: ValidateTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token validation result', 
    type: TokenValidationResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  async validateToken(
    @Body(ValidationPipe) validateTokenDto: ValidateTokenDto
  ): Promise<TokenValidationResponseDto> {
    try {
      const user = await this.authService.validateToken(validateTokenDto.token);
      
      if (user) {
        return {
          isValid: true,
          user: {
            id: user.id,
            username: user.username,
            country: user.country,
            role: user.role,
          },
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid or expired token',
        };
      }
    } catch (error) {
      this.logger.error('Token validation error', error.stack);
      return {
        isValid: false,
        error: 'Token validation failed',
      };
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user', 
    description: 'Get information about the currently authenticated user' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        country: { type: 'string' },
        role: { type: 'string' },
        lastLoginAt: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async getCurrentUser(@Req() request: Request): Promise<Omit<UserEntity, 'passwordHash' | 'sessions'>> {
    const user = request.user as UserEntity;
    this.logger.log(`Getting current user info for: ${user.username}`);
    
    const { passwordHash, sessions, ...userInfo } = user;
    return userInfo;
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user sessions', 
    description: 'Get all active sessions for the current user' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User sessions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          jwtId: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async getUserSessions(@Req() request: Request) {
    const user = request.user!; // AuthGuard ensures user exists
    return await this.authService.getUserSessions(user.id);
  }

  @Delete('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Revoke all sessions', 
    description: 'Revoke all active sessions for the current user' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sessions revoked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        revokedCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async revokeAllSessions(@Req() request: Request) {
    const user = request.user!; // AuthGuard ensures user exists
    return await this.authService.revokeAllUserSessions(user.id);
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get session statistics', 
    description: 'Get system-wide session statistics (admin only in future)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Session statistics',
    schema: {
      type: 'object',
      properties: {
        totalActiveSessions: { type: 'number' },
        totalExpiredSessions: { type: 'number' },
        sessionsLast24h: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async getSessionStats() {
    return await this.authService.getSessionStats();
  }

  @Post('cleanup')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Cleanup expired sessions', 
    description: 'Remove expired and revoked sessions from database (admin only in future)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cleanup completed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        cleanedCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async cleanupSessions() {
    return await this.authService.cleanupExpiredSessions();
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Refresh JWT token', 
    description: 'Get a new JWT token using the current valid token' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully', 
    type: LoginResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async refreshToken(@Req() request: Request): Promise<LoginResponseDto> {
    try {
      const user = request.user as UserEntity;
      const authHeader = request.headers.authorization;
      const currentToken = authHeader?.split(' ')[1];
      
      if (!currentToken) {
        throw new Error('No token provided');
      }

      // Revoke the current session
      await this.authService.logout(currentToken);
      
      // Generate a new token
      const { token, jwtId, expiresIn } = await this.jwtService.generateToken(user);
      
      // Create new session record
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      const ipAddress = request.ip || request.socket.remoteAddress;
      const userAgent = request.get('User-Agent');
      
      const loginData = {
        username: user.username,
        password: '', // Not needed for refresh
        ipAddress,
        userAgent,
      };
      
      // Create session record directly
      const session = await this.authService.createSession(user, jwtId, expiresAt, ipAddress, userAgent);
      
      this.logger.log(`Token refreshed for user: ${user.username}`);
      
      return {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn,
        user: {
          id: user.id,
          username: user.username,
          country: user.country,
          role: user.role,
          lastLoginAt: user.lastLoginAt,
        },
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error.stack);
      throw error;
    }
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Verify JWT token', 
    description: 'Verify that the current JWT token is valid and return user information' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid', 
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        country: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        lastLoginAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  async verifyToken(@Req() request: Request): Promise<Omit<UserEntity, 'passwordHash' | 'sessions'>> {
    const user = request.user as UserEntity;
    this.logger.log(`Token verified for user: ${user.username}`);
    
    const { passwordHash, sessions, ...userInfo } = user;
    return userInfo;
  }
} 