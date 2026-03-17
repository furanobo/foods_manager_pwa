import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'

test.describe('買い物リスト画面', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
  })

  test('買い物リスト画面が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '買い物リスト' })).toBeVisible({ timeout: 10000 })
  })

  test('4タブナビゲーションが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /レシピ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /買い物/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('アイテム追加フォームが表示される', async ({ page }) => {
    await expect(page.getByPlaceholder('商品名')).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder('数量')).toBeVisible()
    await expect(page.getByRole('button', { name: '追加' })).toBeVisible()
  })

  test('アイテムを追加できる', async ({ page }) => {
    const name = `テスト商品_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
  })

  test('アイテムをチェックできる', async ({ page }) => {
    // Add an item first
    const name = `チェックテスト_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })

    // Check the item (click the circle button next to it)
    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').first().click()

    // Item should now appear in checked section (with line-through style)
    await expect(page.locator('.line-through').filter({ hasText: name })).toBeVisible({ timeout: 5000 })
  })

  test('近くのスーパーを探すボタンが表示される', async ({ page }) => {
    await expect(page.getByText('近くのスーパーを探す')).toBeVisible({ timeout: 10000 })
  })

  test('未ログイン状態でアクセスするとauthにリダイレクト', async ({ page: newPage }) => {
    await newPage.goto('/foods/shopping')
    await expect(newPage).toHaveURL(/\/foods\/auth/)
  })
})
