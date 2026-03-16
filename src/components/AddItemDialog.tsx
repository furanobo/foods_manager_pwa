import { useState } from 'react'
import type { FoodItem } from '../types/FoodItem'

interface AddItemDialogProps {
  item: Partial<FoodItem>
  onAdd: (item: Omit<FoodItem, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export default function AddItemDialog({ item, onAdd, onCancel }: AddItemDialogProps) {
  const [name, setName] = useState(item.name ?? '')
  const [category, setCategory] = useState(item.category ?? '')
  const [expiredStr, setExpiredStr] = useState(
    item.expired ? item.expired.toISOString().split('T')[0] : ''
  )
  const [num, setNum] = useState(item.num ?? 1)
  const [noticeFlag, setNoticeFlag] = useState(item.noticeFlag ?? false)

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      category: category.trim() || 'その他',
      expired: expiredStr ? new Date(expiredStr) : null,
      num,
      imageUrl: item.imageUrl ?? '',
      url: item.url ?? '',
      noticeFlag,
    })
  }

  const changeNum = (delta: number) => {
    setNum((prev) => Math.min(99, Math.max(1, prev + delta)))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end justify-center">
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-slide-up"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">食材を追加</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Product Image */}
          {item.imageUrl && (
            <div className="flex justify-center">
              <img
                src={item.imageUrl}
                alt={name}
                className="w-24 h-24 object-cover rounded-xl shadow-sm"
                loading="lazy"
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="商品名を入力"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例: 野菜、乳製品"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">賞味期限</label>
            <input
              type="date"
              value={expiredStr}
              onChange={(e) => setExpiredStr(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeNum(-1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-800 w-10 text-center">{num}</span>
              <button
                onClick={() => changeNum(1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                ＋
              </button>
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">期限通知</span>
            <button
              onClick={() => setNoticeFlag((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                noticeFlag ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  noticeFlag ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="flex-1 bg-green-500 text-white font-medium rounded-xl py-3 text-sm hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-40"
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  )
}
