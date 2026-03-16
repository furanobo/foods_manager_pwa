import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        navigate('/home', { replace: true })
      } else {
        clearUser()
        navigate('/auth', { replace: true })
      }
    })
    return unsubscribe
  }, [setUser, clearUser, navigate])

  return user
}
