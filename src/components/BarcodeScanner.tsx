import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface BarcodeScannerProps {
  onScanned: (code: string) => void
  onCancel: () => void
}

export default function BarcodeScanner({ onScanned, onCancel }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    let stopped = false

    const start = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('環境')
        )
        const deviceId = backCamera?.deviceId ?? devices[0]?.deviceId

        if (!deviceId && devices.length === 0) {
          setError('カメラが見つかりませんでした')
          return
        }

        if (videoRef.current && !stopped) {
          await reader.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            (result, err) => {
              if (result && !stopped) {
                stopped = true
                onScanned(result.getText())
              }
              if (err && !(err.message?.includes('No MultiFormat Readers'))) {
                // Suppress continuous scan errors
              }
            }
          )
        }
      } catch (err) {
        if (!stopped) {
          const msg = err instanceof Error ? err.message : 'カメラエラー'
          if (msg.includes('Permission') || msg.includes('permission') || msg.includes('NotAllowed')) {
            setError('カメラへのアクセスが拒否されました。設定から許可してください。')
          } else {
            setError(`カメラを起動できませんでした: ${msg}`)
          }
        }
      }
    }

    start()

    return () => {
      stopped = true
      try {
        BrowserMultiFormatReader.releaseAllStreams()
      } catch {
        // ignore cleanup errors
      }
    }
  }, [onScanned])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Preview */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        {/* Scan Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-40">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-sm" />
            {/* Scan Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 opacity-80 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black bg-opacity-80 px-6 py-6 flex flex-col items-center gap-4">
        {error ? (
          <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
          </div>
        ) : (
          <p className="text-white text-sm text-center opacity-80">
            バーコードをフレーム内に合わせてください
          </p>
        )}
        <button
          onClick={onCancel}
          className="bg-white text-gray-800 font-medium rounded-xl px-8 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
