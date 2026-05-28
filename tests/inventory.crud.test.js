import fs from 'node:fs';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { initializeTestEnvironment, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc } from 'firebase/firestore';
import {
  createInventoryItem,
  deleteInventoryItem,
  listInventoryItems,
  updateInventoryItem
} from '../src/inventory.js';

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

describe('inventory data layer', () => {
  it('supports create/update/delete for inventory items', async () => {
    const uid = 'user-a';
    const db = testEnv.authenticatedContext(uid).firestore();

    const itemId = await createInventoryItem(db, uid, {
      name: 'Milk',
      quantity: 1,
      unit: 'carton',
      locationTag: 'fridge-door',
      expiryDate: new Date('2026-06-01T00:00:00.000Z')
    });

    const itemRef = doc(db, 'users', uid, 'inventory_items', itemId);

    const created = await assertSucceeds(getDoc(itemRef));
    expect(created.exists()).toBe(true);
    expect(created.data().name).toBe('Milk');

    await updateInventoryItem(db, uid, itemId, {
      quantity: 2,
      unit: 'bottle',
      locationTag: ''
    });

    const updated = await assertSucceeds(getDoc(itemRef));
    expect(updated.data().quantity).toBe(2);
    expect(updated.data().unit).toBe('bottle');
    expect(updated.data().locationTag).toBeNull();

    await deleteInventoryItem(db, uid, itemId);
    const deleted = await assertSucceeds(getDoc(itemRef));
    expect(deleted.exists()).toBe(false);
  });

  it('lists items ordered by earliest expiry with no-expiry items last', async () => {
    const uid = 'user-a';
    const db = testEnv.authenticatedContext(uid).firestore();

    await createInventoryItem(db, uid, {
      name: 'Pasta',
      quantity: 1,
      unit: 'box',
      expiryDate: null
    });

    await createInventoryItem(db, uid, {
      name: 'Yogurt',
      quantity: 2,
      unit: 'cup',
      expiryDate: '2026-05-30T00:00:00.000Z'
    });

    await createInventoryItem(db, uid, {
      name: 'Eggs',
      quantity: 12,
      unit: 'count',
      expiryDate: '2026-05-29T00:00:00.000Z'
    });

    const items = await listInventoryItems(db, uid);

    expect(items.map((item) => item.name)).toEqual(['Eggs', 'Yogurt', 'Pasta']);
    expect(items[2].expiryDate ?? null).toBeNull();
  });
});
