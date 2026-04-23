export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <h1 className="mb-4 text-4xl font-bold">Werna</h1>
      <p className="mb-8 text-muted-foreground">Modern web uygulaması platformu</p>
      <div className="flex gap-4">
        <a
          href="/sign-in"
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Giriş Yap
        </a>
        <a
          href="/sign-up"
          className="rounded-md border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Kayıt Ol
        </a>
      </div>
    </div>
  );
}