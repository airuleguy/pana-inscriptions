import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Choreography } from './choreography.entity';

export enum TournamentType {
  CAMPEONATO_PANAMERICANO = 'CAMPEONATO_PANAMERICANO',
  COPA_PANAMERICANA = 'COPA_PANAMERICANA'
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column({
    type: 'enum',
    enum: TournamentType
  })
  type: TournamentType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  location: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Choreography, choreography => choreography.tournament)
  choreographies: Choreography[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 