import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "./components/AppWrapper";

export const metadata: Metadata = {
  title: "FinanceIQ - Onboarding",
  description: "Asisten cerdas pendamping perjalanan finansialmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body-md min-h-screen w-full relative selection:bg-primary/30">
        
        {/* Decorative Ambient Background */}
        <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary/5 blur-[100px] pointer-events-none z-0"></div>
        
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
