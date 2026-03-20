import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
