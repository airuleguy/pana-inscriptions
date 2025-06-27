import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Gymnast } from './gymnast.entity';
import { Tournament } from './tournament.entity';

export enum ChoreographyCategory {
  YOUTH = 'YOUTH',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR'
}

export enum ChoreographyType {
  MIND = 'MIND',     // Men's Individual (1)
  WIND = 'WIND',     // Women's Individual (1)
  MXP = 'MXP',       // Mixed Pair (2)
  TRIO = 'TRIO',     // Trio 3 (3)
  GRP = 'GRP',       // Group 5 (5)
  DNCE = 'DNCE'      // Dance 8 (8)
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

  @ManyToOne(() => Tournament, tournament => tournament.choreographies, { 
    nullable: false,
    eager: true 
  })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

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