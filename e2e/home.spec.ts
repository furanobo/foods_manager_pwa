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

  test('4タブナビゲーションが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /レシピ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /買い物/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('FABが表示される', async ({ page }) => {
    const fab = page.locator('button[title="バーコードスキャン"]')
    await expect(fab).toBeVisible()
  })

  test('レシピタブに遷移できる', async ({ page }) => {
    await page.getByRole('link', { name: /レシピ/ }).click()
    await expect(page).toHaveURL(/\/foods\/recipe/)
    await expect(page.getByText('レシピを探す')).toBeVisible()
  })

  test('買い物タブに遷移できる', async ({ page }) => {
    await page.getByRole('link', { name: /買い物/ }).click()
    await expect(page).toHaveURL(/\/foods\/shopping/)
    await expect(page.getByText('買い物リスト')).toBeVisible()
  })

  test('設定タブに遷移できる', async ({ page }) => {
    await page.getByRole('link', { name: /設定/ }).click()
    await expect(page).toHaveURL(/\/foods\/settings/)
  })

  test('食材タブでホームに戻れる', async ({ page }) => {
    await page.goto('/foods/settings')
    await page.getByRole('link', { name: /食材/ }).click()
    await expect(page).toHaveURL(/\/foods\/home/)
  })
})
