import { useState } from 'react'
import { useFoodItemStore } from '../store/foodItemStore'
import { useAuthStore } from '../store/authStore'
import { addShoppingItem } from '../services/firestoreService'
import BottomNav from '../components/BottomNav'
import type { FoodItem } from '../types/FoodItem'

function getDaysUntilExpiry(item: FoodItem): number | null {
  if (!item.expired) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(item.expired)
  exp.setHours(0, 0, 0, 0)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function ExpiryLabel({ days }: { days: number | null }) {
  if (days === null) return null
  if (days < 0) return <span className="text-xs text-red-500 font-medium">期限切れ</span>
  if (days === 0) return <span className="text-xs text-red-500 font-medium">今日まで</span>
  if (days <= 3) return <span className="text-xs text-orange-500 font-medium">あと{days}日</span>
  return <span className="text-xs text-gray-400">あと{days}日</span>
}

export default function RecipePage() {
  const user = useAuthStore((s) => s.user)
  const items = useFoodItemStore((s) => s.items)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addingToShop, setAddingToShop] = useState(false)
  const [shopAdded, setShopAdded] = useState(false)

  // Sort: expiring soon first
  const sortedItems = [...items].sort((a, b) => {
    const da = getDaysUntilExpiry(a) ?? 9999
    const db2 = getDaysUntilExpiry(b) ?? 9999
    return da - db2
  })

  // Expiring within 3 days
  const expiringSoon = sortedItems.filter((i) => {
    const d = getDaysUntilExpiry(i)
    return d !== null && d <= 3
  })

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedNames = items.filter((i) => selected.has(i.id)).map((i) => i.name)

  const handleSearchCookpad = () => {
    if (selectedNames.length === 0) return
    const query = encodeURIComponent(selectedNames.join(' '))
    window.open(`https://cookpad.com/search/${query}`, '_blank', 'noopener')
  }

  const handleSearchRakuten = () => {
    if (selectedNames.length === 0) return
    const query = encodeURIComponent(selectedNames.join(' '))
    window.open(`https://recipe.rakuten.co.jp/search/${query}/`, '_blank', 'noopener')
  }

  const handleAddMissingToShop = async () => {
    if (!user || selected.size === 0) return
    const shopName = prompt('買い物リストに追加する食材名を入力してください（複数は改行区切り）:\n\n例:\n卵\n牛乳', '')
    if (!shopName?.trim()) return
    setAddingToShop(true)
    try {
      const names = shopName.split('\n').map((n) => n.trim()).filter(Boolean)
      for (const name of names) {
        await addShoppingItem(user.uid, {
          name,
          quantity: '',
          checked: false,
          createdAt: new Date(),
        })
      }
      setShopAdded(true)
      setTimeout(() => setShopAdded(false), 2000)
    } finally {
      setAddingToShop(false)
    }
  }

  const handleSelectExpiringSoon = () => {
    setSelected(new Set(expiringSoon.map((i) => i.id)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-500 text-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold">レシピを探す</h1>
        <p className="text-green-100 text-xs mt-0.5">食材を選んでレシピを検索</p>
      </header>

      <main className="px-4 py-4 pb-32 space-y-4">
        {/* Expiring soon hint */}
        {expiringSoon.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-orange-700">
                ⚠ もうすぐ期限切れ ({expiringSoon.length}品)
              </p>
              <button
                onClick={handleSelectExpiringSoon}
                className="text-xs text-orange-600 underline"
              >
                全選択
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expiringSoon.map((item) => {
                const days = getDaysUntilExpiry(item)
                return (
                  <span
                    key={item.id}
                    className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5"
                  >
                    {item.name}
                    {days !== null && days <= 0 ? '(期限切れ)' : days !== null ? `(${days}日)` : ''}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Selection area */}
        {selected.size > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-green-700">
              選択中: {selectedNames.join('、')}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSearchCookpad}
                className="w-full bg-orange-500 text-white font-medium rounded-xl py-3 text-sm hover:bg-orange-600 active:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                Cookpadで検索
              </button>
              <button
                onClick={handleSearchRakuten}
                className="w-full bg-red-500 text-white font-medium rounded-xl py-3 text-sm hover:bg-red-600 active:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                楽天レシピで検索
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-gray-400 underline text-center"
              >
                選択解除
              </button>
            </div>
          </div>
        )}

        {/* Item list */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-gray-300">
                <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8.19-9.52-8.19-15.03 0h15.03zM1.02 17h15v2h-15z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">食材が登録されていません</p>
            <p className="text-gray-400 text-sm mt-1">ホームから食材を登録してください</p>
          </div>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-600">
                冷蔵庫の食材 ({items.length}品) — タップで選択
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {sortedItems.map((item) => {
                const days = getDaysUntilExpiry(item)
                const isSelected = selected.has(item.id)
                return (
                  <li
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      {item.category && (
                        <p className="text-xs text-gray-400">{item.category}</p>
                      )}
                    </div>
                    <ExpiryLabel days={days} />
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Add missing ingredients to shopping list */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            レシピに必要な食材が足りない場合
          </p>
          <button
            onClick={handleAddMissingToShop}
            disabled={addingToShop}
            className={`w-full border-2 border-green-500 text-green-600 font-medium rounded-xl py-3 text-sm hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${shopAdded ? 'bg-green-50' : ''}`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            {shopAdded ? '買い物リストに追加しました ✓' : '不足食材を買い物リストに追加'}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
