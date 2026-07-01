import { cookies } from 'next/headers'
import type { Locale } from './index'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return store.get('locale')?.value === 'pt' ? 'pt' : 'en'
}
