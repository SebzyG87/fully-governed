import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RoomsSection from "@/components/RoomsSection";
import StudioRules from "@/components/StudioRules";
import CommunitySection from "@/components/CommunitySection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import BookingFAB from "@/components/BookingFAB";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Home",
    description: "Fully Governed Studio in Lewisham. A 24/7 creative sanctuary for artists, producers, and creators.",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <HeroSection />
      <RoomsSection />
      <StudioRules />
      <CommunitySection />
      <LocationSection />
      <Footer />
      <BookingFAB />
    </div>
  );
};

export default Index;
