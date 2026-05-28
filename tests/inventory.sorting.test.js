import { describe, expect, it } from 'vitest';
import { classifyExpiry, sortInventoryItems } from '../src/inventory.js';

describe('inventory sorting and expiry classification', () => {
  it('sorts by earliest expiry and places missing expiry at the end', () => {
    const sorted = sortInventoryItems([
      { id: '3', name: 'Pasta', expiryDate: null },
      { id: '2', name: 'Yogurt', expiryDate: '2026-05-30T00:00:00.000Z' },
      { id: '1', name: 'Eggs', expiryDate: '2026-05-29T00:00:00.000Z' }
    ]);

    expect(sorted.map((item) => item.name)).toEqual(['Eggs', 'Yogurt', 'Pasta']);
  });

  it('classifies expiry windows for near-expiry emphasis', () => {
    const now = new Date('2026-05-28T00:00:00.000Z');

    expect(classifyExpiry({ expiryDate: '2026-05-27T00:00:00.000Z' }, { now })).toBe('expired');
    expect(classifyExpiry({ expiryDate: '2026-05-29T00:00:00.000Z' }, { now })).toBe('near_expiry');
    expect(classifyExpiry({ expiryDate: '2026-06-10T00:00:00.000Z' }, { now })).toBe('ok');
    expect(classifyExpiry({ expiryDate: null }, { now })).toBe('no_expiry');
  });
});
