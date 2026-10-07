import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Twitter, Instagram, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShareProfileDialogProps {
    url: string;
    title: string;
    triggerContext?: React.ReactNode;
}

const ShareProfileDialog = ({ url, title, triggerContext }: ShareProfileDialogProps) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast({ title: "Link Copied", description: "URL has been copied to clipboard." });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(`Check out ${title} on Fully Governed:`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${title}: ${fullUrl}`)}`,
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {triggerContext || (
                    <Button variant="outline" size="icon" className="shrink-0">
                        <LinkIcon className="w-5 h-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="font-bebas text-3xl tracking-wider">SHARE PROFILE</DialogTitle>
                    <DialogDescription className="font-barlow text-muted-foreground">
                        Share this artist profile with your network.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex gap-2 relative">
                        <div className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm font-mono text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                            {fullUrl}
                        </div>
                        <Button size="icon" variant="secondary" onClick={copyToClipboard} className="shrink-0">
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Button asChild variant="outline" className="h-12 border-border hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-colors">
                            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                                <Twitter className="w-5 h-5 mr-2" />
                                Twitter
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="h-12 border-border hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/50 transition-colors">
                            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                                <Facebook className="w-5 h-5 mr-2" />
                                Facebook
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="h-12 border-border hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/50 transition-colors">
                            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                                <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareProfileDialog;
