import { test, expect } from '@playwright/test'
import { loginWithTestUser, TEST_USER } from './helpers/auth'

test.describe('認証', () => {
  test('ログイン画面が表示される', async ({ page }) => {
    await page.goto('/foods/')
    await page.waitForURL('**/foods/auth')
    await expect(page.getByText('食材マネージャー')).toBeVisible()
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible()
  })

  test('ログインするとホームに遷移する', async ({ page }) => {
    await loginWithTestUser(page)
    await expect(page).toHaveURL(/\/foods\/home/)
  })

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

  test('未ログイン状態でhomeにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/home')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('未ログイン状態でsettingsにアクセスするとauthにリダイレクト', async ({ page }) => {
    await page.goto('/foods/settings')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('ログイン済みでauthにアクセスするとhomeにリダイレクト', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/auth')
    await expect(page).toHaveURL(/\/foods\/home/)
  })
})
