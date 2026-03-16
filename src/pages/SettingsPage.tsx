import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthStore } from '../store/authStore'
import { useSettingStore } from '../store/settingStore'
import { saveSettings, loadSettings } from '../services/firestoreService'
import { requestPermission, scheduleExpirationNotifications } from '../services/notificationService'
import { useFoodItemStore } from '../store/foodItemStore'
import BottomNav from '../components/BottomNav'

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { settings, setSettings } = useSettingStore()
  const items = useFoodItemStore((s) => s.items)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    loadSettings(user.uid).then((s) => {
      if (s) setSettings(s)
    })
  }, [user, setSettings])

  const handleNoticeFlagChange = async (value: boolean) => {
    const updated = { ...settings, noticeFlag: value }
    setSettings(updated)
    if (value) {
      const granted = await requestPermission()
      if (!granted) {
        setSettings({ ...updated, noticeFlag: false })
        return
      }
      scheduleExpirationNotifications(items, updated.noticeTime)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveSettings(user.uid, settings)
      if (settings.noticeFlag) {
        scheduleExpirationNotifications(items, settings.noticeTime)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold">設定</h1>
      </header>

      <main className="px-4 py-6 space-y-6 pb-24">
        {/* Notification Settings */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">通知設定</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">期限通知</p>
                <p className="text-xs text-gray-400 mt-0.5">賞味期限が近い食材をお知らせ</p>
              </div>
              <button
                onClick={() => handleNoticeFlagChange(!settings.noticeFlag)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.noticeFlag ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.noticeFlag ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.noticeFlag && (
              <div className="px-4 py-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">通知時刻</label>
                <input
                  type="time"
                  value={settings.noticeTime}
                  onChange={(e) => setSettings({ ...settings, noticeTime: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            )}
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-500 text-white font-medium rounded-xl py-3 text-sm hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : saved ? '保存しました ✓' : '設定を保存'}
        </button>

        {/* Account */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">アカウント</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {user && (
              <div className="px-4 py-4 flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">
                      {user.displayName?.[0] ?? '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.displayName ?? 'ユーザー'}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-4 text-left text-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </section>

        {/* Other */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">その他</h2>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-500">バージョン: 1.0.0</p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
