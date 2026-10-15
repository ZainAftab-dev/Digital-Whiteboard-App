import type React from "react"
import type { Metadata } from "next"
import "@fontsource-variable/manrope"
import "@fontsource-variable/bricolage-grotesque"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Digital Whiteboard",
  description: "Sketch, diagram and take notes in your browser: pen, shapes, arrows, text, sticky notes and PNG export.",
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#16181b" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
