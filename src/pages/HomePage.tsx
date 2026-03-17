import { useState, useEffect } from 'react'
import { useFoodItems } from '../hooks/useFoodItems'
import { useAuthStore } from '../store/authStore'
import { useSettingStore } from '../store/settingStore'
import { useFoodItemStore } from '../store/foodItemStore'
import { addItem } from '../services/firestoreService'
import { searchByJanCode } from '../services/yahooApiService'
import { checkAndNotifyOnOpen } from '../services/notificationService'
import FoodItemList from '../components/FoodItemList'
import BarcodeScanner from '../components/BarcodeScanner'
import AddItemDialog from '../components/AddItemDialog'
import BottomNav from '../components/BottomNav'
import type { FoodItem } from '../types/FoodItem'

type UIState =
  | { mode: 'idle' }
  | { mode: 'scanning' }
  | { mode: 'add'; item: Partial<FoodItem> }
  | { mode: 'loading' }

export default function HomePage() {
  useFoodItems()
  const user = useAuthStore((s) => s.user)
  const items = useFoodItemStore((s) => s.items)
  const settings = useSettingStore((s) => s.settings)
  const [ui, setUi] = useState<UIState>({ mode: 'idle' })

  useEffect(() => {
    if (settings.noticeFlag && items.length > 0) {
      checkAndNotifyOnOpen(items, settings.noticeTime)
    }
  }, [items, settings.noticeFlag, settings.noticeTime])
  const [scanError, setScanError] = useState<string | null>(null)

  const handleFabClick = () => {
    setScanError(null)
    setUi({ mode: 'scanning' })
  }

  const handleManualAdd = () => {
    setScanError(null)
    setUi({ mode: 'add', item: {} })
  }

  const handleScanned = async (code: string) => {
    setUi({ mode: 'loading' })
    try {
      const product = await searchByJanCode(code)
      setUi({ mode: 'add', item: product })
    } catch (err) {
      // CORS or API error: fall back to manual entry with the JAN code
      console.warn('Yahoo API failed, falling back to manual entry:', err)
      setScanError('商品情報の取得に失敗しました。手動で入力してください。')
      setUi({ mode: 'add', item: { name: `JAN: ${code}` } })
    }
  }

  const handleAdd = async (item: Omit<FoodItem, 'id' | 'createdAt'>) => {
    if (!user) return
    await addItem(user.uid, { ...item, createdAt: new Date() })
    setUi({ mode: 'idle' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white px-4 py-4 shadow-sm safe-area-top">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8.19-9.52-8.19-15.03 0h15.03zM1.02 17h15v2h-15z" />
          </svg>
          <h1 className="text-xl font-bold">食材マネージャー</h1>
        </div>
      </header>

      {/* Content */}
      <main className="pt-4">
        {scanError && (
          <div className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-700 text-sm">
            {scanError}
          </div>
        )}
        <FoodItemList />
      </main>

      {/* FAB */}
      <button
        onClick={handleFabClick}
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 active:bg-green-700 transition-colors z-30"
        title="バーコードスキャン"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>

      {/* Manual add button */}
      <button
        onClick={handleManualAdd}
        className="fixed bottom-20 right-20 w-12 h-12 bg-white text-green-600 border-2 border-green-500 rounded-full shadow-md flex items-center justify-center hover:bg-green-50 transition-colors z-30"
        title="手動入力"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </button>

      {/* Loading overlay */}
      {ui.mode === 'loading' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 text-sm">商品情報を検索中...</p>
          </div>
        </div>
      )}

      {/* Barcode Scanner */}
      {ui.mode === 'scanning' && (
        <BarcodeScanner
          onScanned={handleScanned}
          onCancel={() => setUi({ mode: 'idle' })}
        />
      )}

      {/* Add Item Dialog */}
      {ui.mode === 'add' && (
        <AddItemDialog
          item={ui.item}
          onAdd={handleAdd}
          onCancel={() => setUi({ mode: 'idle' })}
        />
      )}

      <BottomNav />
    </div>
  )
}
