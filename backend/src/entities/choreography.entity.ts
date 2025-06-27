import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Gymnast } from './gymnast.entity';

export enum ChoreographyCategory {
  YOUTH = 'Youth',
  JUNIOR = 'Junior',
  SENIOR = 'Senior'
}

export enum ChoreographyType {
  INDIVIDUAL = 'Individual',
  MIXED_PAIR = 'Mixed Pair',
  TRIO = 'Trio',
  GROUP = 'Group',
  PLATFORM = 'Platform'
}

@Entity('choreographies')
export class Choreography {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({
    type: 'enum',
    enum: ChoreographyCategory
  })
  category: ChoreographyCategory;

  @Column({
    type: 'enum',
    enum: ChoreographyType
  })
  type: ChoreographyType;

  @Column({ type: 'integer' })
  gymnastCount: number;

  @Column({ type: 'integer' })
  oldestGymnastAge: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToMany(() => Gymnast, gymnast => gymnast.choreographies, { 
    cascade: true,
    eager: true 
  })
  @JoinTable({
    name: 'choreography_gymnasts',
    joinColumn: {
      name: 'choreography_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'gymnast_id',
      referencedColumnName: 'id'
    }
  })
  gymnasts: Gymnast[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 