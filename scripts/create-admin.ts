import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { UserRole } from '../src/users/schemas/user.schema';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function bootstrap() {
  console.log('🔧 Creating Admin User\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const firstName = await question('Enter admin first name: ');
    const lastName = await question('Enter admin last name: ');

    if (!email || !password || !firstName || !lastName) {
      console.error('❌ All fields are required');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await usersService.findByEmail(email);
    if (existingUser) {
      console.error('❌ User with this email already exists');
      process.exit(1);
    }

    // Create admin user
    const admin = await usersService.create({
      email,
      password,
      firstName,
      lastName,
      role: UserRole.ADMIN,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log(
      'Name:',
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
    );
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
    await app.close();
  }
}

void bootstrap();
