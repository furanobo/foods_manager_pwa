import { useState, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useShoppingStore } from '../store/shoppingStore'
import { useShopping } from '../hooks/useShopping'
import {
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearCheckedShoppingItems,
} from '../services/firestoreService'
import BottomNav from '../components/BottomNav'

export default function ShoppingPage() {
  useShopping()
  const user = useAuthStore((s) => s.user)
  const items = useShoppingStore((s) => s.items)
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [adding, setAdding] = useState(false)
  const [locating, setLocating] = useState(false)

  const handleFindSupermarket = useCallback(() => {
    if (!('geolocation' in navigator)) {
      window.open('https://www.google.com/maps/search/スーパー', '_blank')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        window.open(
          `https://www.google.com/maps/search/スーパー/@${lat},${lng},15z`,
          '_blank',
        )
        setLocating(false)
      },
      () => {
        window.open('https://www.google.com/maps/search/スーパー', '_blank')
        setLocating(false)
      },
    )
  }, [])

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newName.trim()) return
    setAdding(true)
    try {
      await addShoppingItem(user.uid, {
        name: newName.trim(),
        quantity: newQty.trim(),
        checked: false,
        createdAt: new Date(),
      })
      setNewName('')
      setNewQty('')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (id: string, checked: boolean) => {
    if (!user) return
    await updateShoppingItem(user.uid, id, { checked })
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    await deleteShoppingItem(user.uid, id)
  }

  const handleClearChecked = async () => {
    if (!user) return
    await clearCheckedShoppingItems(user.uid)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-500 text-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold">買い物リスト</h1>
      </header>

      <main className="px-4 py-4 pb-32 space-y-4">
        {/* Add item form */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-600">アイテムを追加</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="商品名"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="数量"
              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              追加
            </button>
          </div>
        </form>

        {/* Unchecked items */}
        {unchecked.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-600">未購入 ({unchecked.length})</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {unchecked.map((item) => (
                <li key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item.id, true)}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-green-400 transition-colors"
                  />
                  <span className="flex-1 text-sm text-gray-800">{item.name}</span>
                  {item.quantity && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {item.quantity}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Checked items */}
        {checked.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-400">購入済み ({checked.length})</h2>
              <button
                onClick={handleClearChecked}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                クリア
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              {checked.map((item) => (
                <li key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item.id, false)}
                    className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </button>
                  <span className="flex-1 text-sm text-gray-400 line-through">{item.name}</span>
                  {item.quantity && (
                    <span className="text-xs text-gray-300 bg-gray-100 rounded-full px-2 py-0.5">
                      {item.quantity}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-200 hover:text-red-400 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-gray-300">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">買い物リストは空です</p>
            <p className="text-gray-400 text-sm mt-1">上のフォームから追加してください</p>
          </div>
        )}

        {/* Find nearby supermarket */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <button
            onClick={handleFindSupermarket}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-medium rounded-xl py-3 text-sm hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {locating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                位置情報を取得中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                近くのスーパーを探す
              </>
            )}
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
