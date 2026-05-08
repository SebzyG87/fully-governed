import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const MENU_ITEMS = [
    { id: 1, name: "Studio Signature Burger", desc: "Double beef patty, brioche bun, house sauce, fries.", price: 12 },
    { id: 2, name: "Vegan Jackfruit Wrap", desc: "Spiced jackfruit, slaw, vegan mayo, sweet potato fries.", price: 12 },
    { id: 3, name: "Producer's Pasta", desc: "Penne arrabbiata with grilled chicken or plant-based strips.", price: 12 },
    { id: 4, name: "Crispy Wings Combo", desc: "6 hot wings, fries, and a side of mac & cheese.", price: 12 },
];

const FoodMenu = () => {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [roomNumber, setRoomNumber] = useState("");

    const handleOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomNumber) return;

        setSubmitting(true);
        // Simulate order placement
        setTimeout(() => {
            toast({ title: "Order placed! 🍔", description: "Your food will be delivered to your room shortly." });
            setSubmitting(false);
            setRoomNumber("");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <div className="grain-overlay" />
            <div className="container pt-24 pb-16 space-y-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">In-house Catering</p>
                    <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">FOOD DELIVERY</h1>
                    <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
                        Fuel your creativity. Fresh meals delivered directly to your studio room.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {MENU_ITEMS.map((item) => (
                            <div key={item.id} className="bg-card border border-border rounded-lg p-6 flex justify-between items-center hover:border-primary/30 transition-colors">
                                <div>
                                    <h3 className="font-bebas text-xl text-foreground tracking-wider">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground font-barlow max-w-sm mt-1">{item.desc}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-lg text-primary">£{item.price}</p>
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground font-mono text-center pt-4 opacity-70">
                            * Menu items are subject to daily availability and client confirmation.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
                        <h2 className="font-bebas text-2xl text-foreground tracking-wider mb-4 border-b border-border pb-4">PLACE ORDER</h2>
                        <form onSubmit={handleOrder} className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground font-barlow">Studio Room</Label>
                                <select required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:border-interactive focus:outline-none transition-colors">
                                    <option value="">Select your room...</option>
                                    <option value="Recording Studio">Recording Studio</option>
                                    <option value="Multi-Use Room">Multi-Use Room</option>
                                    <option value="Content Suite">Content Suite</option>
                                    <option value="Editing Suite">Editing Suite</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-muted-foreground font-barlow">Select Items</Label>
                                <Input className="mt-1 bg-background" placeholder="E.g., 2x Signature Burger" required />
                            </div>
                            <div>
                                <Label className="text-muted-foreground font-barlow">Dietary / Notes</Label>
                                <Input className="mt-1 bg-background" placeholder="Any allergies?" />
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full font-bebas text-lg tracking-wider mt-4">
                                {submitting ? "SENDING ORDER..." : "ORDER NOW"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FoodMenu;
