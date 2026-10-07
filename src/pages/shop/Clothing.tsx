import { motion } from "framer-motion";
import { Shirt } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Clothing = () => {
  const navigate = useNavigate();

  const handleBuy = (product: any) => {
    navigate(`/shop/checkout?productId=${product.id}&type=clothing&amount=${product.base_price}&name=${encodeURIComponent(product.name)}`);
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['clothing_products', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clothing_products')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Shop</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">CLOTHING</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
            Artist-designed clothing from the Fully Governed community. Print-on-demand, shipped worldwide.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-4">
                  <Skeleton className="w-full aspect-square rounded-md" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all group"
                >
                  <div
                    className="aspect-square w-full relative"
                    style={{ backgroundColor: product.base_colour || '#111' }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 transition-opacity duration-300 group-hover:opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="w-16 h-16 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="space-y-1 mb-4 flex-grow">
                      <p className="text-xs text-primary font-mono uppercase">{product.product_type}</p>
                      <h3 className="font-bebas text-2xl text-foreground tracking-wider leading-tight line-clamp-2" title={product.name}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground font-barlow">
                        By {product.profiles?.full_name || "Unknown Artist"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <span className="font-mono text-xl text-foreground">£{product.base_price}</span>
                      <Button variant="outline" size="sm" className="font-bebas tracking-wider" onClick={() => handleBuy(product)}>BUY</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center py-20 bg-card border border-border rounded-lg"
            >
              <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bebas text-2xl tracking-wider text-foreground mb-2">NO PUBLISHED CLOTHING YET</h3>
              <p className="text-muted-foreground font-barlow text-lg mb-6">Start with the designer and publish the first artist apparel drop.</p>
              <Link to="/artist-clothing/designer"><Button className="font-bebas text-lg tracking-wider px-8 h-12">START DESIGNING</Button></Link>
            </motion.div>
          )}

          {products && products.length > 0 && (
            <div className="text-center mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground font-barlow mb-4">Want to design your own line of apparel?</p>
              <Link to="/artist-clothing/designer"><Button variant="outline" className="font-bebas text-lg tracking-wider px-8 h-12">START DESIGNING</Button></Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Clothing;
