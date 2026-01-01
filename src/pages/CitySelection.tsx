import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface City {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
}

const CITIES: City[] = [
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&auto=format&fit=crop&q=60",
    description: "Canada's largest city and financial hub",
  },
  {
    id: "new-york",
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=60",
    description: "The city that never sleeps",
  },
];

const CitySelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "candidate";
  const { user, profile, isLoading } = useAuth();

  // Require auth for employers
  useEffect(() => {
    if (!isLoading && userType === "employer") {
      if (!user) {
        navigate("/auth?type=employer");
        return;
      }
      // If employer hasn't completed culture game, redirect to culture confirmation
      // (which will then redirect to onboarding if needed)
      if (profile && !profile.has_completed_culture_game) {
        navigate("/culture-confirmation");
      }
    }
  }, [user, profile, isLoading, userType, navigate]);

  const handleBack = () => {
    if (userType === "employer") {
      navigate("/culture-confirmation");
    } else {
      navigate("/");
    }
  };

  const handleCitySelect = (cityId: string) => {
    navigate(`/roles?type=${userType}&city=${cityId}`);
  };

  // Show loading while checking auth for employers
  if (isLoading && userType === "employer") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Select Your City</h1>
            <p className="text-sm text-muted-foreground">
              Choose where you're looking for opportunities
            </p>
          </div>
        </div>
      </div>

      {/* City Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {CITIES.map((city, index) => (
            <motion.button
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCitySelect(city.id)}
              className="group relative overflow-hidden rounded-3xl text-left shadow-card hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative p-8 min-h-[280px] flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">{city.country}</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{city.name}</h3>
                <p className="text-white/80">{city.description}</p>

                {/* Hover indicator */}
                <div className="mt-4 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">Select city</span>
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    className="w-5 h-5"
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            More cities coming soon...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CitySelection;
