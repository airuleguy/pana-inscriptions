import { Injectable } from '@nestjs/common';
import { BusinessRulesStrategy } from './base-business-rules.interface';
import { CampeonatoPanamericanoStrategy } from './campeonato-panamericano-strategy';
import { CopaPanamericanaStrategy } from './copa-panamericana-strategy';
import { TournamentType } from '../../entities/tournament.entity';

@Injectable()
export class BusinessRulesFactory {
  private strategies: Map<TournamentType, BusinessRulesStrategy> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    const campeonatoStrategy = new CampeonatoPanamericanoStrategy();
    const copaStrategy = new CopaPanamericanaStrategy();

    this.strategies.set(campeonatoStrategy.getTournamentType(), campeonatoStrategy);
    this.strategies.set(copaStrategy.getTournamentType(), copaStrategy);
  }

  getStrategy(tournamentType: TournamentType): BusinessRulesStrategy {
    const strategy = this.strategies.get(tournamentType);
    if (!strategy) {
      throw new Error(`No business rules strategy found for tournament type: ${tournamentType}`);
    }
    return strategy;
  }

  getAllStrategies(): BusinessRulesStrategy[] {
    return Array.from(this.strategies.values());
  }

  getSupportedTournamentTypes(): TournamentType[] {
    return Array.from(this.strategies.keys());
  }
} 