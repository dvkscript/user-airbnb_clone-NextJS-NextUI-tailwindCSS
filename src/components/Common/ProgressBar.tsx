'use client'

import { AppProgressBar } from 'next-nprogress-bar'

export default function ProgressBar() {
  return <AppProgressBar color="#ff0000" options={{ showSpinner: false }} />
}
