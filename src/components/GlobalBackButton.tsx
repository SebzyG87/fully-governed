import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

const GlobalBackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleBack}
      className="fixed left-4 top-20 z-[55] h-10 border-border/80 bg-background/90 px-3 font-bebas tracking-wider text-foreground shadow-lg backdrop-blur-xl hover:bg-background"
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
      BACK
    </Button>
  );
};

export default GlobalBackButton;
