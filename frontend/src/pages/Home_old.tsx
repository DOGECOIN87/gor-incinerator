import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { Flame, Zap, Shield, Github, ExternalLink, Coins, TrendingUp, Clock, Wallet, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import BurnInterface from "../components/BurnInterface";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connectBackpackWallet = async () => {
    try {
      // @ts-ignore - Backpack wallet injected
      if (window.backpack) {
        // @ts-ignore
        const response = await window.backpack.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
      } else {
        alert("Backpack wallet not found. Please install Backpack wallet extension.");
        window.open("https://backpack.app", "_blank");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

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
              href="https://github.com/DOGECOIN87/gor-incinerator.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            {!walletConnected ? (
              <Button onClick={connectBackpackWallet} className="bg-primary hover:bg-primary/90">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Backpack
              </Button>
            ) : (
              <Button variant="outline" className="hidden sm:flex">
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </Button>
            )}
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
                <span>Only 5% Service Fee • You Keep 95%</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Reclaim Your{" "}
                <span className="gradient-text">GOR</span>
                {" "}Instantly
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                The easiest way to close empty token accounts on <strong className="text-foreground">Gorbagana</strong> and 
                recover your rent. Professional service with transparent 5% fee. Connect with <strong className="text-foreground">Backpack wallet</strong> and start burning.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary via-accent to-orange-500 hover:opacity-90">
                  <a href="#burn">
                    <Flame className="mr-2 h-5 w-5" />
                    Start Burning Now
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how-it-works">
                    Learn More
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold gradient-text">5%</div>
                  <div className="text-sm text-muted-foreground">Service Fee</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold gradient-text">95%</div>
                  <div className="text-sm text-muted-foreground">You Keep</div>
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
                <CardTitle>Industry-Low 5% Fee</CardTitle>
                <CardDescription>
                  Transparent 5% service fee - the lowest in the industry. Unlike competitors charging 15%+, you keep 95% of your reclaimed GOR. All fees shown upfront before you confirm.
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
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Backpack Wallet Ready</CardTitle>
                <CardDescription>
                  Seamlessly integrated with Backpack wallet - the only wallet supporting Gorbagana network. One-click connection and instant transactions.
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
      <section id="how-it-works" className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reclaim your GOR in 3 simple steps
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
                    <CardTitle className="mb-2">Connect Backpack Wallet</CardTitle>
                    <CardDescription className="text-base mb-4">
                      Install Backpack wallet extension and connect to Gorbagana network
                    </CardDescription>
                    <div className="space-y-3">
                      <Button 
                        onClick={connectBackpackWallet}
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={walletConnected}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        {walletConnected ? "Wallet Connected" : "Connect Backpack Wallet"}
                      </Button>
                      {!walletConnected && (
                        <p className="text-sm text-muted-foreground">
                          Don't have Backpack? <a href="https://backpack.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Download here</a>
                        </p>
                      )}
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
                    <CardTitle className="mb-2">Review Your Accounts</CardTitle>
                    <CardDescription className="text-base mb-4">
                      See all empty token accounts and estimated GOR to reclaim
                    </CardDescription>
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Empty accounts found:</span>
                        <span className="font-bold text-lg">14</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total rent to reclaim:</span>
                        <span className="font-bold text-lg text-green-500">~0.0285 GOR</span>
                      </div>
                      <div className="border-t border-border/50 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Service fee (5%):</span>
                          <span className="font-semibold">~0.00143 GOR</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-semibold">You receive:</span>
                          <span className="font-bold text-xl text-primary">~0.0271 GOR</span>
                        </div>
                      </div>
                    </div>
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
                    <CardTitle className="mb-2">Confirm & Burn</CardTitle>
                    <CardDescription className="text-base mb-4">
                      Approve the transaction in your Backpack wallet and reclaim your GOR
                    </CardDescription>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary via-accent to-orange-500 hover:opacity-90"
                      size="lg"
                      disabled={!walletConnected}
                    >
                      <Flame className="mr-2 h-5 w-5" />
                      {walletConnected ? "Start Burning Now" : "Connect Wallet First"}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      <CheckCircle2 className="inline h-4 w-4 text-green-500 mr-1" />
                      Transaction completes in seconds. Your GOR will be instantly available in your wallet.
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
                  <strong className="text-foreground">Safe & Secure:</strong> Only empty accounts are closed. Your tokens are always protected. 
                  The service automatically skips any account with a balance.
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
              Why <span className="gradient-text">Gor Incinerator</span>?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left mt-8">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Lowest Fees
                  </CardTitle>
                  <CardDescription className="text-base">
                    Only 5% service fee compared to 15%+ from competitors. Save more of your reclaimed GOR.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-accent" />
                    Backpack Integration
                  </CardTitle>
                  <CardDescription className="text-base">
                    Seamlessly works with Backpack wallet - the only wallet supporting Gorbagana network.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    Lightning Fast
                  </CardTitle>
                  <CardDescription className="text-base">
                    Close up to 14 accounts per transaction with &gt;90% success rate. Optimized for speed.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    100% Safe
                  </CardTitle>
                  <CardDescription className="text-base">
                    Only closes zero-balance accounts. Your tokens are always protected from accidental loss.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Burn Interface Section */}
      <section id="burn" className="py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Start <span className="gradient-text">Burning</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your Backpack wallet and reclaim your GOR in seconds
            </p>
          </div>
          <BurnInterface 
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            onConnectWallet={connectBackpackWallet}
          />
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
              Join thousands of Gorbagana users saving money with our professional token burning service
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary via-accent to-orange-500 hover:opacity-90">
                <a href="#burn">
                  <Flame className="mr-2 h-5 w-5" />
                  Start Burning Now
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Learn How It Works
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              <Shield className="inline h-4 w-4 mr-1" />
              Trusted by the Gorbagana community • 5% service fee • You keep 95%
            </p>
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
                Professional token burning service for Gorbagana network
              </p>
              <p className="text-xs text-muted-foreground">
                5% service fee • Backpack wallet compatible
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="#get-started" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.com/issues" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
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
                  <a href="https://github.com/DOGECOIN87/gor-incinerator.com/blob/master/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    Contributing Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2024 Gor Incinerator. Professional token burning service.</p>
            <p className="mt-2">Serving the Gorbagana blockchain community with transparent 5% fees</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
