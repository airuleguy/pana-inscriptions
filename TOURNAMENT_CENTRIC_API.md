# Tournament-Centric API Documentation

## 🎯 Overview

We have successfully refactored the API to use a **tournament-centric hybrid approach** that perfectly aligns with the business model where all registrations are tournament-specific and subject to tournament-specific business rules.

## 🏗️ New API Structure

### 1. Tournament-Scoped Registrations (Primary API)

All registration operations are now scoped to a specific tournament, enabling automatic application of tournament-specific business rules.

#### Judges
```bash
# Register judges for a tournament
POST   /api/v1/tournaments/:tournamentId/registrations/judges
GET    /api/v1/tournaments/:tournamentId/registrations/judges
PUT    /api/v1/tournaments/:tournamentId/registrations/judges/:judgeId
DELETE /api/v1/tournaments/:tournamentId/registrations/judges/:judgeId

# Query parameters for filtering
GET /api/v1/tournaments/123/registrations/judges?country=USA
```

#### Coaches
```bash
# Register coaches for a tournament
POST   /api/v1/tournaments/:tournamentId/registrations/coaches
GET    /api/v1/tournaments/:tournamentId/registrations/coaches
PUT    /api/v1/tournaments/:tournamentId/registrations/coaches/:coachId
DELETE /api/v1/tournaments/:tournamentId/registrations/coaches/:coachId

# Query parameters for filtering
GET /api/v1/tournaments/123/registrations/coaches?country=USA&level=L1
```

#### Choreographies
```bash
# Register choreographies for a tournament (automatic business rule validation)
POST   /api/v1/tournaments/:tournamentId/registrations/choreographies
GET    /api/v1/tournaments/:tournamentId/registrations/choreographies
PUT    /api/v1/tournaments/:tournamentId/registrations/choreographies/:choreographyId
DELETE /api/v1/tournaments/:tournamentId/registrations/choreographies/:choreographyId

# Query parameters for filtering
GET /api/v1/tournaments/123/registrations/choreographies?country=USA&category=SENIOR&type=TRIO
```

#### Batch Operations
```bash
# Register multiple types in one request (all for the same tournament)
POST /api/v1/tournaments/:tournamentId/registrations/batch
{
  "choreographies": [...],
  "coaches": [...],
  "judges": [...],
  "country": "USA"
}
```

#### Summary & Statistics
```bash
# Tournament-specific summaries
GET /api/v1/tournaments/:tournamentId/registrations/summary
GET /api/v1/tournaments/:tournamentId/registrations/summary?country=USA
GET /api/v1/tournaments/:tournamentId/registrations/stats
```

### 2. Global Cross-Tournament Operations (Secondary API)

For administrative and analytical purposes, we provide global endpoints for cross-tournament operations.

```bash
# Global queries across all tournaments
GET /api/v1/registrations/judges?country=USA&tournament=123&category=3
GET /api/v1/registrations/coaches?country=USA&level=L1
GET /api/v1/registrations/choreographies?country=USA&category=SENIOR
GET /api/v1/registrations/summary
GET /api/v1/registrations/summary?country=USA
```

### 3. Core Resource APIs (Unchanged)

FIG data and tournament management remain as separate, clean resource APIs:

```bash
# FIG Data (external)
GET /api/v1/coaches              # FIG coaches data
GET /api/v1/judges               # FIG judges data  
GET /api/v1/gymnasts             # FIG gymnasts data

# Tournament Management
GET    /api/v1/tournaments
POST   /api/v1/tournaments
GET    /api/v1/tournaments/:id
PATCH  /api/v1/tournaments/:id
DELETE /api/v1/tournaments/:id

# Choreographies (internal registrations, but kept for compatibility)
GET    /api/v1/choreographies
POST   /api/v1/choreographies
GET    /api/v1/choreographies/:id
PATCH  /api/v1/choreographies/:id
DELETE /api/v1/choreographies/:id
```

## 🔧 Key Benefits

### 1. **Automatic Tournament Context**
- Every registration operation automatically gets tournament context
- Tournament-specific business rules applied automatically
- No need to pass tournament ID in request body (comes from URL)

### 2. **Clean Resource Hierarchy**
```
Tournament (parent resource)
  └── Registrations (collection)
      ├── Judges (type)
      ├── Coaches (type)
      └── Choreographies (type)
```

### 3. **Type Safety & Validation**
- Tournament ID validated at route level
- Automatic enforcement of tournament-specific constraints
- Business rules factory pattern applied seamlessly

### 4. **Flexible Querying**
```bash
# Tournament-specific
GET /tournaments/123/registrations/judges?country=USA

# Cross-tournament analysis
GET /registrations/judges?tournament=123&country=USA
```

### 5. **Extensible Design**
Easy to add new registration types:
```bash
# Future extensions
POST /tournaments/:id/registrations/officials    # New!
POST /tournaments/:id/registrations/volunteers   # New!
POST /tournaments/:id/registrations/media        # New!
```

## 📊 Example Requests

### Register Judges for Tournament
```bash
POST /api/v1/tournaments/550e8400-e29b-41d4-a716-446655440000/registrations/judges
Content-Type: application/json

[
  {
    "figId": "3622",
    "firstName": "Reham",
    "lastName": "ABDELAAL",
    "fullName": "Reham ABDELAAL",
    "birth": "1974-07-29",
    "gender": "FEMALE",
    "country": "EGY",
    "category": "3",
    "categoryDescription": "Category 3"
  }
]
```

### Batch Registration
```bash
POST /api/v1/tournaments/550e8400-e29b-41d4-a716-446655440000/registrations/batch
Content-Type: application/json

{
  "choreographies": [
    {
      "name": "SMITH-JONES-BROWN",
      "country": "USA",
      "category": "SENIOR",
      "type": "TRIO",
      "gymnastCount": 3,
      "oldestGymnastAge": 22,
      "gymnastFigIds": ["FIG123", "FIG456", "FIG789"]
    }
  ],
  "coaches": [
    {
      "figId": "COACH123",
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "gender": "MALE",
      "country": "USA",
      "level": "L1, L2",
      "levelDescription": "Level 1, Level 2"
    }
  ],
  "judges": [...],
  "tournament": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Copa Panamericana 2024",
    "type": "COPA_PANAMERICANA",
    "startDate": "2024-06-01",
    "endDate": "2024-06-05"
  },
  "country": "USA"
}
```

### Get Tournament Summary
```bash
GET /api/v1/tournaments/550e8400-e29b-41d4-a716-446655440000/registrations/summary?country=USA

Response:
{
  "tournament": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Copa Panamericana 2024",
    "type": "COPA_PANAMERICANA"
  },
  "country": "USA",
  "totals": {
    "choreographies": 8,
    "coaches": 4,
    "judges": 6
  },
  "choreographiesByCategory": {
    "YOUTH": 2,
    "JUNIOR": 3, 
    "SENIOR": 3
  },
  "choreographiesByType": {
    "MIND": 2,
    "WIND": 2,
    "TRIO": 4
  }
}
```

## 🚀 Implementation Details

### Controllers
- **TournamentRegistrationsController**: Handles all tournament-scoped operations
- **GlobalRegistrationsController**: Handles cross-tournament queries
- **Removed**: CoachRegistrationController, JudgeRegistrationController, BatchRegistrationController (replaced by tournament-centric approach)

### Services (Unchanged)
- All existing services remain the same
- Business rules factory automatically applies tournament-specific rules
- No changes needed to service layer

### Business Rules Integration
- Tournament ID automatically extracted from URL
- Tournament type loaded and passed to business rules factory
- Appropriate strategy applied (Campeonato Panamericano vs Copa Panamericana)
- Validation happens seamlessly

## 🎯 Migration Impact

### Frontend Changes Needed
- Update API calls to use tournament-scoped endpoints
- Add tournament selection to registration flows
- Update state management to include tournament context

### Example Frontend Updates
```typescript
// Old approach
await api.post('/coach-registrations', coachData);

// New tournament-centric approach  
await api.post(`/tournaments/${tournamentId}/registrations/coaches`, coachData);
```

### Backward Compatibility
- **None provided** - clean refactor since not live yet
- All old endpoints removed from app.module.ts
- Old controller files can be deleted if desired

This tournament-centric approach provides a clean, scalable, and business-rule-aligned API structure that perfectly matches your domain model! 🎉
