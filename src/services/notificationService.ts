import type { FoodItem } from '../types/FoodItem'

export function checkAndNotifyOnOpen(items: FoodItem[], noticeTime: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const now = new Date()
  const [hours, minutes] = noticeTime.split(':').map(Number)
  const notifyAfter = new Date(now)
  notifyAfter.setHours(hours, minutes, 0, 0)

  // Show notification if current time is past the notice time (within 30 min window)
  const diff = now.getTime() - notifyAfter.getTime()
  if (diff >= 0 && diff < 30 * 60 * 1000) {
    const soonItems = items.filter((item) => {
      if (!item.expired) return false
      const diffDays = (item.expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 3 && diffDays >= 0
    })
    if (soonItems.length > 0) {
      const names = soonItems.map((i) => i.name).join('、')
      new Notification('食材の期限が近づいています', {
        body: `${names} の賞味期限が3日以内です`,
        icon: '/foods/icons/icon-192.png',
      })
    }
  }
}

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function scheduleExpirationNotifications(items: FoodItem[], noticeTime: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const now = new Date()
  const [hours, minutes] = noticeTime.split(':').map(Number)

  const notifyAt = new Date(now)
  notifyAt.setHours(hours, minutes, 0, 0)
  if (notifyAt <= now) {
    notifyAt.setDate(notifyAt.getDate() + 1)
  }

  const delay = notifyAt.getTime() - now.getTime()

  setTimeout(() => {
    const soonItems = items.filter((item) => {
      if (!item.expired) return false
      const diffMs = item.expired.getTime() - Date.now()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      return diffDays <= 3
    })

    if (soonItems.length > 0) {
      const names = soonItems.map((i) => i.name).join('、')
      new Notification('食材の期限が近づいています', {
        body: `${names} の賞味期限が近づいています`,
        icon: '/icons/icon-192.png',
      })
    }
  }, delay)
}
