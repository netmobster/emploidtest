import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Bug, Target, Brain, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MatchScoreBreakdown, 
  getScoreColor, 
  getMatchLabel 
} from "@/lib/matchScoreUtils";

interface MatchScoreDebugPanelProps {
  matchBreakdown?: MatchScoreBreakdown;
  candidateSkills?: string[];
  jobRequirements?: string[];
  isVisible?: boolean;
}

export function MatchScoreDebugPanel({
  matchBreakdown,
  candidateSkills = [],
  jobRequirements = [],
  isVisible = true,
}: MatchScoreDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const { skillScore = 50, cultureScore = 50, synergyScore = 50, totalScore = 50 } = matchBreakdown || {};

  // Calculate matching skills
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());
  const normalizedRequirements = jobRequirements.map(r => r.toLowerCase().trim());
  const matchingSkills = candidateSkills.filter(skill =>
    normalizedRequirements.some(req => 
      req.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(req)
    )
  );
  const missingSkills = jobRequirements.filter(req =>
    !normalizedCandidateSkills.some(skill => 
      skill.includes(req.toLowerCase().trim()) || req.toLowerCase().trim().includes(skill)
    )
  );

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-xl overflow-hidden"
        style={{ width: isExpanded ? 320 : 200 }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Match Debug</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getScoreColor(totalScore)}>
              {totalScore}%
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border"
            >
              <div className="p-3 space-y-4">
                {/* Overall Score */}
                <div className="text-center pb-2 border-b border-border">
                  <p className="text-2xl font-bold">{totalScore}%</p>
                  <p className={`text-sm ${getScoreColor(totalScore)}`}>
                    {getMatchLabel(totalScore)}
                  </p>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3">
                  {/* Skill Score */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-blue-500" />
                        Skills (40%)
                      </span>
                      <span className={getScoreColor(skillScore)}>{skillScore}%</span>
                    </div>
                    <Progress 
                      value={skillScore} 
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      {matchingSkills.length}/{jobRequirements.length} requirements matched
                    </p>
                  </div>

                  {/* Culture Score */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-purple-500" />
                        Culture (30%)
                      </span>
                      <span className={getScoreColor(cultureScore)}>{cultureScore}%</span>
                    </div>
                    <Progress 
                      value={cultureScore} 
                      className="h-1.5"
                    />
                  </div>

                  {/* Synergy Score */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-emerald-500" />
                        Synergy (30%)
                      </span>
                      <span className={getScoreColor(synergyScore)}>{synergyScore}%</span>
                    </div>
                    <Progress 
                      value={synergyScore} 
                      className="h-1.5"
                    />
                  </div>
                </div>

                {/* Skills Detail */}
                {(matchingSkills.length > 0 || missingSkills.length > 0) && (
                  <div className="pt-2 border-t border-border space-y-2">
                    {matchingSkills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">✓ Matched:</p>
                        <div className="flex flex-wrap gap-1">
                          {matchingSkills.slice(0, 5).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                              {skill}
                            </Badge>
                          ))}
                          {matchingSkills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{matchingSkills.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">✗ Missing:</p>
                        <div className="flex flex-wrap gap-1">
                          {missingSkills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                              {skill}
                            </Badge>
                          ))}
                          {missingSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{missingSkills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
