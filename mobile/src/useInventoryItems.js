import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export function useInventoryItems(uid) {
  const canSubscribe = useMemo(() => isFirebaseConfigured && Boolean(uid), [uid]);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canSubscribe) {
      return undefined;
    }

    const q = query(collection(db, 'users', uid, 'inventory_items'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setItems(next);
        setLoaded(true);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoaded(true);
      }
    );

    return () => unsub();
  }, [canSubscribe, uid]);

  return {
    items,
    loading: canSubscribe && !loaded,
    error
  };
}
