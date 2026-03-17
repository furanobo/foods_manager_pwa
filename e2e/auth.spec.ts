import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'

test.describe('認証', () => {
  // ─── ログイン画面表示 ───────────────────────────────────────────────
  test('ルート(/)にアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/')
    await page.waitForURL('**/foods/auth')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('ログイン画面が表示される', async ({ page }) => {
    await page.goto('/foods/auth')
    await expect(page.getByText('食材マネージャー')).toBeVisible()
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible()
  })

  test('ログイン画面にアプリの説明が表示される', async ({ page }) => {
    await page.goto('/foods/auth')
    await expect(page.getByText('バーコードスキャンで簡単登録')).toBeVisible()
    await expect(page.getByText('賞味期限の色分け警告')).toBeVisible()
    await expect(page.getByText('期限切れ通知機能')).toBeVisible()
  })

  // ─── 保護されたルートのリダイレクト ────────────────────────────────
  test('未ログイン状態でhomeにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/home')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('未ログイン状態でrecipeにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/recipe')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('未ログイン状態でshoppingにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/shopping')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('未ログイン状態でsettingsにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/settings')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('存在しないパスにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/nonexistent')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  // ─── ログイン後の挙動 ──────────────────────────────────────────────
  test('ログインするとhomeに遷移する', async ({ page }) => {
    await loginWithTestUser(page)
    await expect(page).toHaveURL(/\/foods\/home/)
  })

  test('ログイン済みでauthにアクセスするとhomeにリダイレクト', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/auth')
    await expect(page).toHaveURL(/\/foods\/home/)
  })

  // ─── ログアウト ────────────────────────────────────────────────────
  test('ログアウトするとauth画面に戻る', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await expect(page).toHaveURL(/\/foods\/auth/, { timeout: 5000 })
  })

  test('ログアウト後にhomeへのアクセスはauthにリダイレクト', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await page.waitForURL('**/foods/auth')
    await page.goto('/foods/home')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('ログアウト後にrecipeへのアクセスはauthにリダイレクト', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await page.waitForURL('**/foods/auth')
    await page.goto('/foods/recipe')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('ログアウト後にshoppingへのアクセスはauthにリダイレクト', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await page.waitForURL('**/foods/auth')
    await page.goto('/foods/shopping')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })
})
