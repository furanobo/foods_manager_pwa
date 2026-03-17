import { Page } from '@playwright/test'

/**
 * UIを使って食材を追加するヘルパー
 * AddItemDialog を経由して登録する
 */
export async function addFoodItemViaUI(
  page: Page,
  item: {
    name: string
    category?: string
    expiredDate?: string // YYYY-MM-DD
    num?: number
  }
) {
  // 手動追加ボタン（鉛筆アイコン）をクリック
  await page.locator('button[title="手動入力"]').click()

  // ダイアログが開くまで待機
  await page.getByRole('heading', { name: '食材を追加' }).waitFor({ timeout: 5000 })

  // 商品名
  await page.getByPlaceholder('商品名を入力').fill(item.name)

  // カテゴリ
  if (item.category) {
    await page.getByPlaceholder('例: 野菜、乳製品').fill(item.category)
  }

  // 賞味期限
  if (item.expiredDate) {
    await page.locator('input[type="date"]').fill(item.expiredDate)
  }

  // 数量（+ボタンで増やす）
  if (item.num && item.num > 1) {
    for (let i = 1; i < item.num; i++) {
      await page.getByRole('button', { name: '＋' }).click()
    }
  }

  // 追加する
  await page.getByRole('button', { name: '追加する' }).click()

  // ダイアログが閉じるまで待機
  await page.getByRole('heading', { name: '食材を追加' }).waitFor({ state: 'hidden', timeout: 5000 })
}

/**
 * 明日の日付を YYYY-MM-DD 形式で返す
 */
export function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

/**
 * 指定日数後の日付を YYYY-MM-DD 形式で返す
 */
export function getFutureDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/**
 * 過去の日付を YYYY-MM-DD 形式で返す（期限切れ用）
 */
export function getPastDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}
