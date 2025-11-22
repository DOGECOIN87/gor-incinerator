import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { Flame, Zap, Shield, Github, ExternalLink, Coins, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Gor Incinerator" className="h-10 w-10" />
            <span className="text-xl font-bold gradient-text">Gor Incinerator</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/DOGECOIN87/gor-incinerator.fun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <Button asChild variant="outline" className="hidden sm:flex">
              <a href="#get-started">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 opacity-50" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(/hero-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>Optional 5% Fee • Fully Configurable</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Reclaim Your{" "}
                <span className="gradient-text">GOR</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Close empty token accounts on the <strong className="text-foreground">Gorbagana</strong> blockchain 
                and recover rent with an optional 5% fee. Fast, secure, transparent, and completely open source.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <a href="#get-started">
                    <Flame className="mr-2 h-5 w-5" />
                    Start Burning
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.fun" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold gradient-text">5%</div>
                  <div className="text-sm text-muted-foreground">Optional Fee</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold gradient-text">14</div>
                  <div className="text-sm text-muted-foreground">Accounts/TX</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold gradient-text">&gt;90%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-orange-500 rounded-3xl blur-3xl opacity-30 animate-pulse" />
                <img 
                  src="/network-bg.jpg" 
                  alt="Gorbagana Network" 
                  className="relative rounded-3xl border border-border/50 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background" style={{
          clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)'
        }} />
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Why Choose <span className="gradient-text">Gor Incinerator</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most efficient way to manage your Gorbagana token accounts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Transparent Fees</CardTitle>
                <CardDescription>
                  Optional 5% fee that can be adjusted or completely disabled. Unlike other services charging 15%, you have full control. Keep 95-100% of your reclaimed GOR.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Batch Processing</CardTitle>
                <CardDescription>
                  Close up to 14 token accounts in a single transaction with over 90% success rate. Maximum efficiency guaranteed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Safe & Secure</CardTitle>
                <CardDescription>
                  Only closes accounts with zero balance. Your tokens are always protected from accidental loss.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Github className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Open Source</CardTitle>
                <CardDescription>
                  Fully transparent and auditable code. Review, fork, and contribute on GitHub.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized for Gorbagana's high-performance architecture. Complete transactions in seconds.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Maximize Returns</CardTitle>
                <CardDescription>
                  Recover rent from unused accounts and put your GOR back to work. Every bit counts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="get-started" className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Get Started in <span className="gradient-text">3 Easy Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start reclaiming your GOR in minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-2">Clone the Repository</CardTitle>
                    <CardDescription className="text-base mb-4">
                      Get the Gor Incinerator code from GitHub
                    </CardDescription>
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <code>git clone https://github.com/DOGECOIN87/gor-incinerator.fun</code>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-accent">2</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-2">Configure Your Environment</CardTitle>
                    <CardDescription className="text-base mb-4">
                      Create a <code className="bg-secondary/50 px-2 py-1 rounded">.env</code> file with your Gorbagana RPC URL and wallet
                    </CardDescription>
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm space-y-1">
                      <div><code>RPC_URL=https://your-gorbagana-rpc-url</code></div>
                      <div><code>WALLET=[your,wallet,bytes,array]</code></div>
                      <div><code># Optional - Enable 5% fee</code></div>
                      <div><code>FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL</code></div>
                      <div><code>FEE_PERCENTAGE=5</code></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong>Note:</strong> The wallet should be in uint8 bytes array format. Omit FEE_RECIPIENT to disable fees and keep 100%.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-orange-500">3</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-2">Run the Incinerator</CardTitle>
                    <CardDescription className="text-base mb-4">
                      Execute the burn script to close empty token accounts
                    </CardDescription>
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
                      <code>npm run burn</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      The program will respond with <code className="bg-secondary/50 px-2 py-1 rounded">14 token accounts successfully closed</code> if successful. 
                      Run it repeatedly to keep closing accounts and maximize your GOR recovery.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Pro Tip:</strong> Add token addresses you want to keep to the blacklist in{" "}
                  <code className="bg-secondary/50 px-2 py-1 rounded">burn.ts</code> to prevent them from being closed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Gorbagana Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold">
              About <span className="gradient-text">Gorbagana</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Gorbagana is a high-performance blockchain fork of Solana, engineered for exceptional speed, 
              efficiency, and scalability. Built on proven technology with enhanced optimizations, 
              Gorbagana delivers the throughput and reliability needed for modern decentralized applications.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Gor Incinerator leverages Gorbagana's advanced architecture to help you efficiently manage 
              your token accounts and reclaim valuable rent from unused accounts—putting your GOR back where it belongs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-orange-500/20" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Reclaim Your GOR?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the Gorbagana community and start optimizing your blockchain assets today
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <a href="https://github.com/DOGECOIN87/gor-incinerator.fun" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  Get Started on GitHub
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#get-started">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt="Gor Incinerator" className="h-8 w-8" />
                <span className="font-bold gradient-text">Gor Incinerator</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Zero-fee token account management for the Gorbagana blockchain
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.fun" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="#get-started" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.fun/issues" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    Report Issues
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/DOGECOIN87" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    GitHub Profile
                  </a>
                </li>
                <li>
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.fun/blob/master/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    Contributing Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2024 Gor Incinerator. Open source under MIT License.</p>
            <p className="mt-2">Built for the Gorbagana blockchain community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
