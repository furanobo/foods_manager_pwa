export interface FoodItem {
  id: string
  name: string
  category: string
  expired: Date | null
  num: number
  imageUrl: string
  url: string
  noticeFlag: boolean
  createdAt: Date
}

export interface Settings {
  noticeFlag: boolean
  noticeTime: string // "HH:mm"
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  checked: boolean
  createdAt: Date
}
