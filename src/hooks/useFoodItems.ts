import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFoodItemStore } from '../store/foodItemStore'
import { subscribeToItems } from '../services/firestoreService'

export function useFoodItems() {
  const user = useAuthStore((s) => s.user)
  const setItems = useFoodItemStore((s) => s.setItems)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToItems(user.uid, setItems)
    return unsubscribe
  }, [user, setItems])
}
