import { BusinessRulesStrategy } from './base-business-rules.interface';
import { TournamentType } from '../../entities/tournament.entity';
export declare class BusinessRulesFactory {
    private strategies;
    constructor();
    private initializeStrategies;
    getStrategy(tournamentType: TournamentType): BusinessRulesStrategy;
    getAllStrategies(): BusinessRulesStrategy[];
    getSupportedTournamentTypes(): TournamentType[];
}
