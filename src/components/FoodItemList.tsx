import { useState } from 'react'
import { useFoodItemStore } from '../store/foodItemStore'
import FoodItemCard from './FoodItemCard'
import ItemDetailDialog from './ItemDetailDialog'
import type { FoodItem } from '../types/FoodItem'
import { useAuthStore } from '../store/authStore'
import { updateItem as updateItemFS, deleteItem as deleteItemFS } from '../services/firestoreService'
import { uploadImage } from '../services/storageService'

export default function FoodItemList() {
  const getCategoryGroups = useFoodItemStore((s) => s.getCategoryGroups)
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const user = useAuthStore((s) => s.user)

  const groups = getCategoryGroups()
  const hasItems = Object.keys(groups).length > 0

  const handleSave = async (updates: Partial<FoodItem>, imageFile?: File) => {
    if (!user || !selectedItem) return
    let finalUpdates = { ...updates }
    if (imageFile) {
      try {
        const url = await uploadImage(user.uid, imageFile)
        finalUpdates = { ...finalUpdates, imageUrl: url }
      } catch (err) {
        console.error('Image upload failed:', err)
      }
    }
    await updateItemFS(user.uid, selectedItem.id, finalUpdates)
    setSelectedItem(null)
  }

  const handleDelete = async () => {
    if (!user || !selectedItem) return
    await deleteItemFS(user.uid, selectedItem.id)
    setSelectedItem(null)
  }

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-gray-300">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8.19-9.52-8.19-15.03 0h15.03zM1.02 17h15v2h-15z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">食材が登録されていません</p>
        <p className="text-gray-400 text-sm mt-1">右下の＋ボタンからバーコードをスキャンして追加しましょう</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-24">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 mb-2">
              {category}
            </h3>
            <div className="space-y-2 px-4">
              {items.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <ItemDetailDialog
          item={selectedItem}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}
