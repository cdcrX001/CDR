import { WalletProvider } from '@/context/wallet-context'
import { NavBar } from '@/components/nav-bar'
import "@/app/globals.css"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <NavBar />
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}

