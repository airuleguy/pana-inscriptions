import { BusinessRulesStrategy, CreateChoreographyRequest } from './base-business-rules.interface';
import { TournamentType } from '../../entities/tournament.entity';
export declare class CopaPanamericanaStrategy implements BusinessRulesStrategy {
    getTournamentType(): TournamentType;
    validateChoreographyCreation(request: CreateChoreographyRequest, existingChoreographiesCount: number): Promise<void>;
    getMaxChoreographiesPerCountryPerCategory(): number;
    getAdditionalValidationRules(): string[];
    validateTournamentSpecificRules(request: CreateChoreographyRequest): Promise<void>;
    private getEligibleCountries;
}
