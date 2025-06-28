import { TournamentType } from '../tournament.entity';

export interface ITournament {
  id: string;
  name: string;
  shortName: string;
  type: TournamentType;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  isActive: boolean;
  choreographies?: any[];
  createdAt: Date;
  updatedAt: Date;
} 