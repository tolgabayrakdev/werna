import Image from "next/image";
import {
  QrCode,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Zap,
  Link2,
  ArrowRight,
  CheckCircle2,
  Smile,
} from "lucide-react";
import { Navbar } from "./components/navbar";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 size-[480px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 size-[180px] rounded-full bg-violet-500/15 blur-[60px] pointer-events-none" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-3 py-1 text-[11px] font-medium text-white/60 tracking-wide">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tamamen ücretsiz
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.12] tracking-tight">
                Müşterilerinizin<br />
                sesini duyun
              </h1>
              <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-md">
                QR kod ile anonim geri bildirim toplayın, yapay zeka ile sınıflandırın
                ve işletmenizi veri odaklı geliştirin.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-4xl bg-white px-8 text-sm font-semibold text-slate-950 transition-all hover:bg-white/90 active:translate-y-px"
              >
                Ücretsiz Başla
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#nasil-calisir"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-4xl border border-white/15 px-8 text-sm font-medium text-white/80 transition-colors hover:bg-white/5"
              >
                Nasıl Çalışır?
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-white/30">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" /> Kredi kartı gerekmez
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" /> Tamamen ücretsiz
              </span>
            </div>
          </div>

          {/* Right: Mockup */}
          <div className="relative">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-2xl">
              {/* Dashboard mockup header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-rose-400/80" />
                  <div className="size-3 rounded-full bg-amber-400/80" />
                  <div className="size-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="h-2 w-24 rounded-full bg-white/10" />
              </div>

              {/* Mockup content */}
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Geri Bildirim", value: "1,248" },
                    { label: "Memnuniyet", value: "%92" },
                    { label: "Bu Ay", value: "+340" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-white/8 bg-white/5 p-3 text-center"
                    >
                      <p className="text-lg font-bold text-white/90">{s.value}</p>
                      <p className="text-[11px] text-white/40">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chart bars */}
                <div className="rounded-xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-end justify-between gap-2 h-24">
                    {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-primary/60"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Feedback list */}
                <div className="space-y-2">
                  {[
                    { icon: Smile, text: "Hizmet çok hızlıydı, teşekkürler!", tag: "Tebrik" },
                    { icon: Sparkles, text: "Menüde daha fazla seçenek olabilir.", tag: "Öneri" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5"
                    >
                      <div className="size-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                        <item.icon className="size-4 text-white/60" />
                      </div>
                      <p className="text-sm text-white/70 truncate flex-1">{item.text}</p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/50 shrink-0">
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative blur behind mockup */}
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "QR ile Anında Geri Bildirim",
      desc: "Her masaya özel QR kod oluşturun. Müşterileriniz telefonlarını okutarak 30 saniyede anonim geri bildirim göndersin.",
    },
    {
      icon: Sparkles,
      title: "Akıllı Sınıflandırma",
      desc: "Şikayet, öneri, istek ve tebrikler otomatik olarak kategorize edilir. Öncelikli konuları anında görün.",
    },
    {
      icon: BarChart3,
      title: "Gerçek Zamanlı Raporlama",
      desc: "Anlık analitik ve aylık trend raporlarıyla işletmenizi veri odaklı kararlarla optimize edin.",
    },
    {
      icon: ShieldCheck,
      title: "Gizlilik ve Güvenlik",
      desc: "Müşteri kimlikleri tamamen anonim kalır. Verileriniz TLS ile şifrelenir ve güvenle saklanır.",
    },
    {
      icon: Zap,
      title: "Anlık Bildirimler",
      desc: "Olumsuz bir geri bildirim geldiğinde anında e-posta veya panel bildirimi alın.",
    },
    {
      icon: Link2,
      title: "Kolay Paylaşım",
      desc: "Tek tıkla sosyal medya, e-posta veya mesajla bağlantı paylaşın. Fiziksel QR kod basımı desteği.",
    },
  ];

  return (
    <section id="ozellikler" className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Her şey, tek platformda
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Geri bildirim toplamaktan analiz etmeye, işletmenizi büyütmek için ihtiyacınız olan tüm araçlar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="size-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Bağlantı Oluşturun",
      desc: "İşletme bilgilerinizi girin ve size özel geri bildirim sayfanızı saniyeler içinde oluşturun.",
    },
    {
      step: "02",
      title: "QR Kodu Paylaşın",
      desc: "Masanıza, menünüze veya resepsiyonunuza yerleştirin. Müşteriler kolayca ulaşsın.",
    },
    {
      step: "03",
      title: "Analiz Edin ve Büyüyün",
      desc: "Gelen geri bildirimleri kategorilere göre inceleyin, aksiyon alın ve memnuniyeti artırın.",
    },
  ];

  return (
    <section id="nasil-calisir" className="py-20 lg:py-28 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            3 adımda başlayın
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Karmaşık kurulumlar yok. Dakikalar içinde geri bildirim almaya başlayın.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-border" />

          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="mx-auto size-12 rounded-2xl bg-foreground text-background flex items-center justify-center text-sm font-bold mb-5 relative z-10">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "500+", label: "İşletme" },
    { value: "50K+", label: "Geri Bildirim" },
    { value: "%99.9", label: "Uptime" },
    { value: "<30sn", label: "Ortalama Yanıt" },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-20">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[400px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 right-0 size-[300px] rounded-full bg-indigo-600/15 blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white/90">
                {s.value}
              </p>
              <p className="text-sm text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="cta" className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          {/* Blobs */}
          <div className="absolute -top-24 -right-24 size-[320px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-[280px] rounded-full bg-indigo-600/15 blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Hemen ücretsiz başlayın
              </h2>
              <p className="text-white/50 leading-relaxed">
                Werna tamamen ücretsizdir. Tüm özellikleri limitsiz kullanın,
                kredi kartı gerekmez.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="#"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-4xl bg-white px-8 text-sm font-semibold text-slate-950 transition-all hover:bg-white/90 active:translate-y-px"
              >
                Hesap Oluştur
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#nasil-calisir"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-4xl border border-white/15 px-8 text-sm font-medium text-white/80 transition-colors hover:bg-white/5"
              >
                Nasıl Çalışır?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2.5">
              <Image src="/werna_logo.svg" alt="Werna" width={24} height={24} />
              <span className="text-base font-semibold tracking-tight">Werna</span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Müşteri geri bildirimlerini toplamak, analiz etmek ve işletmenizi büyütmek için modern platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Ürün</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a></li>
              <li><a href="#nasil-calisir" className="hover:text-foreground transition-colors">Nasıl Çalışır</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Entegrasyonlar</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Yol Haritası</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Şirket</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Kariyer</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">İletişim</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Yasal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Gizlilik Politikası</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Kullanım Koşulları</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">KVKK</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Werna. Tüm hakları saklıdır.</p>
          <p>werna.app</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
