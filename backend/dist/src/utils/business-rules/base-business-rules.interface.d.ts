import { ChoreographyCategory, ChoreographyType } from '../../entities/choreography.entity';
import { TournamentType } from '../../entities/tournament.entity';
export interface CreateChoreographyRequest {
    country: string;
    category: ChoreographyCategory;
    type: ChoreographyType;
    gymnastCount: number;
    gymnastFigIds: string[];
    tournamentId: string;
}
export interface BusinessRulesStrategy {
    getTournamentType(): TournamentType;
    validateChoreographyCreation(request: CreateChoreographyRequest, existingChoreographiesCount: number): Promise<void>;
    getMaxChoreographiesPerCountryPerCategory(): number;
    getAdditionalValidationRules(): string[];
    validateTournamentSpecificRules(request: CreateChoreographyRequest): Promise<void>;
}
