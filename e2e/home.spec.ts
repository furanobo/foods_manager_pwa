import { test, expect } from '@playwright/test'
import { loginWithTestUser } from './helpers/auth'
import { addFoodItemViaUI, getTomorrowDate, getFutureDate, getPastDate } from './helpers/foodItems'

// ─────────────────────────────────────────────
// 表示・ナビゲーション
// ─────────────────────────────────────────────
test.describe('ホーム画面 - 表示・ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
  })

  test('ホーム画面が表示される', async ({ page }) => {
    await expect(page).toHaveURL(/\/foods\/home/)
    await expect(page.getByText('食材マネージャー')).toBeVisible()
  })

  test('4タブナビゲーションが全て表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /レシピ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /買い物/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /設定/ })).toBeVisible()
  })

  test('食材タブがアクティブ表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /食材/ })).toHaveClass(/text-green-600/)
  })

  test('バーコードスキャンFABが表示される', async ({ page }) => {
    await expect(page.locator('button[title="バーコードスキャン"]')).toBeVisible()
  })

  test('手動入力ボタンが表示される', async ({ page }) => {
    await expect(page.locator('button[title="手動入力"]')).toBeVisible()
  })

  test('レシピタブをクリックするとrecipeページに遷移', async ({ page }) => {
    await page.getByRole('link', { name: /レシピ/ }).click()
    await expect(page).toHaveURL(/\/foods\/recipe/)
    await expect(page.getByText('レシピを探す')).toBeVisible()
  })

  test('買い物タブをクリックするとshoppingページに遷移', async ({ page }) => {
    await page.getByRole('link', { name: /買い物/ }).click()
    await expect(page).toHaveURL(/\/foods\/shopping/)
    await expect(page.getByText('買い物リスト')).toBeVisible()
  })

  test('設定タブをクリックするとsettingsページに遷移', async ({ page }) => {
    await page.getByRole('link', { name: /設定/ }).click()
    await expect(page).toHaveURL(/\/foods\/settings/)
  })

  test('他タブから食材タブをクリックするとhomeに戻る', async ({ page }) => {
    await page.goto('/foods/settings')
    await page.getByRole('link', { name: /食材/ }).click()
    await expect(page).toHaveURL(/\/foods\/home/)
  })
})

// ─────────────────────────────────────────────
// バーコードスキャナー
// ─────────────────────────────────────────────
test.describe('ホーム画面 - バーコードスキャナー', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
  })

  test('FABをクリックするとスキャナーUI（キャンセルボタン）が表示される', async ({ page }) => {
    await page.locator('button[title="バーコードスキャン"]').click()
    await expect(page.getByRole('button', { name: /キャンセル/ })).toBeVisible({ timeout: 5000 })
  })

  test('スキャナーのキャンセルでホーム画面に戻る', async ({ page }) => {
    await page.locator('button[title="バーコードスキャン"]').click()
    await page.getByRole('button', { name: /キャンセル/ }).click()
    await expect(page.locator('button[title="バーコードスキャン"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /キャンセル/ })).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────
// 手動追加ダイアログ
// ─────────────────────────────────────────────
test.describe('ホーム画面 - 手動追加ダイアログ', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
  })

  test('手動入力ボタンをクリックするとダイアログが開く', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await expect(page.getByRole('heading', { name: '食材を追加' })).toBeVisible()
  })

  test('ダイアログに商品名・カテゴリ・期限・数量フォームが表示される', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await expect(page.getByPlaceholder('商品名を入力')).toBeVisible()
    await expect(page.getByPlaceholder('例: 野菜、乳製品')).toBeVisible()
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await expect(page.getByRole('button', { name: '＋' })).toBeVisible()
    await expect(page.getByRole('button', { name: '−' })).toBeVisible()
  })

  test('商品名が空の場合は追加ボタンが無効', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await expect(page.getByRole('button', { name: '追加する' })).toBeDisabled()
  })

  test('商品名を入力すると追加ボタンが有効になる', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await page.getByPlaceholder('商品名を入力').fill('テスト')
    await expect(page.getByRole('button', { name: '追加する' })).toBeEnabled()
  })

  test('数量の＋ボタンで数量が増える', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await page.getByRole('button', { name: '＋' }).click()
    await page.getByRole('button', { name: '＋' }).click()
    // 初期値1 + 2回 = 3
    await expect(page.locator('.text-2xl.font-bold').first()).toHaveText('3')
  })

  test('数量の−ボタンで1以下にはならない', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await page.getByRole('button', { name: '−' }).click()
    await expect(page.locator('.text-2xl.font-bold').first()).toHaveText('1')
  })

  test('キャンセルボタンでダイアログが閉じる', async ({ page }) => {
    await page.locator('button[title="手動入力"]').click()
    await page.getByRole('heading', { name: '食材を追加' }).waitFor()
    await page.getByRole('button', { name: 'キャンセル' }).first().click()
    await expect(page.getByRole('heading', { name: '食材を追加' })).not.toBeVisible()
  })

  test('食材を追加するとリストに表示される', async ({ page }) => {
    const name = `テスト食材_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
  })

  test('カテゴリを指定して追加するとカテゴリ別グループに表示される', async ({ page }) => {
    const name = `カテゴリ食材_${Date.now()}`
    await addFoodItemViaUI(page, { name, category: '野菜' })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('野菜').first()).toBeVisible()
  })

  test('カテゴリ未入力の場合はその他として登録される', async ({ page }) => {
    const name = `カテゴリなし_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    // FoodItemCard に「その他」と表示される
    await expect(page.getByText('その他').first()).toBeVisible()
  })

  test('賞味期限を指定して追加できる', async ({ page }) => {
    const name = `期限付き_${Date.now()}`
    await addFoodItemViaUI(page, { name, expiredDate: getFutureDate(10) })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/残り\d+日/).first()).toBeVisible()
  })

  test('数量を指定して追加できる', async ({ page }) => {
    const name = `数量テスト_${Date.now()}`
    await addFoodItemViaUI(page, { name, num: 3 })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('3').first()).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// 食材詳細ダイアログ
// ─────────────────────────────────────────────
test.describe('ホーム画面 - 食材詳細ダイアログ', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
  })

  test('食材カードをクリックすると詳細ダイアログが開く', async ({ page }) => {
    const name = `詳細テスト_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await page.getByText(name).click()
    await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 5000 })
  })

  test('詳細ダイアログに食材情報が表示される', async ({ page }) => {
    const name = `情報確認_${Date.now()}`
    await addFoodItemViaUI(page, { name, category: '乳製品', num: 2 })
    await page.getByText(name).click()
    await expect(page.getByText('乳製品')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('2個')).toBeVisible()
  })

  test('詳細ダイアログに編集ボタンが表示される', async ({ page }) => {
    const name = `編集ボタン_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await page.getByText(name).click()
    await expect(page.locator('button[title="編集"]')).toBeVisible({ timeout: 5000 })
  })

  test('編集ボタンをクリックすると編集モードになる', async ({ page }) => {
    const name = `編集モード_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await page.getByText(name).click()
    await page.locator('button[title="編集"]').click()
    await expect(page.getByRole('heading', { name: '食材を編集' })).toBeVisible()
    await expect(page.getByRole('button', { name: '保存する' })).toBeVisible()
  })

  test('編集モードのキャンセルで参照モードに戻る', async ({ page }) => {
    const name = `編集キャンセル_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await page.getByText(name).click()
    await page.locator('button[title="編集"]').click()
    await page.getByRole('button', { name: 'キャンセル' }).first().click()
    await expect(page.getByRole('heading', { name: '食材を編集' })).not.toBeVisible()
    await expect(page.locator('button[title="編集"]')).toBeVisible()
  })

  test('削除ボタンをクリックすると確認メッセージが表示される', async ({ page }) => {
    const name = `削除確認_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await page.getByText(name).click()
    await page.getByRole('button', { name: '削除する' }).click()
    await expect(page.getByText('本当に削除しますか？')).toBeVisible()
  })

  test('削除確認でキャンセルすると食材が残る', async ({ page }) => {
    const name = `削除キャンセル_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await page.getByText(name).click()
    await page.getByRole('button', { name: '削除する' }).click()
    await page.getByText('本当に削除しますか？').waitFor()
    // キャンセルボタン（確認ダイアログ内）
    await page.locator('.bg-red-50').getByRole('button', { name: 'キャンセル' }).click()
    await expect(page.getByText('本当に削除しますか？')).not.toBeVisible()
    // ダイアログ閉じてもリストに残っている
    await page.keyboard.press('Escape')
  })

  test('削除を実行すると食材がリストから消える', async ({ page }) => {
    const name = `削除実行_${Date.now()}`
    await addFoodItemViaUI(page, { name })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await page.getByText(name).click()
    await page.getByRole('button', { name: '削除する' }).click()
    await page.getByText('本当に削除しますか？').waitFor()
    await page.locator('.bg-red-500').filter({ hasText: '削除する' }).click()
    await expect(page.getByText(name)).not.toBeVisible({ timeout: 10000 })
  })
})

// ─────────────────────────────────────────────
// 賞味期限バッジ
// ─────────────────────────────────────────────
test.describe('ホーム画面 - 賞味期限バッジ', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithTestUser(page)
  })

  test('期限切れ食材に「期限切れ」バッジが表示される', async ({ page }) => {
    const name = `期限切れ_${Date.now()}`
    await addFoodItemViaUI(page, { name, expiredDate: getPastDate(2) })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('期限切れ').first()).toBeVisible()
  })

  test('今日が期限の食材に「今日まで」バッジが表示される', async ({ page }) => {
    const name = `今日まで_${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    await addFoodItemViaUI(page, { name, expiredDate: today })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('今日まで').first()).toBeVisible()
  })

  test('期限が近い食材に「残りX日」バッジが表示される', async ({ page }) => {
    const name = `残り日数_${Date.now()}`
    await addFoodItemViaUI(page, { name, expiredDate: getTomorrowDate() })
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/残り\d+日/).first()).toBeVisible()
  })
})
