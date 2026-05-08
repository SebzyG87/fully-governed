import Navbar from "@/components/Navbar";
import StudioRules from "@/components/StudioRules";
import AmenitiesSection from "@/components/AmenitiesSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";

const Info = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <div className="pt-16">
        <StudioRules />
        <AmenitiesSection />
        <LocationSection />
      </div>
      <Footer />
    </div>
  );
};

export default Info;
