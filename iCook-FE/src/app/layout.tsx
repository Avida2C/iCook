import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SavedRecipesProvider } from "@/components/recipes/SavedRecipesProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const themeInitScript = `(function(){try{var t=localStorage.getItem("icook.theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);var a=localStorage.getItem("icook.accent");var p={coral:["#f76365","#fda676","#e85557","#f79863"],yellow:["#e5a800","#f0c94d","#c99200","#f2c94a"],green:["#2f9e6b","#7bc49a","#268557","#6dbf8c"],blue:["#3b7ddd","#7aa7eb","#2f68c0","#6b9ae6"],violet:["#8b5cf6","#b794f6","#7c49e8","#a78bfa"],teal:["#0d9488","#5ec4b8","#0b7c72","#4db8ab"]};var c=p[a]||p.coral;var r=document.documentElement;r.style.setProperty("--brand",c[0]);r.style.setProperty("--brand-soft",c[1]);r.style.setProperty("--brand-hover",c[2]);r.style.setProperty("--accent-soft",c[3]);r.dataset.accent=a&&p[a]?a:"coral";}catch(e){}})();`;

export const metadata: Metadata = {
  title: "iCook",
  description: "Your Kitchen, Your Creativity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col font-nunito">
        <ThemeProvider>
          <AuthProvider>
            <SavedRecipesProvider>{children}</SavedRecipesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
