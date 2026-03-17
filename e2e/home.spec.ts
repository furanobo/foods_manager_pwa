import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'

test.describe('ホーム画面', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
  })

  test('ホーム画面が表示される', async ({ page }) => {
    await expect(page).toHaveURL(/\/foods\/home/)
    await expect(page.getByText('食材マネージャー')).toBeVisible()
  })

  test('下部ナビゲーションが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /ホーム/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('FAB（追加ボタン）が表示される', async ({ page }) => {
    const fab = page.locator('button').filter({ has: page.locator('svg') }).last()
    await expect(fab).toBeVisible()
  })

  test('設定画面に遷移できる', async ({ page }) => {
    await page.getByRole('link', { name: /設定/ }).click()
    await expect(page).toHaveURL(/\/foods\/settings/)
  })

  test('ホームタブでホームに戻れる', async ({ page }) => {
    await page.goto('/foods/settings')
    await page.getByRole('link', { name: /ホーム/ }).click()
    await expect(page).toHaveURL(/\/foods\/home/)
  })
})
