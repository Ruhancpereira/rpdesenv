import { IBM_Plex_Mono, Outfit, Syne } from "next/font/google";
import Layout from "@/Layout";
import "@/styles/globals.css";
import "lenis/dist/lenis.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${syne.variable} ${outfit.variable} ${mono.variable} min-h-screen bg-[#072A5E] font-sans text-white antialiased`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
