import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

const INVENTORY_COLLECTION = 'inventory_items';

function toDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('expiryDate must be a valid date value');
  }

  return parsed;
}

function normalizeCreatePayload(payload) {
  const name = payload.name?.trim();
  const unit = payload.unit?.trim();

  if (!name) {
    throw new Error('name is required');
  }

  if (typeof payload.quantity !== 'number' || Number.isNaN(payload.quantity)) {
    throw new Error('quantity must be a number');
  }

  if (!unit) {
    throw new Error('unit is required');
  }

  return {
    name,
    quantity: payload.quantity,
    unit,
    locationTag: payload.locationTag?.trim() || null,
    expiryDate: toDate(payload.expiryDate),
    updatedAt: serverTimestamp()
  };
}

function normalizeUpdatePayload(payload) {
  const updates = { updatedAt: serverTimestamp() };

  if (payload.name !== undefined) {
    const name = payload.name?.trim();
    if (!name) {
      throw new Error('name must not be empty');
    }
    updates.name = name;
  }

  if (payload.quantity !== undefined) {
    if (typeof payload.quantity !== 'number' || Number.isNaN(payload.quantity)) {
      throw new Error('quantity must be a number');
    }
    updates.quantity = payload.quantity;
  }

  if (payload.unit !== undefined) {
    const unit = payload.unit?.trim();
    if (!unit) {
      throw new Error('unit must not be empty');
    }
    updates.unit = unit;
  }

  if (payload.locationTag !== undefined) {
    updates.locationTag = payload.locationTag?.trim() || null;
  }

  if (payload.expiryDate !== undefined) {
    updates.expiryDate = toDate(payload.expiryDate);
  }

  return updates;
}

function itemComparator(a, b) {
  const aDate = toDate(a.expiryDate);
  const bDate = toDate(b.expiryDate);

  if (aDate && bDate) {
    const delta = aDate.getTime() - bDate.getTime();
    if (delta !== 0) {
      return delta;
    }
  } else if (aDate && !bDate) {
    return -1;
  } else if (!aDate && bDate) {
    return 1;
  }

  const aName = (a.name || '').toLowerCase();
  const bName = (b.name || '').toLowerCase();
  if (aName !== bName) {
    return aName.localeCompare(bName);
  }

  return (a.id || '').localeCompare(b.id || '');
}

export function classifyExpiry(item, options = {}) {
  const days = options.nearExpiryDays ?? 3;
  const now = options.now ?? new Date();
  const expiryDate = toDate(item.expiryDate);

  if (!expiryDate) {
    return 'no_expiry';
  }

  const millisUntilExpiry = expiryDate.getTime() - now.getTime();
  const nearExpiryWindowMs = days * 24 * 60 * 60 * 1000;

  if (millisUntilExpiry < 0) {
    return 'expired';
  }

  if (millisUntilExpiry <= nearExpiryWindowMs) {
    return 'near_expiry';
  }

  return 'ok';
}

export async function createInventoryItem(db, uid, payload) {
  const ref = await addDoc(
    collection(db, 'users', uid, INVENTORY_COLLECTION),
    normalizeCreatePayload(payload)
  );

  return ref.id;
}

export async function updateInventoryItem(db, uid, itemId, payload) {
  const ref = doc(db, 'users', uid, INVENTORY_COLLECTION, itemId);
  await updateDoc(ref, normalizeUpdatePayload(payload));
}

export async function deleteInventoryItem(db, uid, itemId) {
  const ref = doc(db, 'users', uid, INVENTORY_COLLECTION, itemId);
  await deleteDoc(ref);
}

export async function listInventoryItems(db, uid) {
  const snapshot = await getDocs(collection(db, 'users', uid, INVENTORY_COLLECTION));

  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort(itemComparator)
    .map((item) => ({
      ...item,
      expiryStatus: classifyExpiry(item)
    }));
}

export function sortInventoryItems(items) {
  return [...items].sort(itemComparator);
}
