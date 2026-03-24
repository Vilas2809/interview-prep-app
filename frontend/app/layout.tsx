import "./globals.css";

export const metadata = {
  title: "Interview Prep AI",
  description: "AI-powered interview practice app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}