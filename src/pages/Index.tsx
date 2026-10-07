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
    title: "Fully Governed Studios",
    description: "Premium creator, podcast, music and content studio in Lewisham, South East London.",
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
