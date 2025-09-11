import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tournament } from './tournament.entity';
import { RegistrationStatus } from '../constants/registration-status';

@Entity('support_staff')
export class SupportStaff {
  @ApiProperty({ description: 'Unique registration ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'First name', example: 'Jane' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ description: 'Full name', example: 'Jane Doe' })
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty({ description: 'Role within delegation (e.g., DELEGATE, MEDICAL, PHYSIO, MANAGER, OTHER)' })
  @Column({ name: 'role' })
  role: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'URU' })
  @Column()
  country: string;

  @ApiProperty({ description: 'Club name (optional for country-level tournaments)', example: 'Elite Gymnastics Club', required: false })
  @Column({ nullable: true })
  club?: string;

  @ApiProperty({ description: 'Tournament the support staff is registered for' })
  @ManyToOne(() => Tournament, tournament => tournament.id, { eager: true })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @ApiProperty({ description: 'Registration status', enum: RegistrationStatus, example: 'PENDING' })
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    enumName: 'registration_status_enum',
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @ApiProperty({ description: 'Registration date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last modification date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


