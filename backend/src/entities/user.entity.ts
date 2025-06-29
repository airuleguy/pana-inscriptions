import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserSession } from './user-session.entity';

export enum UserRole {
  DELEGATE = 'DELEGATE',
  ADMIN = 'ADMIN'
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique user ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username for login', example: 'usa_delegate' })
  @Column({ unique: true })
  @Index()
  username: string;

  @ApiProperty({ description: 'Hashed password', writeOnly: true })
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' })
  @Column()
  @Index()
  country: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.DELEGATE })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DELEGATE
  })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user account is active', example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last successful login timestamp' })
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'User sessions' })
  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @ApiProperty({ description: 'Account creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last modification date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 