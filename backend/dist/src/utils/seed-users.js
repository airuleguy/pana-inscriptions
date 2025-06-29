#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUsers = void 0;
exports.seedUsers = seedUsers;
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const testUsers = [
    {
        username: 'usa_delegate',
        password: 'USA2024!',
        country: 'USA',
        role: user_entity_1.UserRole.DELEGATE,
    },
    {
        username: 'can_delegate',
        password: 'CAN2024!',
        country: 'CAN',
        role: user_entity_1.UserRole.DELEGATE,
    },
    {
        username: 'mex_delegate',
        password: 'MEX2024!',
        country: 'MEX',
        role: user_entity_1.UserRole.DELEGATE,
    },
    {
        username: 'bra_delegate',
        password: 'BRA2024!',
        country: 'BRA',
        role: user_entity_1.UserRole.DELEGATE,
    },
    {
        username: 'arg_delegate',
        password: 'ARG2024!',
        country: 'ARG',
        role: user_entity_1.UserRole.DELEGATE,
    },
    {
        username: 'admin',
        password: 'Admin2024!',
        country: 'ADMIN',
        role: user_entity_1.UserRole.ADMIN,
    },
];
exports.testUsers = testUsers;
async function createDataSource() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'pana-inscriptions-db',
        entities: [user_entity_1.User],
        synchronize: false,
        logging: false,
    });
    return dataSource;
}
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}
async function seedUsers() {
    console.log('🌱 Starting user seeding process...\n');
    let dataSource;
    try {
        dataSource = await createDataSource();
        await dataSource.initialize();
        console.log('✅ Database connection established');
        const userRepository = dataSource.getRepository(user_entity_1.User);
        const existingUserCount = await userRepository.count();
        if (existingUserCount > 0) {
            console.log(`⚠️  Found ${existingUserCount} existing users`);
            console.log('   Do you want to proceed? This will skip existing usernames.');
        }
        console.log(`\n📝 Processing ${testUsers.length} test users...\n`);
        for (const testUser of testUsers) {
            try {
                const existingUser = await userRepository.findOne({
                    where: { username: testUser.username },
                });
                if (existingUser) {
                    console.log(`⏭️  User '${testUser.username}' already exists, skipping...`);
                    continue;
                }
                console.log(`🔐 Hashing password for '${testUser.username}'...`);
                const passwordHash = await hashPassword(testUser.password);
                const user = userRepository.create({
                    username: testUser.username,
                    passwordHash,
                    country: testUser.country,
                    role: testUser.role,
                    isActive: true,
                });
                await userRepository.save(user);
                console.log(`✅ Created user: ${testUser.username} (${testUser.country}) - ${testUser.role}`);
            }
            catch (error) {
                console.error(`❌ Failed to create user '${testUser.username}':`, error.message);
            }
        }
        console.log('\n📊 Seeding Summary:');
        const finalUserCount = await userRepository.count();
        console.log(`   Total users in database: ${finalUserCount}`);
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
    }
    catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
    finally {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('\n🔌 Database connection closed');
        }
    }
}
if (require.main === module) {
    require('dotenv/config');
    seedUsers().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-users.js.map