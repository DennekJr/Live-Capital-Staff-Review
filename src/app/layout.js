import "./globals.css";

export const metadata = {
  title: "Live Capital — Staff Performance Review Portal",
  description: "Anonymous staff performance review portal (client-side).",
  icons: {
    icon: "/images/favIcon.svg",
    shortcut: "/images/favIcon.svg",
    apple: "/images/favIcon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
