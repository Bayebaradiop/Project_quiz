import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  const hashedPassword = await bcrypt.hash('Admin@1234', 12);

  const adminUser = await prisma.utilisateur.upsert({
    where: { email: 'admin@quizlab.com' },
    update: {},
    create: {
      prenom: 'Admin',
      nom: 'QuizLab',
      email: 'admin@quizlab.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Utilisateur admin créé:');
  console.log(`   - Email: ${adminUser.email}`);
  console.log(`   - Password: Admin@1234`);
  console.log(`   - Rôle: ${adminUser.role}`);

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

