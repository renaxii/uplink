export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
              Mission Control
            </p>
            <h1 className="text-4xl font-bold">Uplink</h1>
          </div>

          <div className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm text-cyan-200">
            Satellite Network: Online
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-slate-900/80">
              <p className="text-cyan-200">3D Earth will go here</p>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-red-300">
              Alert
            </p>
            <h2 className="mb-4 text-2xl font-semibold">
              Telemetry Anomaly Detected
            </h2>
            <p className="mb-6 text-sm leading-6 text-slate-300">
              Satellite Aurora-7 is reporting a sudden position shift. Your job
              is to decide whether the data is real or suspicious.
            </p>

            <div className="space-y-3">
              <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">
                Verify with backup sensors
              </button>
              <button className="w-full rounded-xl border border-white/15 px-4 py-3 text-slate-200">
                Fire thrusters immediately
              </button>
              <button className="w-full rounded-xl border border-white/15 px-4 py-3 text-slate-200">
                Ignore the alert
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}