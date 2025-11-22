import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Zap, Shield, Github, Coins, Wallet, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import BurnInterface from "../components/BurnInterface";

const APP_LOGO = "/logo.png";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connectBackpackWallet = async () => {
    try {
      // @ts-ignore
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Gor Incinerator</span>
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
              
              {!walletConnected ? (
                <Button 
                  onClick={connectBackpackWallet}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
                <Button variant="outline" className="border-violet-600/50">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/10 border border-violet-600/20">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium">Industry-Low 5% Fee • You Keep 95%</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Reclaim Your GOR
              <br />
              <span className="gradient-text">Effortlessly</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Professional token burning service for Gorbagana. Close empty accounts, 
              recover rent, and maximize your returns with transparent 5% fees.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-lg h-14 px-8"
              >
                <a href="#burn">
                  <Flame className="mr-2 h-5 w-5" />
                  Start Burning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 border-violet-600/50 hover:bg-violet-600/10"
              >
                <a href="#how-it-works">
                  Learn More
                </a>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">5%</div>
                <div className="text-sm text-muted-foreground">Service Fee</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">95%</div>
                <div className="text-sm text-muted-foreground">You Keep</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">&gt;90%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why Choose <span className="gradient-text">Gor Incinerator</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most efficient and affordable way to manage your Gorbagana token accounts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Coins,
                title: "Lowest Fees",
                description: "Only 5% service fee compared to 15%+ from competitors. Save more of your reclaimed GOR.",
                color: "violet"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Close up to 14 accounts per transaction with &gt;90% success rate. Optimized for speed.",
                color: "cyan"
              },
              {
                icon: Shield,
                title: "100% Safe",
                description: "Only closes zero-balance accounts. Your tokens are always protected from accidental loss.",
                color: "blue"
              },
              {
                icon: Wallet,
                title: "Backpack Ready",
                description: "Seamlessly integrated with Backpack wallet - the only wallet supporting Gorbagana network.",
                color: "violet"
              },
              {
                icon: CheckCircle2,
                title: "Proven Reliability",
                description: "Professional service with comprehensive error handling and >90% transaction success rate.",
                color: "cyan"
              },
              {
                icon: Sparkles,
                title: "Transparent Pricing",
                description: "All fees shown upfront before transaction. No hidden costs, no surprises.",
                color: "blue"
              }
            ].map((feature, i) => (
              <Card key={i} className="relative group hover:border-violet-600/50 transition-all duration-300 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-${feature.color}-600/20 to-${feature.color}-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Burn Interface Section */}
      <section id="burn" className="py-20 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Start <span className="gradient-text">Burning</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your Backpack wallet and reclaim your GOR in seconds
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <BurnInterface 
              walletConnected={walletConnected}
              walletAddress={walletAddress}
              onConnectWallet={connectBackpackWallet}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to reclaim your GOR
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                step: "1",
                title: "Connect Backpack Wallet",
                description: "Install Backpack wallet extension and connect to Gorbagana network",
                action: walletConnected ? "Connected" : "Connect Now"
              },
              {
                step: "2",
                title: "Review Your Accounts",
                description: "See all empty token accounts and estimated GOR to reclaim with transparent fee breakdown",
                action: "View Details"
              },
              {
                step: "3",
                title: "Confirm & Burn",
                description: "Approve the transaction in your Backpack wallet and reclaim your GOR instantly",
                action: "Start Burning"
              }
            ].map((item, i) => (
              <Card key={i} className="relative overflow-hidden group hover:border-violet-600/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {item.description}
                      </CardDescription>
                      {i === 0 && !walletConnected && (
                        <Button 
                          onClick={connectBackpackWallet}
                          className="mt-4 bg-gradient-to-r from-violet-600 to-cyan-600"
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          {item.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-cyan-600/10 to-violet-600/10" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Reclaim Your GOR?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the Gorbagana community and start optimizing your blockchain assets today
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-lg h-14 px-8"
            >
              <a href="#burn">
                <Flame className="mr-2 h-5 w-5" />
                Start Burning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Gor Incinerator</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional token burning service for Gorbagana network
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/DOGECOIN87/gor-incinerator.fun" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/DOGECOIN87" className="hover:text-foreground transition-colors">GitHub Profile</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>© 2024 Gor Incinerator. Professional token burning service.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
