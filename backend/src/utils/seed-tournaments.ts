import { DataSource } from 'typeorm';
import { Tournament, TournamentType } from '../entities/tournament.entity';

export async function seedTournaments(dataSource: DataSource) {
  const tournamentRepository = dataSource.getRepository(Tournament);

  // Check if tournaments already exist
  const existingTournaments = await tournamentRepository.count();
  if (existingTournaments > 0) {
    console.log('Tournaments already exist, skipping seed...');
    return;
  }

  const tournaments = [
    {
      name: 'Campeonato Panamericano de Gimnasia Aeróbica',
      shortName: 'Campeonato Panamericano',
      type: TournamentType.CAMPEONATO_PANAMERICANO,
      description: 'The premier Pan-American championship for aerobic gymnastics, featuring the highest level of competition with strict eligibility requirements and limited entries per country.',
      startDate: '2024-07-15',
      endDate: '2024-07-21',
      location: 'Lima, Peru',
      isActive: true,
    },
    {
      name: 'Copa Panamericana de Gimnasia Aeróbica',
      shortName: 'Copa Panamericana',
      type: TournamentType.COPA_PANAMERICANA,
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
  } catch (error) {
    console.error('Error seeding tournaments:', error);
    throw error;
  }
} 