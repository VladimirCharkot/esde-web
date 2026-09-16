import type { Metadata } from 'next'
import { VidrieraContextProvider } from '@/components/vidriera/contexto'
import './globals.sass'

export const metadata: Metadata = {
  title: 'El Silencio Donde Escucho',
  icons: { icon: '/icon/leaf.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <VidrieraContextProvider>{children}</VidrieraContextProvider>
      </body>
    </html>
  )
}
