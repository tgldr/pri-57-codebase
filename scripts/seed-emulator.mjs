import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const app = initializeApp({ projectId: 'demo-pantry' });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const uid = process.env.SEED_UID || 'seed-user';

async function main() {
  await setDoc(doc(db, 'users', uid), {
    displayName: 'Seed User',
    email: 'seed@example.com',
    createdAt: serverTimestamp()
  });

  await setDoc(doc(db, 'users', uid, 'inventory_items', 'milk'), {
    name: 'Milk',
    quantity: 1,
    unit: 'carton',
    location: 'fridge',
    purchasedAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    updatedAt: serverTimestamp()
  });

  console.log(`Seeded emulator data for uid=${uid}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
