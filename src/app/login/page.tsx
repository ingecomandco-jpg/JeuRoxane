type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const next = params.next?.startsWith("/") ? params.next : "/";

  return (
    <main
      className="min-h-dvh overflow-hidden px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))] text-[#0f4f55]"
      style={{
        background:
          "linear-gradient(180deg, #66d9ff 0%, #dffef7 34%, #fff4a6 68%, #2f9e58 100%)",
      }}
    >
      <div className="relative mx-auto flex min-h-[calc(100dvh-36px)] w-full max-w-[430px] items-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute left-5 top-8 h-16 w-16 rounded-full bg-[#ffd84d] shadow-[0_0_32px_rgba(250,204,21,0.55)]" />
          <div className="absolute -right-12 top-28 h-36 w-36 rotate-12 rounded-lg bg-[#0f766e]/18" />
          <div className="absolute -left-10 bottom-24 h-32 w-32 rotate-[-18deg] rounded-lg bg-[#ff8a3d]/22" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#2f9e58]/70" />
          <div className="absolute bottom-20 left-8 h-20 w-3 rounded-full bg-[#8a4d1f]" />
          <div className="absolute bottom-[148px] left-2 h-4 w-14 rotate-[-28deg] rounded-full bg-[#15803d]" />
          <div className="absolute bottom-[154px] left-8 h-4 w-14 rotate-[8deg] rounded-full bg-[#16a34a]" />
          <div className="absolute bottom-[148px] left-14 h-4 w-14 rotate-[30deg] rounded-full bg-[#15803d]" />
        </div>

        <section className="screen-pop relative w-full overflow-hidden rounded-lg border border-white/70 bg-white/88 shadow-[0_22px_58px_rgba(6,78,91,0.24)] backdrop-blur">
          <div className="border-b border-[#0f766e]/10 bg-white/64 p-5 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#00a6a6,#facc15,#ff8a3d)] text-4xl shadow-[0_14px_30px_rgba(6,78,91,0.18)]">
              💛
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8a3d]">
              Acces prive
            </p>
            <h1 className="mt-2 text-4xl font-black leading-none text-[#0f4f55]">
              Acces au lagon
            </h1>
            <p className="mt-2 text-sm font-bold text-[#14746f]">
              Entre dans le lagon secret.
            </p>
          </div>

          <form action="/api/login" method="post" className="space-y-4 p-5">
            <input type="hidden" name="next" value={next} />

            <label className="block space-y-2">
              <span className="text-sm font-black text-[#0f4f55]">Identifiant</span>
              <input
                name="username"
                autoComplete="username"
                className="h-14 w-full rounded-lg border border-[#0f766e]/20 bg-[#e9fff5] px-4 text-base font-bold text-[#0f4f55] outline-none transition focus:border-[#00a6a6] focus:bg-white focus:ring-4 focus:ring-[#00a6a6]/15"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-black text-[#0f4f55]">Mot de passe</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="h-14 w-full rounded-lg border border-[#0f766e]/20 bg-[#e9fff5] px-4 text-base font-bold text-[#0f4f55] outline-none transition focus:border-[#00a6a6] focus:bg-white focus:ring-4 focus:ring-[#00a6a6]/15"
                required
              />
            </label>

            {hasError ? (
              <div className="rounded-lg border border-[#ff8a3d]/35 bg-[#fff4b8] px-4 py-3 text-sm font-black text-[#7c3f00]">
                Identifiant ou mot de passe incorrect.
              </div>
            ) : null}

            <button className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-[#ff8a3d] px-5 text-base font-black text-[#17313a] shadow-[0_10px_22px_rgba(249,115,22,0.28)] transition hover:bg-[#ff9a52] active:translate-y-px">
              Entrer
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
