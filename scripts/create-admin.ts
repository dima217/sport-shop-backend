import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/modules/user/entities/user.entity';
import { Profile } from '../src/modules/user/entities/profile.entity';
import * as argon2 from 'argon2';
import * as readline from 'readline';

async function createAdmin() {
  // Override DB settings for local execution if not in Docker
  if (!process.env.DB_HOST || process.env.DB_HOST === 'postgres') {
    process.env.DB_HOST = 'localhost';
    if (!process.env.DB_PORT) {
      process.env.DB_PORT = '5432';
    }
    console.log(`📝 Using local database settings (${process.env.DB_HOST}:${process.env.DB_PORT})`);
    console.log('💡 Make sure PostgreSQL is running: docker-compose up -d postgres');
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  // Wait for database connection
  const dataSource = app.get(DataSource);

  // Wait for connection to be established
  console.log('⏳ Waiting for database connection...');
  let retries = 30;
  while (retries > 0) {
    try {
      if (dataSource.isInitialized) {
        console.log('✅ Database connected!');
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
      if (retries % 5 === 0 && retries > 0) {
        console.log(`   Still waiting... (${30 - retries}/30)`);
      }
    } catch {
      if (retries === 0) {
        console.error('❌ Failed to connect to database after 30 attempts');
        console.error('💡 Make sure PostgreSQL is running:');
        console.error('   docker-compose up -d postgres');
        await app.close();
        process.exit(1);
      }
    }
  }

  if (!dataSource.isInitialized) {
    console.error('❌ Database connection failed');
    await app.close();
    process.exit(1);
  }

  // Get user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    console.log('\n📋 Создание администратора (кладовщика)\n');

    const email = await question('Email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Неверный email');
      rl.close();
      await app.close();
      process.exit(1);
    }

    const password = await question('Пароль: ');
    if (!password || password.length < 6) {
      console.error('❌ Пароль должен быть не менее 6 символов');
      rl.close();
      await app.close();
      process.exit(1);
    }

    const firstName = await question('Имя: ');
    if (!firstName || firstName.trim().length === 0) {
      console.error('❌ Имя не может быть пустым');
      rl.close();
      await app.close();
      process.exit(1);
    }

    const lastName = await question('Фамилия: ');
    if (!lastName || lastName.trim().length === 0) {
      console.error('❌ Фамилия не может быть пустой');
      rl.close();
      await app.close();
      process.exit(1);
    }

    rl.close();

    // Check if user already exists
    const userRepository = dataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { email: email.trim() },
    });

    if (existingUser) {
      console.error(`❌ Пользователь с email ${email} уже существует`);
      await app.close();
      process.exit(1);
    }

    // Create admin user in transaction
    console.log('\n⏳ Создание администратора...');
    const result = await dataSource.transaction(async (manager) => {
      // Create profile
      const profile = manager.create(Profile, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const savedProfile = await manager.save(profile);

      // Hash password
      const hashedPassword = await argon2.hash(password);

      // Create user with admin role
      const user = manager.create(User, {
        email: email.trim(),
        password: hashedPassword,
        role: UserRole.ADMIN,
        isOAuthUser: false,
        isBanned: false,
        profile: savedProfile,
      });
      const savedUser = await manager.save(user);

      // Link profile to user
      savedProfile.user = savedUser;
      await manager.save(savedProfile);

      return savedUser;
    });

    // Reload user with profile relation
    const userWithProfile = await userRepository.findOne({
      where: { id: result.id },
      relations: ['profile'],
    });

    if (!userWithProfile) {
      throw new Error('Failed to load created user');
    }

    console.log('✅ Администратор успешно создан!');
    console.log('\n📊 Информация о пользователе:');
    console.log(`   ID: ${userWithProfile.id}`);
    console.log(`   UUID: ${userWithProfile.uuid}`);
    console.log(`   Email: ${userWithProfile.email}`);
    console.log(`   Роль: ${userWithProfile.role}`);
    console.log(`   Имя: ${userWithProfile.profile.firstName} ${userWithProfile.profile.lastName}`);
    console.log('\n💡 Теперь вы можете войти в систему с этими учетными данными');
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:');
    console.error(error);
    await app.close();
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

createAdmin()
  .then(() => {
    console.log('\n✅ Скрипт завершен');
  })
  .catch((error) => {
    console.error('❌ Критическая ошибка:');
    console.error(error);
    process.exit(1);
  });
