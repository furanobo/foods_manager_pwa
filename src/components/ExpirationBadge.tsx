interface ExpirationBadgeProps {
  expired: Date | null
}

export default function ExpirationBadge({ expired }: ExpirationBadgeProps) {
  if (!expired) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(expired)
  exp.setHours(0, 0, 0, 0)

  const diffMs = exp.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return (
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
        期限切れ
      </span>
    )
  }

  if (diffDays === 0) {
    return (
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
        今日まで
      </span>
    )
  }

  if (diffDays <= 2) {
    return (
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
        残り{diffDays}日
      </span>
    )
  }

  if (diffDays <= 6) {
    return (
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
        残り{diffDays}日
      </span>
    )
  }

  return (
    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      残り{diffDays}日
    </span>
  )
}
