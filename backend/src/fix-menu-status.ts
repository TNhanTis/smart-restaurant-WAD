import { config } from 'dotenv';
config(); // Load .env file

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMenuItemStatus() {
  console.log('Checking menu items status...');
  
  // Check current status
  const items = await prisma.menuItem.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      is_deleted: true,
    },
  });

  console.log(`Found ${items.length} menu items`);
  
  const unavailableItems = items.filter(item => item.status !== 'available');
  console.log(`Found ${unavailableItems.length} items with status != 'available':`);
  unavailableItems.forEach(item => {
    console.log(`  - ${item.name}: ${item.status}`);
  });

  // Update all to 'available'
  const result = await prisma.menuItem.updateMany({
    where: {
      is_deleted: false,
    },
    data: {
      status: 'available',
    },
  });

  console.log(`Updated ${result.count} menu items to 'available' status`);

  // Verify
  const verifyItems = await prisma.menuItem.findMany({
    where: {
      status: { not: 'available' },
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (verifyItems.length === 0) {
    console.log('✅ All menu items are now available!');
  } else {
    console.log('⚠️  Some items still not available:');
    verifyItems.forEach(item => {
      console.log(`  - ${item.name}: ${item.status}`);
    });
  }
}

fixMenuItemStatus()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
