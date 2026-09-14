import 'dotenv/config';
import { randomBytes } from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function generateToken() {
  return randomBytes(24).toString('base64url');
}

async function main() {
  const reservations = await prisma.reservation.findMany({
    where: {
      publicToken: null,
    },
    select: {
      id: true,
    },
  });

  for (const reservation of reservations) {
    await prisma.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        publicToken: generateToken(),
      },
    });
  }

  const queueEntries = await prisma.queueEntry.findMany({
    where: {
      publicToken: null,
    },
    select: {
      id: true,
    },
  });

  for (const entry of queueEntries) {
    await prisma.queueEntry.update({
      where: {
        id: entry.id,
      },
      data: {
        publicToken: generateToken(),
      },
    });
  }

  console.log(
    `Backfilled ${reservations.length} reservations and ${queueEntries.length} queue entries.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
