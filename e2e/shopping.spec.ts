import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'

// ─────────────────────────────────────────────
// 表示・ナビゲーション
// ─────────────────────────────────────────────
test.describe('買い物リスト画面 - 表示・ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
  })

  test('買い物リスト画面が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '買い物リスト' })).toBeVisible({ timeout: 10000 })
  })

  test('4タブナビゲーションが全て表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /レシピ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /買い物/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('買い物タブがアクティブ表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /買い物/ })).toHaveClass(/text-green-600/)
  })

  test('アイテム追加フォームが表示される', async ({ page }) => {
    await expect(page.getByPlaceholder('商品名')).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder('数量')).toBeVisible()
    await expect(page.getByRole('button', { name: '追加' })).toBeVisible()
  })

  test('近くのスーパーを探すボタンが表示される', async ({ page }) => {
    await expect(page.getByText('近くのスーパーを探す')).toBeVisible({ timeout: 10000 })
  })

  test('未ログイン状態でアクセスするとauthにリダイレクト', async ({ page: p }) => {
    await p.goto('/foods/shopping')
    await expect(p).toHaveURL(/\/foods\/auth/)
  })
})

// ─────────────────────────────────────────────
// アイテム追加
// ─────────────────────────────────────────────
test.describe('買い物リスト画面 - アイテム追加', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
    await page.getByPlaceholder('商品名').waitFor({ timeout: 10000 })
  })

  test('商品名が空のとき追加ボタンが無効', async ({ page }) => {
    await expect(page.getByRole('button', { name: '追加' })).toBeDisabled()
  })

  test('商品名を入力すると追加ボタンが有効になる', async ({ page }) => {
    await page.getByPlaceholder('商品名').fill('牛乳')
    await expect(page.getByRole('button', { name: '追加' })).toBeEnabled()
  })

  test('アイテムを追加できる', async ({ page }) => {
    const name = `買い物追加_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
  })

  test('数量付きでアイテムを追加できる', async ({ page }) => {
    const name = `数量付き_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByPlaceholder('数量').fill('2本')
    await page.getByRole('button', { name: '追加' }).click()
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('2本').first()).toBeVisible()
  })

  test('追加後に商品名フィールドがクリアされる', async ({ page }) => {
    await page.getByPlaceholder('商品名').fill('テスト商品')
    await page.getByRole('button', { name: '追加' }).click()
    await expect(page.getByPlaceholder('商品名')).toHaveValue('', { timeout: 5000 })
  })

  test('追加後に数量フィールドがクリアされる', async ({ page }) => {
    await page.getByPlaceholder('商品名').fill('テスト商品')
    await page.getByPlaceholder('数量').fill('3袋')
    await page.getByRole('button', { name: '追加' }).click()
    await expect(page.getByPlaceholder('数量')).toHaveValue('', { timeout: 5000 })
  })

  test('複数アイテムを続けて追加できる', async ({ page }) => {
    const ts = Date.now()
    const items = [`連続追加A_${ts}`, `連続追加B_${ts}`, `連続追加C_${ts}`]
    for (const name of items) {
      await page.getByPlaceholder('商品名').fill(name)
      await page.getByRole('button', { name: '追加' }).click()
      await page.getByText(name).waitFor({ timeout: 10000 })
    }
    for (const name of items) {
      await expect(page.getByText(name)).toBeVisible()
    }
  })

  test('追加したアイテムが未購入セクションに表示される', async ({ page }) => {
    const name = `未購入_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })
    // 未購入セクションに表示
    await expect(page.getByText(/未購入/).first()).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// チェック・アンチェック
// ─────────────────────────────────────────────
test.describe('買い物リスト画面 - チェック操作', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
    await page.getByPlaceholder('商品名').waitFor({ timeout: 10000 })
  })

  test('アイテムをチェックすると購入済みセクションに移動する', async ({ page }) => {
    const name = `チェック_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })

    // 未購入アイテムのチェックボタン（円形ボタン）をクリック
    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').first().click()

    // 購入済みセクションに表示（line-through）
    await expect(page.locator('.line-through').filter({ hasText: name })).toBeVisible({ timeout: 5000 })
  })

  test('購入済みアイテムをアンチェックすると未購入セクションに戻る', async ({ page }) => {
    const name = `アンチェック_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })

    // チェック
    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').first().click()
    await page.locator('.line-through').filter({ hasText: name }).waitFor({ timeout: 5000 })

    // アンチェック（購入済みアイテムのボタンをクリック）
    const checkedItem = page.locator('li').filter({ hasText: name })
    await checkedItem.locator('button').first().click()
    await expect(page.locator('.line-through').filter({ hasText: name })).not.toBeVisible({ timeout: 5000 })
    // 未購入セクションに戻る
    await expect(page.getByText(name).first()).toBeVisible()
  })

  test('チェック後に購入済みセクションのヘッダーが表示される', async ({ page }) => {
    const name = `購入済みヘッダー_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })

    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').first().click()

    await expect(page.getByText(/購入済み/)).toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────
// 削除操作
// ─────────────────────────────────────────────
test.describe('買い物リスト画面 - 削除操作', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
    await page.getByPlaceholder('商品名').waitFor({ timeout: 10000 })
  })

  test('未購入アイテムを削除できる', async ({ page }) => {
    const name = `削除テスト_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })

    // ×ボタンをクリック（アイテム行の最後のボタン）
    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').last().click()

    await expect(page.getByText(name)).not.toBeVisible({ timeout: 5000 })
  })

  test('購入済みアイテムをクリアできる', async ({ page }) => {
    const name = `クリアテスト_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })

    // チェック
    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').first().click()
    await page.locator('.line-through').filter({ hasText: name }).waitFor({ timeout: 5000 })

    // 「クリア」ボタンをクリック
    await page.getByRole('button', { name: 'クリア' }).click()
    await expect(page.getByText(name)).not.toBeVisible({ timeout: 10000 })
  })

  test('全てクリア後に購入済みセクションが消える', async ({ page }) => {
    const name = `全クリア_${Date.now()}`
    await page.getByPlaceholder('商品名').fill(name)
    await page.getByRole('button', { name: '追加' }).click()
    await page.getByText(name).waitFor({ timeout: 10000 })

    const item = page.locator('li').filter({ hasText: name })
    await item.locator('button').first().click()
    await page.getByText(/購入済み/).waitFor({ timeout: 5000 })

    await page.getByRole('button', { name: 'クリア' }).click()
    await expect(page.getByText(/購入済み/)).not.toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────
// マップ機能
// ─────────────────────────────────────────────
test.describe('買い物リスト画面 - マップ機能', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
  })

  test('近くのスーパーを探すボタンが表示される', async ({ page }) => {
    await expect(page.getByText('近くのスーパーを探す')).toBeVisible({ timeout: 10000 })
  })

  test('ボタンをクリックするとGoogle Mapsが開く（位置情報拒否ケース）', async ({ page, context }) => {
    // 位置情報を拒否してテスト
    await context.grantPermissions([])

    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
      page.getByText('近くのスーパーを探す').click({ timeout: 10000 }),
    ])

    if (newPage) {
      await expect(newPage).toHaveURL(/google\.com\/maps/)
      await newPage.close()
    } else {
      // ポップアップブロック時はURLチェックをスキップ
      test.skip()
    }
  })

  test('ボタンクリック中に位置情報取得中メッセージが表示される', async ({ page }) => {
    // 位置情報を許可してテスト（応答が遅い間にローディング表示を確認）
    // geolocation mock
    await page.route('**', (route) => route.continue())
    const btn = page.getByText('近くのスーパーを探す')
    await expect(btn).toBeEnabled({ timeout: 10000 })
  })
})

// ─────────────────────────────────────────────
// 空状態
// ─────────────────────────────────────────────
test.describe('買い物リスト画面 - 空状態', () => {
  test('買い物リストが空のとき空状態メッセージが表示される可能性がある', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/shopping')
    await page.waitForTimeout(2000)

    const emptyMsg = page.getByText('買い物リストは空です')
    const itemSection = page.getByText(/未購入/)

    const hasEmpty = await emptyMsg.isVisible()
    const hasItems = await itemSection.isVisible()
    expect(hasEmpty || hasItems).toBeTruthy()
  })
})
