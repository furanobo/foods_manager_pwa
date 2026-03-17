import { Page } from '@playwright/test'

const API_KEY = 'AIzaSyDlTf4rXcc9UcAwKRyeu1-IlSKAXRkxXqY'

export const TEST_USER = {
  email: 'test@foods-manager.local',
  password: 'TestPass123!',
}

// Firebase REST APIでログインしてlocalStorageに注入（Googleポップアップをスキップ）
export async function loginWithTestUser(page: Page) {
  // Firebase Auth REST APIでサインイン
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        returnSecureToken: true,
      }),
    }
  )
  const data = await res.json()
  if (!data.idToken) throw new Error(`Auth failed: ${JSON.stringify(data)}`)

  // アプリを開いてlocalStorageにauth状態を注入
  await page.goto('/foods/')
  await page.evaluate(
    ({ idToken, refreshToken, uid, email }) => {
      const key = `firebase:authUser:AIzaSyDlTf4rXcc9UcAwKRyeu1-IlSKAXRkxXqY:[DEFAULT]`
      localStorage.setItem(key, JSON.stringify({
        uid,
        email,
        emailVerified: false,
        isAnonymous: false,
        providerData: [{ providerId: 'password', uid: email, email }],
        stsTokenManager: {
          refreshToken,
          accessToken: idToken,
          expirationTime: Date.now() + 3600 * 1000,
        },
        createdAt: Date.now().toString(),
        lastLoginAt: Date.now().toString(),
        apiKey: 'AIzaSyDlTf4rXcc9UcAwKRyeu1-IlSKAXRkxXqY',
        appName: '[DEFAULT]',
      }))
    },
    { idToken: data.idToken, refreshToken: data.refreshToken, uid: data.localId, email: data.email }
  )

  // リロードして認証状態を反映させ、ホームへの遷移を待つ
  await page.reload()
  await page.waitForURL('**/foods/home', { timeout: 10000 })
}
