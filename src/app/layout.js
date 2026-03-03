import "./globals.css";

export const metadata = {
  title: "Live Capital — Staff Performance Review Portal",
  description: "Anonymous staff performance review portal (client-side).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
