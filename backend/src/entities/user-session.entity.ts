import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @ApiProperty({ description: 'Unique session ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User who owns this session' })
  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'JWT token identifier (jti claim)', example: 'abc123-def456-ghi789' })
  @Column({ name: 'jwt_id', unique: true })
  @Index()
  jwtId: string;

  @ApiProperty({ description: 'Session expiration timestamp' })
  @Column({ name: 'expires_at', type: 'timestamp' })
  @Index()
  expiresAt: Date;

  @ApiProperty({ description: 'Whether the session has been revoked', example: false })
  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ApiProperty({ description: 'IP address from which the session was created' })
  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string from the client' })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Session creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 