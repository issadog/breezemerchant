import "./styles/valtech.css";
import "./styles/breezemerchant.css";
import type { ReactNode } from "react";
export const metadata = { title: "Product Builder", description: "AI-native moves for Valtech PMs." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
