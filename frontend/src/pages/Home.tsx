import { Button } from "@/components/ui/button";
import { CheckCircle2, Github, Flame } from "lucide-react";
import { useState } from "react";
import BurnInterface from "../components/BurnInterface";
import TrashCanModel from "../components/TrashCanModel";

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">Gor-Incinerator</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#burn" className="hover:text-foreground transition-colors">Burn</a>
              <a href="#about" className="hover:text-foreground transition-colors">About</a>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            </div>
            
            <div>
              {!walletConnected ? (
                <Button 
                  onClick={connectBackpackWallet}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Connect
                </Button>
              ) : (
                <Button variant="outline" className="border-primary/50">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Burn Junk,
                <br />
                <span className="gradient-text">Claim Gor</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Close empty token accounts on the Gorbagana network and recover your rent. 
                Industry low 5% fees - 0% fees for Gorbagio NFT Holders.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
                >
                  <a href="#burn">
                    Start Burning
                  </a>
                </Button>
                
                <Button 
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-primary/30 hover:bg-primary/10"
                >
                  <a href="#about">
                    Learn More
                  </a>
                </Button>
              </div>
            </div>

            {/* Right side - Trash can illustration */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Glow effect behind trash can */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                
                {/* 3D Trash can model */}
                <div className="relative h-full">
                  <TrashCanModel />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Burn Interface Section */}
      <section id="burn" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <BurnInterface 
              walletConnected={walletConnected}
              walletAddress={walletAddress}
              onConnectWallet={connectBackpackWallet}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/20">
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
