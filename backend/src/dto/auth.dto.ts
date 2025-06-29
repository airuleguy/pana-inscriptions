import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class LoginDto {
  @ApiProperty({ 
    description: 'Username for authentication', 
    example: 'usa_delegate' 
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    description: 'Password for authentication', 
    example: 'securePassword123' 
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    description: 'Client IP address', 
    example: '192.168.1.100',
    required: false 
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ 
    description: 'User agent string', 
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false 
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class LoginResponseDto {
  @ApiProperty({ 
    description: 'JWT access token', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  accessToken: string;

  @ApiProperty({ 
    description: 'Token type', 
    example: 'Bearer' 
  })
  tokenType: string;

  @ApiProperty({ 
    description: 'Token expiration time in seconds', 
    example: 2592000 
  })
  expiresIn: number;

  @ApiProperty({ 
    description: 'User information' 
  })
  user: {
    id: string;
    username: string;
    country: string;
    role: UserRole;
    lastLoginAt?: Date;
  };
}

export class LogoutDto {
  @ApiProperty({ 
    description: 'JWT token to revoke', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class JwtPayload {
  @ApiProperty({ description: 'User ID' })
  sub: string; // Subject (user ID)

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Country code' })
  country: string;

  @ApiProperty({ description: 'User role' })
  role: UserRole;

  @ApiProperty({ description: 'JWT ID for session tracking' })
  jti: string; // JWT ID

  @ApiProperty({ description: 'Issued at timestamp' })
  iat: number;

  @ApiProperty({ description: 'Expiration timestamp' })
  exp: number;
}

export class ValidateTokenDto {
  @ApiProperty({ 
    description: 'JWT token to validate', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class TokenValidationResponseDto {
  @ApiProperty({ description: 'Whether the token is valid' })
  isValid: boolean;

  @ApiProperty({ description: 'User information if token is valid', required: false })
  user?: {
    id: string;
    username: string;
    country: string;
    role: UserRole;
  };

  @ApiProperty({ description: 'Error message if token is invalid', required: false })
  error?: string;
} 