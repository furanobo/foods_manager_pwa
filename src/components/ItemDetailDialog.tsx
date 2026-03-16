import { useState, useRef } from 'react'
import type { FoodItem } from '../types/FoodItem'
import ExpirationBadge from './ExpirationBadge'

interface ItemDetailDialogProps {
  item: FoodItem
  onSave: (updates: Partial<FoodItem>, imageFile?: File) => void
  onDelete: () => void
  onCancel: () => void
}

export default function ItemDetailDialog({ item, onSave, onDelete, onCancel }: ItemDetailDialogProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [expiredStr, setExpiredStr] = useState(
    item.expired ? item.expired.toISOString().split('T')[0] : ''
  )
  const [num, setNum] = useState(item.num)
  const [noticeFlag, setNoticeFlag] = useState(item.noticeFlag)
  const [previewUrl, setPreviewUrl] = useState(item.imageUrl)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = () => {
    onSave(
      {
        name,
        category,
        expired: expiredStr ? new Date(expiredStr) : null,
        num,
        noticeFlag,
      },
      imageFile
    )
  }

  const changeNum = (delta: number) => {
    setNum((prev) => Math.min(99, Math.max(1, prev + delta)))
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '未設定'
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 truncate flex-1 mr-2">
            {editing ? '食材を編集' : item.name}
          </h2>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-green-600 hover:text-green-700 p-1"
                title="編集"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
            )}
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Image */}
          <div className="flex justify-center">
            <div
              className={`relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100 ${editing ? 'cursor-pointer' : ''}`}
              onClick={() => editing && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
              {editing && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                    <path d="M12 15.2l-3.2-3.2 1.4-1.4 1.8 1.8 3.8-3.8 1.4 1.4-5.2 5.2zm0-11.2C8.13 4 5 7.13 5 11v1H3v2h2v1c0 3.87 3.13 7 7 7s7-3.13 7-7v-1h2v-2h-2v-1c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v1h-2v-1c0-1.65-1.35-3-3-3s-3 1.35-3 3v1H7v-1c0-2.76 2.24-5 5-5z" />
                  </svg>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">商品名</label>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            ) : (
              <p className="text-gray-800 font-medium">{item.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">カテゴリ</label>
            {editing ? (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            ) : (
              <p className="text-gray-800">{item.category || '未分類'}</p>
            )}
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">賞味期限</label>
            {editing ? (
              <input
                type="date"
                value={expiredStr}
                onChange={(e) => setExpiredStr(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-gray-800">{formatDate(item.expired)}</p>
                <ExpirationBadge expired={item.expired} />
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">数量</label>
            {editing ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => changeNum(-1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-gray-800 w-10 text-center">{num}</span>
                <button
                  onClick={() => changeNum(1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  ＋
                </button>
              </div>
            ) : (
              <p className="text-gray-800">{item.num}個</p>
            )}
          </div>

          {/* Notice */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-500">期限通知</span>
            {editing ? (
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
            ) : (
              <span className={`text-sm font-medium ${item.noticeFlag ? 'text-green-600' : 'text-gray-400'}`}>
                {item.noticeFlag ? 'ON' : 'OFF'}
              </span>
            )}
          </div>

          {/* External Link */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
              商品ページを開く
            </a>
          )}

          {/* Delete Confirmation */}
          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium mb-3">本当に削除しますか？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 bg-red-500 text-white font-medium rounded-lg py-2 text-sm hover:bg-red-600"
                >
                  削除する
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 space-y-2">
          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 text-white font-medium rounded-xl py-3 text-sm hover:bg-green-600 transition-colors"
              >
                保存する
              </button>
            </div>
          ) : (
            !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 font-medium rounded-xl py-3 text-sm hover:bg-red-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                削除する
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
