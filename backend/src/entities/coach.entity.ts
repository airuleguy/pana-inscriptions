import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tournament } from './tournament.entity';

@Entity('coaches')
export class Coach {
  @ApiProperty({ description: 'Unique registration ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'FIG ID of the coach', example: 'COACH123456' })
  @Column({ name: 'fig_id' })
  figId: string;

  @ApiProperty({ description: 'Coach first name', example: 'John' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ description: 'Coach last name', example: 'Smith' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ description: 'Coach full name', example: 'John Smith' })
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty({ description: 'Gender', example: 'MALE' })
  @Column()
  gender: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' })
  @Column()
  country: string;

  @ApiProperty({ description: 'Coach level', example: 'L1, L2' })
  @Column()
  level: string;

  @ApiProperty({ description: 'Level description', example: 'Level 1, Level 2' })
  @Column({ name: 'level_description' })
  levelDescription: string;

  @ApiProperty({ description: 'Tournament the coach is registered for' })
  @ManyToOne(() => Tournament, tournament => tournament.id, { eager: true })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @ApiProperty({ description: 'Registration status', example: 'REGISTERED' })
  @Column({ default: 'REGISTERED' })
  status: string;

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