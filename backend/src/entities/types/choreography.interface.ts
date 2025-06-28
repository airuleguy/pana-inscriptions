export interface IChoreography {
  id: string;
  name: string;
  country: string;
  category: string;
  type: string;
  gymnastCount: number;
  oldestGymnastAge: number;
  notes?: string;
  tournament: any;
  gymnasts: any[];
  createdAt: Date;
  updatedAt: Date;
} 