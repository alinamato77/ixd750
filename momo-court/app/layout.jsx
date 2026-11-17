import './globals.css';

export const metadata = {
  title: 'Momo Court'
};

export const viewport = {
  themeColor: '#292b2c'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
