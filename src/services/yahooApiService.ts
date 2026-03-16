// NOTE: Yahoo Shopping API does not support CORS for browser requests.
// A backend proxy is required for production use.
// This implementation attempts a direct call and throws a descriptive error on CORS failure,
// allowing the caller to fall back to manual entry mode.

const YAHOO_APPID = import.meta.env.VITE_YAHOO_APPID ?? 'dj00aiZpPTE4Nk5iZkRuOUNCZyZzPWNvbnN1bWVyc2VjcmV0Jng9YjQ-'
const YAHOO_ENDPOINT = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch'

export interface YahooProductInfo {
  name: string
  category: string
  imageUrl: string
  url: string
}

interface YahooItem {
  name?: string
  parentGenreCategories?: Array<{ name?: string }>
  exImage?: { url?: string }
  url?: string
}

interface YahooResponse {
  hits?: YahooItem[]
}

export async function searchByJanCode(janCode: string): Promise<YahooProductInfo> {
  const params = new URLSearchParams({
    appid: YAHOO_APPID,
    jan_code: janCode,
    image_size: '600',
    results: '1',
  })

  const response = await fetch(`${YAHOO_ENDPOINT}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Yahoo API error: ${response.status}`)
  }

  const data: YahooResponse = await response.json()

  if (!data.hits || data.hits.length === 0) {
    throw new Error('商品が見つかりませんでした')
  }

  const hit = data.hits[0]
  const categories = hit.parentGenreCategories ?? []
  const category = categories[1]?.name ?? categories[0]?.name ?? 'その他'

  return {
    name: hit.name ?? '',
    category,
    imageUrl: hit.exImage?.url ?? '',
    url: hit.url ?? '',
  }
}
