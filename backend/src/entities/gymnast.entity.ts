import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Choreography } from './choreography.entity';

@Entity('gymnasts')
export class Gymnast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  figId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  gender: string;

  @Column()
  country: string;

  @Column({ type: 'date' })
  birthDate: string;

  @Column()
  discipline: string;

  @Column({ default: true })
  isLicensed: boolean;

  @ManyToMany(() => Choreography, choreography => choreography.gymnasts)
  choreographies: Choreography[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 