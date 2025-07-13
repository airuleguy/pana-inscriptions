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
  fullName: string;

  @Column()
  gender: 'MALE' | 'FEMALE';

  @Column()
  country: string;

  @Column({ type: 'timestamp' })
  dateOfBirth: Date;

  @Column()
  discipline: string;

  @Column({ default: true })
  licenseValid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  licenseExpiryDate: Date;

  @Column({ type: 'int' })
  age: number;

  @Column()
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';

  @Column({ default: false })
  isLocal: boolean;

  @ManyToMany(() => Choreography, choreography => choreography.gymnasts)
  choreographies: Choreography[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 