#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { ConfigService } from '@nestjs/config';

interface TestUser {
  username: string;
  password: string;
  country: string;
  role: UserRole;
}

const testUsers: TestUser[] = [
  {
    username: 'usa_delegate',
    password: 'USA2024!',
    country: 'USA',
    role: UserRole.DELEGATE,
  },
  {
    username: 'can_delegate',
    password: 'CAN2024!',
    country: 'CAN',
    role: UserRole.DELEGATE,
  },
  {
    username: 'mex_delegate',
    password: 'MEX2024!',
    country: 'MEX',
    role: UserRole.DELEGATE,
  },
  {
    username: 'bra_delegate',
    password: 'BRA2024!',
    country: 'BRA',
    role: UserRole.DELEGATE,
  },
  {
    username: 'arg_delegate',
    password: 'ARG2024!',
    country: 'ARG',
    role: UserRole.DELEGATE,
  },
  {
    username: 'admin',
    password: 'Admin2024!',
    country: 'ADMIN',
    role: UserRole.ADMIN,
  },
  {
    username: 'uruguay',
    password: '1234',
    country: 'URU',
    role: UserRole.DELEGATE,
  },
];

async function createDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'pana-inscriptions-db',
    entities: [User, UserSession],
    synchronize: false, // Don't auto-sync in production
    logging: false,
  });

  return dataSource;
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function seedUsers(): Promise<void> {
  console.log('🌱 Starting user seeding process...\n');

  let dataSource: DataSource;

  try {
    dataSource = await createDataSource();
    await dataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = dataSource.getRepository(User);

    // Check if users already exist
    const existingUserCount = await userRepository.count();
    if (existingUserCount > 0) {
      console.log(`⚠️  Found ${existingUserCount} existing users`);
      console.log('   Do you want to proceed? This will skip existing usernames.');
    }

    console.log(`\n📝 Processing ${testUsers.length} test users...\n`);

    for (const testUser of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await userRepository.findOne({
          where: { username: testUser.username },
        });

        if (existingUser) {
          console.log(`⏭️  User '${testUser.username}' already exists, skipping...`);
          continue;
        }

        // Hash the password
        console.log(`🔐 Hashing password for '${testUser.username}'...`);
        const passwordHash = await hashPassword(testUser.password);

        // Create user entity
        const user = userRepository.create({
          username: testUser.username,
          passwordHash,
          country: testUser.country,
          role: testUser.role,
          isActive: true,
        });

        // Save user
        await userRepository.save(user);
        console.log(`✅ Created user: ${testUser.username} (${testUser.country}) - ${testUser.role}`);

      } catch (error) {
        console.error(`❌ Failed to create user '${testUser.username}':`, error.message);
      }
    }

    // Display final summary
    console.log('\n📊 Seeding Summary:');
    const finalUserCount = await userRepository.count();
    console.log(`   Total users in database: ${finalUserCount}`);

    // Display user list
    const allUsers = await userRepository.find({
      select: ['id', 'username', 'country', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'ASC' },
    });

    console.log('\n👥 User List:');
    console.log('   Username        | Country | Role     | Active | Created');
    console.log('   ----------------|---------|----------|--------|--------');
    
    allUsers.forEach(user => {
      const created = user.createdAt.toISOString().split('T')[0];
      console.log(`   ${user.username.padEnd(15)} | ${user.country.padEnd(7)} | ${user.role.padEnd(8)} | ${user.isActive ? 'Yes' : 'No'.padEnd(6)} | ${created}`);
    });

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   usa_delegate : USA2024!');
    console.log('   can_delegate : CAN2024!');
    console.log('   mex_delegate : MEX2024!');
    console.log('   bra_delegate : BRA2024!');
    console.log('   arg_delegate : ARG2024!');
    console.log('   admin        : Admin2024!');
    console.log('\n💡 You can now test the authentication endpoints with these credentials.');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Self-executing seeder if run directly
if (require.main === module) {
  // Load environment variables
  require('dotenv/config');
  
  seedUsers().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { seedUsers, testUsers }; 