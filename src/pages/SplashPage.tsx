import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthStore } from '../store/authStore'

export default function SplashPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

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
  }, [navigate, setUser, clearUser])

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-green-700 text-lg font-medium">読み込み中...</p>
      </div>
    </div>
  )
}
