import fs from 'node:fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';

const projectId = 'demo-pantry';
let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: fs.readFileSync('firestore.rules', 'utf8')
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Rules: user-scoped inventory namespace', () => {
  it('allows owner CRUD in users/{uid}/inventory_items', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    const itemRef = doc(db, 'users', 'user-a', 'inventory_items', 'eggs');

    await assertSucceeds(setDoc(itemRef, {
      name: 'Eggs',
      quantity: 12,
      unit: 'count',
      location: 'fridge'
    }));

    await assertSucceeds(getDoc(itemRef));
    await assertSucceeds(updateDoc(itemRef, { quantity: 10 }));
    await assertSucceeds(deleteDoc(itemRef));
  });

  it('denies cross-user reads/writes', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'users', 'user-a', 'inventory_items', 'yogurt'),
        { name: 'Yogurt', quantity: 2 }
      );
    });

    const intruderDb = testEnv.authenticatedContext('user-b').firestore();
    const victimRef = doc(intruderDb, 'users', 'user-a', 'inventory_items', 'yogurt');

    await assertFails(getDoc(victimRef));
    await assertFails(updateDoc(victimRef, { quantity: 99 }));
    await assertFails(deleteDoc(victimRef));
    await assertFails(setDoc(victimRef, { name: 'Hijack' }));
  });

  it('denies unauthenticated access', async () => {
    const anonDb = testEnv.unauthenticatedContext().firestore();
    const itemRef = doc(anonDb, 'users', 'user-a', 'inventory_items', 'bread');

    await assertFails(getDoc(itemRef));
    await assertFails(setDoc(itemRef, { name: 'Bread' }));
  });
});
