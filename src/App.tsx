import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import RecipePage from './pages/RecipePage'
import ShoppingPage from './pages/ShoppingPage'
import SettingsPage from './pages/SettingsPage'
import { useAuthStore } from './store/authStore'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-green-700 text-lg font-medium">読み込み中...</p>
      </div>
    </div>
  )
}

// 認証状態の単一管理。onAuthStateChanged と getRedirectResult をここだけで呼ぶ
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore()

  useEffect(() => {
    // 単一の onAuthStateChanged リスナー
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser(firebaseUser)
      else clearUser()
    })

    return unsubscribe
  }, [setUser, clearUser])

  return <>{children}</>
}

function AppRoutes() {
  const { user, initialized } = useAuthStore()

  // Firebase 初期化待ち中はどのルートもスピナー
  if (!initialized) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/home' : '/auth'} replace />} />
      <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <AuthPage />} />
      <Route path="/home" element={user ? <HomePage /> : <Navigate to="/auth" replace />} />
      <Route path="/recipe" element={user ? <RecipePage /> : <Navigate to="/auth" replace />} />
      <Route path="/shopping" element={user ? <ShoppingPage /> : <Navigate to="/auth" replace />} />
      <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter basename="/foods">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
