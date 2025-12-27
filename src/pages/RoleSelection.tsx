import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ROLES, UserType } from "@/lib/gameData";
import RoleCard from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const RoleSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = (searchParams.get("type") as UserType) || "candidate";
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/game/skills?type=${userType}&role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {userType === "employer" ? "What role are you hiring for?" : "What role are you looking for?"}
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a role to customize your matching preferences
          </p>
        </motion.div>

        {/* Role Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {ROLES.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
              delay={index * 0.05}
            />
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            variant="hero"
            size="xl"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            Continue to Skills Game <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
