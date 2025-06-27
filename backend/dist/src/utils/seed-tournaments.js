"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTournaments = seedTournaments;
const tournament_entity_1 = require("../entities/tournament.entity");
async function seedTournaments(dataSource) {
    const tournamentRepository = dataSource.getRepository(tournament_entity_1.Tournament);
    const existingTournaments = await tournamentRepository.count();
    if (existingTournaments > 0) {
        console.log('Tournaments already exist, skipping seed...');
        return;
    }
    const tournaments = [
        {
            name: 'Campeonato Panamericano de Gimnasia Aeróbica',
            shortName: 'Campeonato Panamericano',
            type: tournament_entity_1.TournamentType.CAMPEONATO_PANAMERICANO,
            description: 'The premier Pan-American championship for aerobic gymnastics, featuring the highest level of competition with strict eligibility requirements and limited entries per country.',
            startDate: '2024-07-15',
            endDate: '2024-07-21',
            location: 'Lima, Peru',
            isActive: true,
        },
        {
            name: 'Copa Panamericana de Gimnasia Aeróbica',
            shortName: 'Copa Panamericana',
            type: tournament_entity_1.TournamentType.COPA_PANAMERICANA,
            description: 'A developmental competition open to Pan-American countries and guest nations, promoting the growth of aerobic gymnastics across the region.',
            startDate: '2024-09-10',
            endDate: '2024-09-16',
            location: 'Mexico City, Mexico',
            isActive: true,
        },
    ];
    try {
        const savedTournaments = await tournamentRepository.save(tournaments);
        console.log(`Successfully seeded ${savedTournaments.length} tournaments:`);
        savedTournaments.forEach(tournament => {
            console.log(`- ${tournament.name} (${tournament.type})`);
        });
    }
    catch (error) {
        console.error('Error seeding tournaments:', error);
        throw error;
    }
}
//# sourceMappingURL=seed-tournaments.js.map