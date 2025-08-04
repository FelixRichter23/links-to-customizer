// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flextree - Your Link in Bio",
  description: "Connect your audience to all your content with one link.",
};

// Das RootLayout muss async sein, um den User zu holen
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hole den Supabase Client für Server Components
  // Frage den aktuellen Benutzer ab
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <div className="flex flex-col min-h-screen">
          {/* Übergebe den User (oder null) an den Header */}
          <main className="flex-grow py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
