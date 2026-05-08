import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflinePage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="grain-overlay" />
            <WifiOff className="w-24 h-24 text-muted-foreground mb-6 opacity-50" />
            <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider mb-4">YOU ARE OFFLINE</h1>
            <p className="text-muted-foreground font-barlow max-w-md mb-8 text-lg">
                It looks like you've lost connection. The Fully Governed app requires an active internet connection to browse the studio and stream music.
            </p>
            <Button
                onClick={() => window.location.reload()}
                className="font-bebas text-xl tracking-wider px-10 py-6 bg-primary text-primary-foreground hover:shadow-[0_0_15px_hsl(var(--interactive))]"
            >
                RETRY CONNECTION
            </Button>
        </div>
    );
};

export default OfflinePage;
