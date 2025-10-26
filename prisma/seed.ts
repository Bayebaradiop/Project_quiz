import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Créer l'admin
  const hashedPasswordAdmin = await bcrypt.hash('Admin@1234', 12);
  const adminUser = await prisma.utilisateur.upsert({
    where: { email: 'admin@quizlab.com' },
    update: {},
    create: {
      prenom: 'Admin',
      nom: 'QuizLab',
      email: 'admin@quizlab.com',
      password: hashedPasswordAdmin,
      role: Role.admin,
    },
  });

  console.log('✅ Utilisateur admin créé:');
  console.log(`   - Email: ${adminUser.email}`);
  console.log(`   - Password: Admin@1234`);
  console.log(`   - Rôle: ${adminUser.role}`);

  // Créer un créateur
  const hashedPasswordCreateur = await bcrypt.hash('Createur@1234', 12);
  const createurUser = await prisma.utilisateur.upsert({
    where: { email: 'createur@quizlab.com' },
    update: {},
    create: {
      prenom: 'Jean',
      nom: 'Créateur',
      email: 'createur@quizlab.com',
      password: hashedPasswordCreateur,
      role: Role.createur,
    },
  });

  console.log('✅ Utilisateur créateur créé:');
  console.log(`   - Email: ${createurUser.email}`);
  console.log(`   - Password: Createur@1234`);
  console.log(`   - Rôle: ${createurUser.role}`);

  // Créer un utilisateur normal
  const hashedPasswordUser = await bcrypt.hash('User@1234', 12);
  const normalUser = await prisma.utilisateur.upsert({
    where: { email: 'user@quizlab.com' },
    update: {},
    create: {
      prenom: 'Marie',
      nom: 'Utilisateur',
      email: 'user@quizlab.com',
      password: hashedPasswordUser,
      role: Role.user,
    },
  });

  console.log('✅ Utilisateur normal créé:');
  console.log(`   - Email: ${normalUser.email}`);
  console.log(`   - Password: User@1234`);
  console.log(`   - Rôle: ${normalUser.role}`);

  console.log('\n✅ Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

