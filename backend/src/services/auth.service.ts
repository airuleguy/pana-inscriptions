import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { JwtService } from './jwt.service';
import { LoginDto, LoginResponseDto, JwtPayload } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticate user with username and password
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const { username, password, ipAddress, userAgent } = loginDto;

      // Find user by username
      const user = await this.userRepository.findOne({
        where: { username: username.toLowerCase() },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`Login attempt failed for username: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for user: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const { token, jwtId, expiresIn } = await this.jwtService.generateToken(user);

      // Create session record
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      const session = this.sessionRepository.create({
        user,
        jwtId,
        expiresAt,
        ipAddress,
        userAgent,
        isRevoked: false,
      });

      await this.sessionRepository.save(session);

      // Update last login timestamp
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      this.logger.log(`User logged in successfully: ${username} (${user.country})`);

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new BadRequestException('Login failed');
    }
  }

  /**
   * Logout user by revoking session
   */
  async logout(token: string): Promise<{ message: string }> {
    try {
      const jwtId = await this.jwtService.extractJwtId(token);
      if (!jwtId) {
        throw new UnauthorizedException('Invalid token');
      }

      // Find and revoke session
      const session = await this.sessionRepository.findOne({
        where: { jwtId },
        relations: ['user'],
      });

      if (session) {
        session.isRevoked = true;
        await this.sessionRepository.save(session);
        
        this.logger.log(`User logged out: ${session.user.username}`);
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`, error.stack);
      throw new BadRequestException('Logout failed');
    }
  }

  /**
   * Validate JWT token and check session status
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      // Verify JWT signature and expiration
      const payload = await this.jwtService.verifyToken(token);

      // Check if session is still active
      const session = await this.sessionRepository.findOne({
        where: { 
          jwtId: payload.jti,
          isRevoked: false,
        },
        relations: ['user'],
      });

      if (!session) {
        this.logger.warn(`Session not found or revoked for JWT ID: ${payload.jti}`);
        return null;
      }

      // Check if session has expired
      if (session.expiresAt < new Date()) {
        this.logger.warn(`Session expired for user: ${session.user.username}`);
        // Mark session as revoked
        session.isRevoked = true;
        await this.sessionRepository.save(session);
        return null;
      }

      // Check if user is still active
      if (!session.user.isActive) {
        this.logger.warn(`User account inactive: ${session.user.username}`);
        return null;
      }

      return session.user;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id: userId, isActive: true },
      });
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${userId}`, error.stack);
      return null;
    }
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      return await this.sessionRepository.find({
        where: {
          user: { id: userId },
          isRevoked: false,
        },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get user sessions: ${userId}`, error.stack);
      return [];
    }
  }

  /**
   * Revoke all sessions for user
   */
  async revokeAllUserSessions(userId: string): Promise<{ message: string; revokedCount: number }> {
    try {
      const result = await this.sessionRepository
        .createQueryBuilder()
        .update(UserSession)
        .set({ isRevoked: true })
        .where('user_id = :userId AND is_revoked = false', { userId })
        .execute();

      const revokedCount = result.affected || 0;
      this.logger.log(`Revoked ${revokedCount} sessions for user: ${userId}`);

      return {
        message: `Revoked ${revokedCount} active sessions`,
        revokedCount,
      };
    } catch (error) {
      this.logger.error(`Failed to revoke user sessions: ${userId}`, error.stack);
      throw new BadRequestException('Failed to revoke sessions');
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<{ message: string; cleanedCount: number }> {
    try {
      const result = await this.sessionRepository
        .createQueryBuilder()
        .delete()
        .from(UserSession)
        .where('expires_at < :now OR is_revoked = true', { now: new Date() })
        .execute();

      const cleanedCount = result.affected || 0;
      this.logger.log(`Cleaned up ${cleanedCount} expired/revoked sessions`);

      return {
        message: `Cleaned up ${cleanedCount} expired sessions`,
        cleanedCount,
      };
    } catch (error) {
      this.logger.error(`Failed to cleanup expired sessions`, error.stack);
      throw new BadRequestException('Failed to cleanup sessions');
    }
  }

  /**
   * Hash password for storage
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      this.logger.error(`Failed to hash password`, error.stack);
      throw new BadRequestException('Password processing failed');
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      this.logger.error(`Failed to verify password`, error.stack);
      return false;
    }
  }

  /**
   * Get session stats
   */
  async getSessionStats(): Promise<{
    totalActiveSessions: number;
    totalExpiredSessions: number;
    sessionsLast24h: number;
  }> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [totalActive, totalExpired, recent] = await Promise.all([
        this.sessionRepository.count({
          where: { isRevoked: false, expiresAt: { $gt: now } as any },
        }),
        this.sessionRepository.count({
          where: { expiresAt: { $lt: now } as any },
        }),
        this.sessionRepository.count({
          where: { 
            createdAt: { $gt: yesterday } as any,
            isRevoked: false 
          },
        }),
      ]);

      return {
        totalActiveSessions: totalActive,
        totalExpiredSessions: totalExpired,
        sessionsLast24h: recent,
      };
    } catch (error) {
      this.logger.error('Failed to get session stats', error.stack);
      return {
        totalActiveSessions: 0,
        totalExpiredSessions: 0,
        sessionsLast24h: 0,
      };
    }
  }

  /**
   * Create a new session record
   */
  async createSession(
    user: User, 
    jwtId: string, 
    expiresAt: Date, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<UserSession> {
    try {
      const session = this.sessionRepository.create({
        user,
        jwtId,
        expiresAt,
        ipAddress,
        userAgent,
        isRevoked: false,
      });

      await this.sessionRepository.save(session);
      this.logger.log(`Created new session for user: ${user.username}`);
      
      return session;
    } catch (error) {
      this.logger.error(`Failed to create session for user: ${user.username}`, error.stack);
      throw new Error('Failed to create user session');
    }
  }
} 