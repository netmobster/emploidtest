import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ROLES, UserType } from "@/lib/gameData";
import RoleCard from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import ProfileHeader from "@/components/ProfileHeader";
import { useRoleAvailability } from "@/hooks/useRoleAvailability";
import { toast } from "sonner";

const RoleSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = (searchParams.get("type") as UserType) || "candidate";
  const cityId = searchParams.get("city") || "new-york";
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreatingSample, setIsCreatingSample] = useState(false);

  const { availability, isLoading: isLoadingAvailability } = useRoleAvailability(cityId);

  const filteredRoles = useMemo(() => {
    return ROLES.filter((role) => role.cityId === cityId);
  }, [cityId]);

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/game/skills?type=${userType}&role=${selectedRole}&city=${cityId}`);
    }
  };

  const handleMatchWithSample = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }

    setIsCreatingSample(true);
    try {
      // For now, just navigate to the game - in a real app, this would create sample data
      toast.success("Sample candidate mode activated!");
      navigate(`/game/skills?type=${userType}&role=${selectedRole}&city=${cityId}&sample=true`);
    } catch (error) {
      console.error("Error creating sample match:", error);
      toast.error("Failed to create sample match");
    } finally {
      setIsCreatingSample(false);
    }
  };

  const cityName = cityId === "toronto" ? "Toronto" : "New York";

  const getRoleDisabledStatus = (roleId: string) => {
    if (isLoadingAvailability) return { isDisabled: false, reason: "" };

    const roleAvail = availability[roleId];
    if (!roleAvail) return { isDisabled: false, reason: "" };

    if (userType === "candidate") {
      if (!roleAvail.hasJobs) {
        return { isDisabled: true, reason: "No jobs available" };
      }
    } else {
      // Employers can still select - we'll show the sample button
      if (!roleAvail.hasCandidates) {
        return { isDisabled: false, reason: "" };
      }
    }

    return { isDisabled: false, reason: "" };
  };

  const showSampleButton = useMemo(() => {
    if (userType !== "employer" || !selectedRole) return false;
    const roleAvail = availability[selectedRole];
    return roleAvail && !roleAvail.hasCandidates;
  }, [userType, selectedRole, availability]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Profile Header */}
      <div className="absolute top-4 right-4 z-10">
        <ProfileHeader />
      </div>

      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/city?type=${userType}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {userType === "employer"
              ? "What role are you hiring for?"
              : "What role are you looking for?"}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Select a role to customize your matching preferences
          </p>
          <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            📍 {cityName}
          </span>
        </motion.div>

        {/* Loading state */}
        {isLoadingAvailability && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Role Grid */}
        {!isLoadingAvailability && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filteredRoles.map((role, index) => {
              const { isDisabled, reason } = getRoleDisabledStatus(role.id);
              return (
                <RoleCard
                  key={role.id}
                  role={role}
                  isSelected={selectedRole === role.id}
                  onClick={() => setSelectedRole(role.id)}
                  delay={index * 0.05}
                  isDisabled={isDisabled}
                  disabledReason={reason}
                />
              );
            })}
          </div>
        )}

        {/* Sample match notice for employers */}
        {showSampleButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center"
          >
            <p className="text-amber-600 dark:text-amber-400 mb-3">
              No candidates available for this role yet. You can test the UI with a sample candidate.
            </p>
            <Button
              variant="outline"
              onClick={handleMatchWithSample}
              disabled={isCreatingSample}
              className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              {isCreatingSample ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Match with Sample Candidate
            </Button>
          </motion.div>
        )}

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
