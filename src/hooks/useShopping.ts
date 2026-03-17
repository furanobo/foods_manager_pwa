import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useShoppingStore } from '../store/shoppingStore'
import { subscribeToShopping } from '../services/firestoreService'

export function useShopping() {
  const user = useAuthStore((s) => s.user)
  const setItems = useShoppingStore((s) => s.setItems)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToShopping(user.uid, setItems)
    return unsubscribe
  }, [user, setItems])
}
