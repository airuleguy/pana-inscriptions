import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tournament } from './tournament.entity';
import { RegistrationStatus } from '../constants/registration-status';

@Entity('judges')
export class Judge {
  @ApiProperty({ description: 'Unique registration ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'FIG ID of the judge', example: '3622' })
  @Column({ name: 'fig_id' })
  figId: string;

  @ApiProperty({ description: 'Judge first name', example: 'Reham Abdelraouf Ahmed' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ description: 'Judge last name', example: 'ABDELAAL' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ description: 'Judge full name', example: 'Reham Abdelraouf Ahmed ABDELAAL' })
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty({ description: 'Date of birth', example: '1974-07-29' })
  @Column()
  birth: string;

  @ApiProperty({ description: 'Gender', example: 'FEMALE' })
  @Column()
  gender: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'EGY' })
  @Column()
  country: string;

  @ApiProperty({ description: 'Judge category', example: '3' })
  @Column()
  category: string;

  @ApiProperty({ description: 'Category description', example: 'Category 3' })
  @Column({ name: 'category_description' })
  categoryDescription: string;

  @ApiProperty({ description: 'Tournament the judge is registered for' })
  @ManyToOne(() => Tournament, tournament => tournament.id, { eager: true })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @ApiProperty({ 
    description: 'Registration status', 
    example: 'PENDING',
    enum: RegistrationStatus 
  })
  @Column({ 
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING 
  })
  status: RegistrationStatus;

  @ApiProperty({ description: 'Additional notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Registration date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last modification date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 