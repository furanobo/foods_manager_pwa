import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { FoodItem, Settings, ShoppingItem } from '../types/FoodItem'

function toFoodItem(id: string, data: Record<string, unknown>): FoodItem {
  return {
    id,
    name: (data.name as string) ?? '',
    category: (data.category as string) ?? '',
    expired: data.expired instanceof Timestamp ? data.expired.toDate() : null,
    num: (data.num as number) ?? 1,
    imageUrl: (data.imageUrl as string) ?? '',
    url: (data.url as string) ?? '',
    noticeFlag: (data.noticeFlag as boolean) ?? false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  }
}

export function subscribeToItems(uid: string, callback: (items: FoodItem[]) => void): () => void {
  const ref = collection(db, 'users', uid, 'items')
  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs.map((d) => toFoodItem(d.id, d.data() as Record<string, unknown>))
    callback(items)
  })
}

export async function addItem(uid: string, item: Omit<FoodItem, 'id'>): Promise<string> {
  const ref = collection(db, 'users', uid, 'items')
  const payload = {
    name: item.name,
    category: item.category,
    expired: item.expired ? Timestamp.fromDate(item.expired) : null,
    num: item.num,
    imageUrl: item.imageUrl,
    url: item.url,
    noticeFlag: item.noticeFlag,
    createdAt: Timestamp.fromDate(item.createdAt),
  }
  const docRef = await addDoc(ref, payload)
  return docRef.id
}

export async function updateItem(
  uid: string,
  itemId: string,
  updates: Partial<Omit<FoodItem, 'id'>>
): Promise<void> {
  const ref = doc(db, 'users', uid, 'items', itemId)
  const payload: Record<string, unknown> = { ...updates }
  if (updates.expired !== undefined) {
    payload.expired = updates.expired ? Timestamp.fromDate(updates.expired) : null
  }
  if (updates.createdAt !== undefined) {
    payload.createdAt = Timestamp.fromDate(updates.createdAt)
  }
  await updateDoc(ref, payload)
}

export async function deleteItem(uid: string, itemId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'items', itemId)
  await deleteDoc(ref)
}

export async function saveSettings(uid: string, settings: Settings): Promise<void> {
  const ref = doc(db, 'users', uid, 'settings', 'notification')
  await setDoc(ref, settings)
}

export async function loadSettings(uid: string): Promise<Settings | null> {
  const ref = doc(db, 'users', uid, 'settings', 'notification')
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as Settings
  return data
}

// Shopping list
function toShoppingItem(id: string, data: Record<string, unknown>): ShoppingItem {
  return {
    id,
    name: (data.name as string) ?? '',
    quantity: (data.quantity as string) ?? '',
    checked: (data.checked as boolean) ?? false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  }
}

export function subscribeToShopping(
  uid: string,
  callback: (items: ShoppingItem[]) => void
): () => void {
  const ref = collection(db, 'users', uid, 'shopping')
  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs
      .map((d) => toShoppingItem(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    callback(items)
  })
}

export async function addShoppingItem(
  uid: string,
  item: Omit<ShoppingItem, 'id'>
): Promise<string> {
  const ref = collection(db, 'users', uid, 'shopping')
  const docRef = await addDoc(ref, {
    name: item.name,
    quantity: item.quantity,
    checked: item.checked,
    createdAt: Timestamp.fromDate(item.createdAt),
  })
  return docRef.id
}

export async function updateShoppingItem(
  uid: string,
  itemId: string,
  updates: Partial<Omit<ShoppingItem, 'id'>>
): Promise<void> {
  const ref = doc(db, 'users', uid, 'shopping', itemId)
  await updateDoc(ref, updates as Record<string, unknown>)
}

export async function deleteShoppingItem(uid: string, itemId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'shopping', itemId)
  await deleteDoc(ref)
}

export async function clearCheckedShoppingItems(uid: string): Promise<void> {
  const ref = collection(db, 'users', uid, 'shopping')
  const q = query(ref, where('checked', '==', true))
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
