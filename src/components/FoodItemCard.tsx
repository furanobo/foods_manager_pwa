import { useState } from 'react'
import type { FoodItem } from '../types/FoodItem'
import ExpirationBadge from './ExpirationBadge'

interface FoodItemCardProps {
  item: FoodItem
  onClick: () => void
}

export default function FoodItemCard({ item, onClick }: FoodItemCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 hover:shadow-md active:bg-gray-50 transition-shadow"
    >
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 font-medium text-sm truncate">{item.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{item.category || 'その他'}</p>
        <div className="flex items-center gap-2 mt-1">
          <ExpirationBadge expired={item.expired} />
        </div>
      </div>

      {/* Quantity */}
      <div className="flex-shrink-0 text-right">
        <span className="text-lg font-bold text-gray-700">{item.num}</span>
        <span className="text-xs text-gray-400 ml-0.5">個</span>
      </div>
    </button>
  )
}
