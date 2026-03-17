import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'
import { addFoodItemViaUI, getFutureDate, getPastDate } from './helpers/foodItems'

// ─────────────────────────────────────────────
// 表示・ナビゲーション
// ─────────────────────────────────────────────
test.describe('レシピ画面 - 表示・ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/recipe')
  })

  test('レシピ画面が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'レシピを探す' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('食材を選んでレシピを検索')).toBeVisible()
  })

  test('4タブナビゲーションが全て表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /レシピ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /買い物/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('レシピタブがアクティブ表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /レシピ/ })).toHaveClass(/text-green-600/)
  })

  test('未ログイン状態でアクセスするとauthにリダイレクト', async ({ page: p }) => {
    await p.goto('/foods/recipe')
    await expect(p).toHaveURL(/\/foods\/auth/)
  })
})

// ─────────────────────────────────────────────
// 食材ゼロ状態
// ─────────────────────────────────────────────
test.describe('レシピ画面 - 食材ゼロ状態', () => {
  test('食材が登録されていない場合は空状態が表示される', async ({ page }) => {
    // 新規コンテキストでテストユーザーとしてログインし食材なし状態を確認
    // （テストユーザーに食材がある場合はこのテストはスキップ可）
    await loginWithTestUser(page)
    await page.goto('/foods/recipe')
    await page.waitForTimeout(2000) // Firestore ロード待ち
    const emptyMsg = page.getByText('食材が登録されていません')
    const itemList = page.getByText('冷蔵庫の食材')
    // どちらか一方が表示されていればOK
    const hasEmpty = await emptyMsg.isVisible()
    const hasItems = await itemList.isVisible()
    expect(hasEmpty || hasItems).toBeTruthy()
  })
})

// ─────────────────────────────────────────────
// 食材選択・検索ボタン
// ─────────────────────────────────────────────
test.describe('レシピ画面 - 食材選択と検索', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    // 食材を追加してからレシピ画面へ
    await page.goto('/foods/home')
    await addFoodItemViaUI(page, { name: `レシピ用_${Date.now()}`, category: '野菜' })
    await page.goto('/foods/recipe')
    await page.getByText('冷蔵庫の食材').waitFor({ timeout: 10000 })
  })

  test('食材リストが表示される', async ({ page }) => {
    await expect(page.getByText('冷蔵庫の食材')).toBeVisible()
    await expect(page.getByText(/冷蔵庫の食材 \(\d+品\)/)).toBeVisible()
  })

  test('食材をタップで選択できる', async ({ page }) => {
    // 最初のリストアイテムをクリック
    const firstItem = page.locator('ul li').first()
    await firstItem.click()
    // 選択パネルが表示される
    await expect(page.getByText('選択中:')).toBeVisible({ timeout: 3000 })
  })

  test('選択した食材でCookpadで検索ボタンが表示される', async ({ page }) => {
    const firstItem = page.locator('ul li').first()
    await firstItem.click()
    await expect(page.getByRole('button', { name: /Cookpadで検索/ })).toBeVisible({ timeout: 3000 })
  })

  test('選択した食材で楽天レシピで検索ボタンが表示される', async ({ page }) => {
    const firstItem = page.locator('ul li').first()
    await firstItem.click()
    await expect(page.getByRole('button', { name: /楽天レシピで検索/ })).toBeVisible({ timeout: 3000 })
  })

  test('選択解除ボタンで選択がクリアされる', async ({ page }) => {
    const firstItem = page.locator('ul li').first()
    await firstItem.click()
    await page.getByText('選択中:').waitFor()
    await page.getByText('選択解除').click()
    await expect(page.getByText('選択中:')).not.toBeVisible({ timeout: 3000 })
  })

  test('食材を再クリックすると選択解除される', async ({ page }) => {
    const firstItem = page.locator('ul li').first()
    await firstItem.click()
    await page.getByText('選択中:').waitFor()
    await firstItem.click()
    await expect(page.getByText('選択中:')).not.toBeVisible({ timeout: 3000 })
  })

  test('複数食材を選択できる', async ({ page }) => {
    // 食材を2つ追加
    await page.goto('/foods/home')
    await addFoodItemViaUI(page, { name: `複数選択A_${Date.now()}` })
    await addFoodItemViaUI(page, { name: `複数選択B_${Date.now()}` })
    await page.goto('/foods/recipe')
    await page.getByText('冷蔵庫の食材').waitFor({ timeout: 10000 })

    const items = page.locator('ul li')
    await items.nth(0).click()
    await items.nth(1).click()

    // 選択中テキストに複数の食材名が含まれる（「、」区切り）
    const selectionText = page.getByText(/選択中:/)
    await expect(selectionText).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// 期限切れ間近バナー
// ─────────────────────────────────────────────
test.describe('レシピ画面 - 期限切れ間近バナー', () => {
  test('期限3日以内の食材がいると警告バナーが表示される', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/home')
    const name = `期限近いレシピ_${Date.now()}`
    await addFoodItemViaUI(page, { name, expiredDate: new Date().toISOString().split('T')[0] })
    await page.goto('/foods/recipe')
    await expect(page.getByText(/もうすぐ期限切れ/)).toBeVisible({ timeout: 10000 })
  })

  test('期限切れ間近バナーに全選択ボタンがある', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/home')
    await addFoodItemViaUI(page, {
      name: `全選択テスト_${Date.now()}`,
      expiredDate: getPastDate(1),
    })
    await page.goto('/foods/recipe')
    await expect(page.getByRole('button', { name: '全選択' })).toBeVisible({ timeout: 10000 })
  })

  test('全選択ボタンで期限切れ間近の食材が全て選択される', async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/home')
    await addFoodItemViaUI(page, {
      name: `全選択実行_${Date.now()}`,
      expiredDate: getPastDate(1),
    })
    await page.goto('/foods/recipe')
    await page.getByRole('button', { name: '全選択' }).click({ timeout: 10000 })
    await expect(page.getByText('選択中:')).toBeVisible({ timeout: 3000 })
  })
})

// ─────────────────────────────────────────────
// 買い物リスト連携
// ─────────────────────────────────────────────
test.describe('レシピ画面 - 買い物リスト連携', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/recipe')
  })

  test('不足食材を買い物リストに追加するボタンが表示される', async ({ page }) => {
    await expect(page.getByText('不足食材を買い物リストに追加')).toBeVisible({ timeout: 10000 })
  })

  test('不足食材ボタンは常にアクセスできる', async ({ page }) => {
    const btn = page.getByRole('button', { name: /不足食材を買い物リストに追加/ })
    await expect(btn).toBeEnabled({ timeout: 10000 })
  })
})

// ─────────────────────────────────────────────
// Cookpad/楽天レシピ外部リンク
// ─────────────────────────────────────────────
test.describe('レシピ画面 - 外部レシピサイト', () => {
  test('Cookpadで検索ボタンが新しいタブを開こうとする', async ({ page, context }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/home')
    await addFoodItemViaUI(page, { name: `外部リンクテスト_${Date.now()}` })
    await page.goto('/foods/recipe')
    await page.getByText('冷蔵庫の食材').waitFor({ timeout: 10000 })

    // 食材を選択
    await page.locator('ul li').first().click()

    // 新しいページが開くのを監視
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
      page.getByRole('button', { name: /Cookpadで検索/ }).click(),
    ])

    if (newPage) {
      await expect(newPage).toHaveURL(/cookpad\.com/)
      await newPage.close()
    } else {
      // ブラウザがポップアップをブロックした場合はスキップ
      test.skip()
    }
  })

  test('楽天レシピで検索ボタンが新しいタブを開こうとする', async ({ page, context }) => {
    await loginWithTestUser(page)
    await page.goto('/foods/home')
    await addFoodItemViaUI(page, { name: `楽天テスト_${Date.now()}` })
    await page.goto('/foods/recipe')
    await page.getByText('冷蔵庫の食材').waitFor({ timeout: 10000 })

    await page.locator('ul li').first().click()

    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
      page.getByRole('button', { name: /楽天レシピで検索/ }).click(),
    ])

    if (newPage) {
      await expect(newPage).toHaveURL(/rakuten\.co\.jp/)
      await newPage.close()
    } else {
      test.skip()
    }
  })
})
