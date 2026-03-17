import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'

test.describe('設定画面', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/settings')
  })

  test('設定画面が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '設定', level: 1 })).toBeVisible({ timeout: 10000 })
  })

  test('ログインユーザー情報が表示される', async ({ page }) => {
    await expect(page.getByText('test@foods-manager.local')).toBeVisible()
  })

  test('ログアウトボタンが機能する', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await expect(page).toHaveURL(/\/foods\/auth/, { timeout: 5000 })

    // ログアウト後にhomeへのアクセスはauthにリダイレクト
    await page.goto('/foods/home')
    await expect(page).toHaveURL(/\/foods\/auth/)
  })

  test('通知設定のトグルが操作できる', async ({ page }) => {
    const toggle = page.locator('input[type="checkbox"]').first()
    if (await toggle.isVisible()) {
      const before = await toggle.isChecked()
      await toggle.click()
      await expect(toggle).toBeChecked({ checked: !before })
    }
  })
})
