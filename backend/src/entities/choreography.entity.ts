import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Gymnast } from './gymnast.entity';
import { ITournament } from './types/tournament.interface';
import { ChoreographyCategory, ChoreographyType } from '../constants/categories';

// Re-export for backward compatibility
export { ChoreographyCategory, ChoreographyType };

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

  @ManyToOne('Tournament', 'choreographies', { 
    nullable: false,
    eager: true 
  })
  @JoinColumn({ name: 'tournament_id' })
  tournament: ITournament;

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