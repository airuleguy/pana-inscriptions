# Tournament Entity & Business Rules Strategy Pattern Implementation

## Overview
This implementation adds a new `Tournament` entity and refactors the business rules system to use a **Strategy Pattern** to handle different tournament-specific rules, eliminating conditional logic and improving extensibility.

## 🏆 Tournament Entity

### Database Schema
- **Table**: `tournaments`
- **Primary Key**: UUID
- **Fields**:
  - `name`: Full tournament name
  - `short_name`: Abbreviated tournament name
  - `type`: Enum (`CAMPEONATO_PANAMERICANO`, `COPA_PANAMERICANA`)
  - `description`: Optional tournament description
  - `start_date` / `end_date`: Tournament dates
  - `location`: Tournament location
  - `is_active`: Boolean flag for active tournaments
  - Standard audit fields (`created_at`, `updated_at`)

### Default Tournaments
1. **Campeonato Panamericano de Gimnasia Aeróbica**
   - Type: `CAMPEONATO_PANAMERICANO`
   - Max choreographies per country/category: **2**
   - Stricter eligibility requirements
   - Pan-American countries only

2. **Copa Panamericana de Gimnasia Aeróbica**
   - Type: `COPA_PANAMERICANA`
   - Max choreographies per country/category: **4**
   - More flexible eligibility
   - Pan-American + guest countries

## 🎯 Strategy Pattern Implementation

### Business Rules Architecture

#### 1. Base Interface (`base-business-rules.interface.ts`)
```typescript
interface BusinessRulesStrategy {
  getTournamentType(): TournamentType;
  validateChoreographyCreation(request, existingCount): Promise<void>;
  getMaxChoreographiesPerCountryPerCategory(): number;
  getAdditionalValidationRules(): string[];
  validateTournamentSpecificRules(request): Promise<void>;
}
```

#### 2. Strategy Implementations

**Campeonato Panamericano Strategy:**
- Max 2 choreographies per country/category
- Strict country eligibility (Pan-American only)
- Enhanced licensing validation requirements

**Copa Panamericana Strategy:**
- Max 4 choreographies per country/category
- Flexible country eligibility (Pan-American + guest countries)
- Standard licensing requirements

#### 3. Factory Pattern (`business-rules-factory.ts`)
- Manages strategy instances
- Provides strategy lookup by tournament type
- Easily extensible for new tournaments

### Benefits of Strategy Pattern
- ✅ **Eliminates conditional logic** (no more if/else chains)
- ✅ **Easy to extend** (add new tournaments without modifying existing code)
- ✅ **Single Responsibility** (each strategy handles one tournament type)
- ✅ **Open/Closed Principle** (open for extension, closed for modification)
- ✅ **Testable** (each strategy can be tested independently)

## 🔄 Updated Entity Relationships

### Choreography ↔ Tournament
- **Relationship**: Many-to-One (many choreographies belong to one tournament)
- **Foreign Key**: `tournament_id` in `choreographies` table
- **Constraint**: `NOT NULL` (every choreography must belong to a tournament)

## 🛠 API Endpoints

### Tournament Management
```
GET    /tournaments              # List all tournaments
GET    /tournaments?active=true  # List active tournaments only
GET    /tournaments/by-type/:type # Filter by tournament type
GET    /tournaments/:id          # Get single tournament
GET    /tournaments/:id/stats    # Get tournament statistics
POST   /tournaments              # Create tournament (admin only)
PATCH  /tournaments/:id          # Update tournament (admin only)
DELETE /tournaments/:id          # Delete tournament (admin only)
```

### Updated Choreography Endpoints
- All choreography operations now require `tournamentId`
- Business rules validation is tournament-specific
- Statistics are grouped by tournament

## 📊 Database Migration

### Migration Script (`02-tournaments.sql`)
1. Creates `tournaments` table with constraints and indexes
2. Adds `tournament_id` column to `choreographies` table
3. Creates foreign key relationship
4. Inserts default tournament data
5. Sets up database triggers for `updated_at` fields

### Running Migration
```bash
# If using Docker
docker-compose down
docker-compose up --build

# Manual execution
psql -d pana-inscriptions-db -f database/migrations/02-tournaments.sql
```

## 🎨 Frontend Updates

### Updated Types (`frontend/src/types/index.ts`)
```typescript
// New tournament types
export type TournamentType = 'CAMPEONATO_PANAMERICANO' | 'COPA_PANAMERICANA';

export interface Tournament {
  id: string;
  name: string;
  shortName: string;
  type: TournamentType;
  // ... other fields
}

// Updated choreography form data
export interface ChoreographyFormData {
  tournamentId: string; // NEW: Required tournament selection
  // ... existing fields
}
```

### Constants
```typescript
export const TOURNAMENT_TYPE_INFO = {
  CAMPEONATO_PANAMERICANO: { 
    maxChoreographiesPerCategory: 2,
    description: "Premier Pan-American championship"
  },
  COPA_PANAMERICANA: { 
    maxChoreographiesPerCategory: 4,
    description: "Developmental competition"
  }
};
```

## 🔧 Service Layer Changes

### ChoreographyService Updates
```typescript
// NEW: Tournament validation and strategy pattern usage
async create(dto: CreateChoreographyDto): Promise<Choreography> {
  const tournament = await this.getTournament(dto.tournamentId);
  const strategy = this.businessRulesFactory.getStrategy(tournament.type);
  
  await strategy.validateChoreographyCreation(request, existingCount);
  // ... rest of creation logic
}
```

### New TournamentService
- Full CRUD operations for tournaments
- Tournament statistics and reporting
- Active tournament filtering

## 🧪 Testing Strategy

### Unit Tests (Recommended)
```typescript
describe('BusinessRulesFactory', () => {
  it('should return correct strategy for tournament type');
  it('should throw error for unknown tournament type');
});

describe('CampeonatoPanamericanoStrategy', () => {
  it('should limit to 2 choreographies per country/category');
  it('should validate country eligibility');
});
```

## 🚀 Future Extensibility

### Adding New Tournaments
1. Add new tournament type to enum
2. Create new strategy class implementing `BusinessRulesStrategy`
3. Register strategy in `BusinessRulesFactory`
4. Add tournament data via API or migration

### Example: Adding Olympic Games
```typescript
export enum TournamentType {
  CAMPEONATO_PANAMERICANO = 'CAMPEONATO_PANAMERICANO',
  COPA_PANAMERICANA = 'COPA_PANAMERICANA',
  OLYMPIC_GAMES = 'OLYMPIC_GAMES' // NEW
}

export class OlympicGamesStrategy implements BusinessRulesStrategy {
  getMaxChoreographiesPerCountryPerCategory(): number {
    return 1; // Olympic limit
  }
  // ... implement other methods
}
```

## 📋 Deployment Checklist

- [ ] Run database migration (`02-tournaments.sql`)
- [ ] Verify tournament seeding works correctly
- [ ] Test choreography creation with tournament selection
- [ ] Validate business rules enforcement
- [ ] Update frontend to include tournament selection
- [ ] Test API endpoints for tournaments
- [ ] Verify existing choreographies still work (may need tournament assignment)

## 🔍 Monitoring & Observability

### Key Metrics to Monitor
- Choreography creation success/failure rates by tournament
- Business rule violation patterns
- Tournament-specific registration volumes
- Country participation by tournament type

### Logging Enhancements
- Tournament-specific business rule validations
- Strategy pattern decision logging
- Country eligibility check results

This implementation provides a solid foundation for tournament-specific business rules while maintaining clean, extensible architecture following SOLID principles and Domain-Driven Design patterns. 