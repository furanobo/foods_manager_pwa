import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-area-bottom z-40">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs transition-colors ${
            isActive ? 'text-green-600' : 'text-gray-400'
          }`
        }
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8.19-9.52-8.19-15.03 0h15.03zM1.02 17h15v2h-15z" />
        </svg>
        <span>食材</span>
      </NavLink>

      <NavLink
        to="/recipe"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs transition-colors ${
            isActive ? 'text-green-600' : 'text-gray-400'
          }`
        }
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M18.5 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM6 19V5h5v14H6zm12 0h-5V5h5v14zM9 9H7V7h2v2zm0 4H7v-2h2v2zm0 4H7v-2h2v2zm8-8h-2V7h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2z" />
        </svg>
        <span>レシピ</span>
      </NavLink>

      <NavLink
        to="/shopping"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs transition-colors ${
            isActive ? 'text-green-600' : 'text-gray-400'
          }`
        }
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
        </svg>
        <span>買い物</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs transition-colors ${
            isActive ? 'text-green-600' : 'text-gray-400'
          }`
        }
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
        <span>設定</span>
      </NavLink>
    </nav>
  )
}
