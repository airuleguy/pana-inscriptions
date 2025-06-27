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
  /**
   * Get the tournament type this strategy applies to
   */
  getTournamentType(): TournamentType;

  /**
   * Validate business rules for choreography creation
   */
  validateChoreographyCreation(request: CreateChoreographyRequest, existingChoreographiesCount: number): Promise<void>;

  /**
   * Get maximum choreographies allowed per country per category
   */
  getMaxChoreographiesPerCountryPerCategory(): number;

  /**
   * Get additional validation rules specific to this tournament
   */
  getAdditionalValidationRules(): string[];

  /**
   * Validate tournament-specific requirements
   */
  validateTournamentSpecificRules(request: CreateChoreographyRequest): Promise<void>;
} 