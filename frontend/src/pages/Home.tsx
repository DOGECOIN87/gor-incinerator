import { Button } from "../components/ui/button";
import { CheckCircle2, Github, Flame } from "lucide-react";
import { useState } from "react";
import BurnInterface from "../components/BurnInterface";
import TrashCanModel from "../components/TrashCanModel";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      // Try Gorbag wallet first (check both possible window names)
      const gorbagWallet = (window as any).gorbag || (window as any).gorbagWallet;
      if (gorbagWallet) {
        const response = await gorbagWallet.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
        return;
      }
      // Fall back to Backpack wallet
      if ((window as any).backpack) {
        const response = await (window as any).backpack.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
        return;
      }
      // No wallet found
      alert("No compatible wallet found. Please install Gorbag or Backpack wallet.");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      {/* Background / Aura-style glow */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-black" />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Very subtle vignette */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-[10%] rounded-[3rem] border border-white/5 bg-gradient-to-b from-white/5 via-transparent to-black/40 blur-3xl opacity-40" />
      </div>

      {/* 3D Background Model */}
      <div className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none">
        <TrashCanModel />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/gor-logo.jpg" 
                alt="Gor-Incinerator Logo" 
                className="h-10 w-10 rounded-full object-cover shadow-lg shadow-emerald-500/40 border border-emerald-500/30"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-[0.22em] uppercase text-muted-foreground">
                  Gorbagana
                </span>
                <span className="text-xl sm:text-2xl font-bold leading-none">
                  Gor-Incinerator
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#burn" className="hover:text-foreground transition-colors">
                Burn
              </a>
              <a href="#about" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
            </div>

            <div className="flex items-center gap-3">
              {walletConnected ? (
                <Button
                  variant="outline"
                  className="border-primary/60 bg-background/60 rounded-full text-xs sm:text-sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </span>
                  <span className="sm:hidden">
                    {walletAddress.slice(0, 3)}...{walletAddress.slice(-3)}
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={connectWallet}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5"
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 lg:pt-28">
        {/* HERO – Aura-style product layout */}
        <section id="hero" className="pt-8 pb-20 lg:pb-24">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
              {/* LEFT – Copy & CTAs (all Gor info preserved) */}
              <div className="space-y-8">
                {/* Top pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gorbagana network</span>
                  <span className="h-3 w-px bg-border/60" />
                  <span>Rent recovery utility</span>
                </div>

                {/* Title / tagline */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    Burn junk,
                    <br />
                    <span className="gradient-text">claim GOR</span>
                  </h1>
                  <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                    Close empty token accounts on the Gorbagana network and recover your rent.{" "}
                    Industry low 5% fees – 0% fees for Gorbagio NFT holders.
                  </p>
                </div>

                {/* Stats / details – same factual info, new layout */}
                <div className="grid gap-4 sm:grid-cols-3 max-w-xl">
                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Protocol fee
                    </p>
                    <p className="text-2xl font-semibold">5%</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      0% for Gorbagio NFT holders.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Empty accounts only
                    </p>
                    <p className="text-sm font-medium">
                      Automatically detects and targets{" "}
                      <span className="font-semibold">empty token accounts</span> for closure.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/80 p-4 flex flex-col justify-between">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Safety rules
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Built-in blacklist for important mints and a safe cap on accounts closed per
                      transaction.
                    </p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-emerald-500/25"
                  >
                    <a href="#burn">Start burning</a>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 rounded-full border-border/70 bg-background/60 hover:bg-card/70"
                  >
                    <a href="#about" className="inline-flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      <span>Learn more</span>
                    </a>
                  </Button>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Github className="h-4 w-4 opacity-70" />
                    <span>Open-source client UI (smart contract configurable)</span>
                  </div>
                </div>
              </div>

              {/* RIGHT – Placeholder for spacing, keeping layout structure but transparent */}
              <div className="relative hidden lg:block">
                 {/* We keep this div to maintain grid layout spacing if needed, or we can remove it. 
                     Since the text is on the left, an empty column here lets the 3D model (in fixed bg) shine through. */}
              </div>
            </div>
          </div>
        </section>

        {/* BURN SECTION – keeps existing BurnInterface, new framing */}
        <section id="burn" className="border-t border-border/60 bg-card/5 py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
              {/* Explainer */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    Step-by-step
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-semibold">
                    Connect, scan, burn – in one flow
                  </h2>
                </div>

                <ol className="space-y-4 text-sm text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">1. Connect Backpack.</span>{" "}
                    Gor-Incinerator connects directly to your Backpack wallet – no custodial layer.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">2. Scan your wallet.</span>{" "}
                    The app fetches your SPL token accounts and filters down to empty ones that
                    aren't on the internal blacklist of important mints.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">3. Review & burn.</span>{" "}
                    See how much rent can be reclaimed, the 5% service fee (or 0% for Gorbagio NFT
                    holders), and your final GOR amount before sending the transaction.
                  </li>
                </ol>

                <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Safety guarantees</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Only zero-balance token accounts are ever eligible for closure.</li>
                    <li>
                      A blacklist protects specific important token mints from being closed by
                      mistake.
                    </li>
                    <li>Burns are capped per transaction to keep fees and risk controlled.</li>
                  </ul>
                </div>
              </div>

              {/* Actual interactive burn interface */}
              <div className="max-w-xl lg:ml-auto">
                <BurnInterface
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  onConnectWallet={connectWallet}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION – uses same Gor info, just structured */}
        <section id="about" className="border-t border-border/60 bg-background py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-4xl space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                About
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold">What is Gor-Incinerator?</h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Gor-Incinerator is a focused utility for{" "}
              <span className="font-semibold text-foreground">
                closing empty token accounts on the Gorbagana network
              </span>{" "}
              so you can recover rent that would otherwise be locked away. It's built around a
              simple flow: connect Backpack, scan for empty accounts, then burn and reclaim your
              GOR.
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The protocol charges an industry-low{" "}
              <span className="font-semibold text-foreground">5% service fee</span> on recovered
              rent – and{" "}
              <span className="font-semibold text-foreground">
                Gorbagio NFT holders pay 0% fees
              </span>
              , receiving the full amount back.
            </p>
          </div>
        </section>

        {/* FEATURES – only facts already present in the app logic */}
        <section id="features" className="border-t border-border/60 bg-card/10 py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col gap-4 mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Features
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Designed around safety, clarity and rent recovery
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-5 flex flex-col gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Flame className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Backpack-native</h3>
                <p className="text-muted-foreground">
                  Connect directly with your Backpack wallet. No extra accounts, no custodial
                  step.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 p-5 flex flex-col gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Smart empty-account scan</h3>
                <p className="text-muted-foreground">
                  Automatically scans your SPL token accounts and isolates ones with a zero
                  balance.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 p-5 flex flex-col gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Built-in blacklist</h3>
                <p className="text-muted-foreground">
                  A curated blacklist ensures important token mints are never closed by the
                  incinerator.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 p-5 flex flex-col gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Flame className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Transparent economics</h3>
                <p className="text-muted-foreground">
                  See total rent, service fee and your GOR payout before you send a transaction.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Gor-Incinerator</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2025 Gor-Incinerator</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
