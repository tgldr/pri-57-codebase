import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useInventoryItems } from '../src/useInventoryItems';
import { db, isFirebaseConfigured } from '../src/firebase';

const UID_PLACEHOLDER = 'demo-user';

export default function InventoryScreen() {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const { items, loading, error } = useInventoryItems(UID_PLACEHOLDER);

  const canSubmit = useMemo(
    () => isFirebaseConfigured && name.trim().length > 0 && Number(qty) > 0,
    [name, qty]
  );

  async function onAddItem() {
    if (!canSubmit) {
      return;
    }

    await addDoc(collection(db, 'users', UID_PLACEHOLDER, 'inventory_items'), {
      name: name.trim(),
      quantity: Number(qty),
      unit: 'unit',
      updatedAt: serverTimestamp(),
      expiryDate: null
    });

    setName('');
    setQty('1');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Pridge Inventory</Text>
      {!isFirebaseConfigured ? (
        <Text style={styles.warning}>
          Firebase env vars are missing. Copy `.env.example` to `.env` in `mobile/`.
        </Text>
      ) : null}

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Item name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.qtyInput]}
          placeholder="Qty"
          keyboardType="number-pad"
          value={qty}
          onChangeText={setQty}
        />
      </View>
      <Pressable onPress={onAddItem} style={[styles.button, !canSubmit && styles.disabled]}>
        <Text style={styles.buttonText}>Add Item</Text>
      </Pressable>

      {loading ? <Text style={styles.meta}>Loading...</Text> : null}
      {error ? <Text style={styles.warning}>{error.message}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.meta}>{item.quantity} {item.unit}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F4EC',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1C1A16'
  },
  warning: {
    color: '#842029',
    backgroundColor: '#F8D7DA',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#B9B2A3',
    backgroundColor: '#FFFDF8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  nameInput: {
    flex: 1
  },
  qtyInput: {
    width: 72
  },
  button: {
    backgroundColor: '#1D6E5B',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  disabled: {
    opacity: 0.4
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  list: {
    paddingVertical: 16,
    gap: 8
  },
  itemRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0DCCD'
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1A16'
  },
  meta: {
    color: '#5A5448'
  }
});
