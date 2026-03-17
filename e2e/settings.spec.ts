import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'

// ─────────────────────────────────────────────
// 表示・ナビゲーション
// ─────────────────────────────────────────────
test.describe('設定画面 - 表示・ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
  })

  test('設定画面が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '設定', level: 1 })).toBeVisible({ timeout: 10000 })
  })

  test('4タブナビゲーションが全て表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /レシピ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /買い物/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('設定タブがアクティブ表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /設定/ })).toHaveClass(/text-green-600/)
  })

  test('通知設定セクションが表示される', async ({ page }) => {
    await expect(page.getByText('通知設定')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('期限通知')).toBeVisible()
    await expect(page.getByText('賞味期限が近い食材をお知らせ')).toBeVisible()
  })

  test('アカウントセクションが表示される', async ({ page }) => {
    await expect(page.getByText('アカウント')).toBeVisible()
  })

  test('その他セクションとバージョン情報が表示される', async ({ page }) => {
    await expect(page.getByText('その他')).toBeVisible()
    await expect(page.getByText(/バージョン: \d+\.\d+\.\d+/)).toBeVisible()
  })

  test('未ログイン状態でアクセスするとauthにリダイレクト', async ({ page: p }) => {
    await p.goto('/foods/settings')
    await expect(p).toHaveURL(/\/foods\/auth/)
  })
})

// ─────────────────────────────────────────────
// ユーザー情報表示
// ─────────────────────────────────────────────
test.describe('設定画面 - ユーザー情報', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
  })

  test('ログインユーザーのメールアドレスが表示される', async ({ page }) => {
    await expect(page.getByText('test@foods-manager.local')).toBeVisible({ timeout: 10000 })
  })

  test('アバター（アイコンまたは画像）が表示される', async ({ page }) => {
    // アバターエリアが表示される（photoURL なければイニシャル or ? 表示）
    const avatarArea = page.locator('.w-10.h-10.rounded-full').first()
    await expect(avatarArea).toBeVisible({ timeout: 10000 })
  })
})

// ─────────────────────────────────────────────
// 通知設定
// ─────────────────────────────────────────────
test.describe('設定画面 - 通知設定', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
    await page.getByText('期限通知').waitFor({ timeout: 10000 })
  })

  test('通知トグルが表示される', async ({ page }) => {
    // トグルボタン（relative w-12 h-6 rounded-full）
    const toggle = page.locator('button.relative.w-12.h-6.rounded-full').first()
    await expect(toggle).toBeVisible()
  })

  test('通知トグルをONにすると通知時刻フィールドが表示される', async ({ page }) => {
    const toggle = page.locator('button.relative.w-12.h-6.rounded-full').first()
    const isOn = await toggle.evaluate((el) => el.classList.contains('bg-green-500'))

    if (!isOn) {
      // 通知APIのポップアップをモック
      await page.evaluate(() => {
        Object.defineProperty(window, 'Notification', {
          value: class {
            static permission = 'granted'
            static requestPermission = async () => 'granted'
            constructor() {}
          },
          writable: true,
        })
      })
      await toggle.click()
    }

    await expect(page.getByText('通知時刻')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[type="time"]')).toBeVisible()
  })

  test('通知時刻を変更できる', async ({ page }) => {
    const toggle = page.locator('button.relative.w-12.h-6.rounded-full').first()
    const isOn = await toggle.evaluate((el) => el.classList.contains('bg-green-500'))

    if (!isOn) {
      await page.evaluate(() => {
        Object.defineProperty(window, 'Notification', {
          value: class {
            static permission = 'granted'
            static requestPermission = async () => 'granted'
            constructor() {}
          },
          writable: true,
        })
      })
      await toggle.click()
    }

    const timeInput = page.locator('input[type="time"]')
    await timeInput.waitFor({ timeout: 5000 })
    await timeInput.fill('09:00')
    await expect(timeInput).toHaveValue('09:00')
  })
})

// ─────────────────────────────────────────────
// 設定保存
// ─────────────────────────────────────────────
test.describe('設定画面 - 設定保存', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
    await page.getByRole('button', { name: '設定を保存' }).waitFor({ timeout: 10000 })
  })

  test('設定を保存ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: '設定を保存' })).toBeVisible()
  })

  test('設定を保存をクリックすると保存済みメッセージが表示される', async ({ page }) => {
    await page.getByRole('button', { name: '設定を保存' }).click()
    await expect(page.getByRole('button', { name: /保存しました/ })).toBeVisible({ timeout: 5000 })
  })

  test('保存後に設定を保存ボタンに戻る', async ({ page }) => {
    await page.getByRole('button', { name: '設定を保存' }).click()
    await page.getByRole('button', { name: /保存しました/ }).waitFor({ timeout: 5000 })
    // 2秒後に元のラベルに戻る
    await expect(page.getByRole('button', { name: '設定を保存' })).toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────
// ログアウト
// ─────────────────────────────────────────────
test.describe('設定画面 - ログアウト', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
  })

  test('ログアウトボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible({ timeout: 10000 })
  })

  test('ログアウトするとauth画面に遷移する', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await expect(page).toHaveURL(/\/foods\/auth/, { timeout: 5000 })
  })

  test('ログアウト後にauth画面のログインボタンが表示される', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await page.waitForURL('**/foods/auth')
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible()
  })

  test('ログアウト後にhomeへのアクセスはauthにリダイレクト', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await page.waitForURL('**/foods/auth')
    await page.goto('/foods/home')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('ログアウト後にshoppingへのアクセスはauthにリダイレクト', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await page.waitForURL('**/foods/auth')
    await page.goto('/foods/shopping')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('ログアウト後にrecipeへのアクセスはauthにリダイレクト', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await page.waitForURL('**/foods/auth')
    await page.goto('/foods/recipe')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })
})
