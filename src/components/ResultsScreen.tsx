import { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/data/questions';
import { badges } from '@/data/badges';
import { benchmarks, Benchmark } from '@/data/benchmarks';
import { RefreshCw, Twitter, Linkedin, Link2, Check, Copy, Users, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

// Team member interface
interface TeamMember {
  id: string;
  name: string;
  scores: Record<Category, number>;
  color: string;
}

// Color palette for team members (up to 8)
const teamColors = [
  'hsl(173, 80%, 40%)',  // Teal
  'hsl(280, 70%, 50%)',  // Purple
  'hsl(30, 90%, 50%)',   // Orange
  'hsl(340, 80%, 55%)',  // Pink
  'hsl(200, 80%, 45%)',  // Sky Blue
  'hsl(60, 80%, 45%)',   // Yellow-Green
  'hsl(150, 70%, 40%)',  // Emerald
  'hsl(0, 80%, 55%)',    // Red
];

interface ResultsScreenProps {
  scores: Record<Category, number>;
  onRestart: () => void;
  teamMembersFromUrl?: TeamMember[] | null;
}

const categoryLabels: Record<Category, string> = {
  autonomy: 'Autonomy',
  impact: 'Impact',
  collaboration: 'Collaboration',
  security: 'Security',
  recognition: 'Recognition',
};

const categoryOrder: Category[] = ['autonomy', 'impact', 'collaboration', 'security', 'recognition'];

const ResultsScreen = ({ scores, onRestart, teamMembersFromUrl }: ResultsScreenProps) => {
  const [copied, setCopied] = useState(false);
  const [scoresCopied, setScoresCopied] = useState(false);
  const [teamLinkCopied, setTeamLinkCopied] = useState(false);
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(teamMembersFromUrl || []);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberScores, setNewMemberScores] = useState('');

  // Normalize user scores to 0-10 scale for comparison (user scores are 0-5)
  const normalizedUserScores = useMemo(() => {
    return Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, value * 2])
    ) as Record<Category, number>;
  }, [scores]);

  const chartData = useMemo(() => {
    const data = categoryOrder.map((key) => {
      const point: Record<string, string | number> = {
        category: categoryLabels[key],
        you: normalizedUserScores[key],
        fullMark: 10,
      };
      
      // Add benchmark if selected and no team members
      if (selectedBenchmark && teamMembers.length === 0) {
        point.benchmark = selectedBenchmark.scores[key];
      }
      
      // Add each team member's score
      teamMembers.forEach((member) => {
        point[member.id] = member.scores[key];
      });
      
      return point;
    });
    return data;
  }, [normalizedUserScores, selectedBenchmark, teamMembers]);

  const primaryBadge = useMemo(() => {
    const maxScore = Math.max(...Object.values(scores));
    const topCategory = Object.entries(scores).find(([_, value]) => value === maxScore)?.[0] as Category;
    return badges[topCategory];
  }, [scores]);

  // Chemistry insights based on score deltas (works for benchmark or first team member)
  const chemistryInsights = useMemo(() => {
    const compareTarget = teamMembers[0]?.scores || (selectedBenchmark?.scores);
    if (!compareTarget) return [];
    
    const insights: { type: 'warning' | 'match'; message: string }[] = [];
    const targetName = teamMembers[0]?.name || selectedBenchmark?.name;
    
    // Check Autonomy gap
    const autonomyGap = Math.abs(normalizedUserScores.autonomy - compareTarget.autonomy);
    if (autonomyGap > 4) {
      if (normalizedUserScores.autonomy > compareTarget.autonomy) {
        insights.push({
          type: 'warning',
          message: `Friction Alert: Oversight. You value freedom significantly more than ${targetName}.`,
        });
      } else {
        insights.push({
          type: 'warning',
          message: `Friction Alert: Oversight. ${targetName} values freedom significantly more than you.`,
        });
      }
    }

    // Check Impact alignment
    const impactGap = Math.abs(normalizedUserScores.impact - compareTarget.impact);
    if (impactGap < 2) {
      insights.push({
        type: 'match',
        message: 'Chemistry Match: You both share a deep commitment to the "Why" behind the work.',
      });
    }

    // Check Security gap
    const securityGap = Math.abs(normalizedUserScores.security - compareTarget.security);
    if (securityGap > 4) {
      insights.push({
        type: 'warning',
        message: 'Friction Alert: Risk Tolerance. Your approach to stability differs significantly.',
      });
    }

    // Check Collaboration alignment
    const collabGap = Math.abs(normalizedUserScores.collaboration - compareTarget.collaboration);
    if (collabGap < 2) {
      insights.push({
        type: 'match',
        message: 'Chemistry Match: You share similar teamwork values and communication styles.',
      });
    }

    // Check Recognition gap
    const recognitionGap = Math.abs(normalizedUserScores.recognition - compareTarget.recognition);
    if (recognitionGap > 4) {
      insights.push({
        type: 'warning',
        message: 'Friction Alert: Visibility. Your needs for recognition are quite different.',
      });
    }

    return insights;
  }, [normalizedUserScores, selectedBenchmark, teamMembers]);

  // Generate scores string in format: A-I-C-S-R
  const scoresString = useMemo(() => {
    return categoryOrder.map(cat => normalizedUserScores[cat]).join('-');
  }, [normalizedUserScores]);

  // Generate shareable URL with scores
  const shareUrlWithScores = useMemo(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?s=${scoresString}`;
  }, [scoresString]);

  // Generate team URL: ?team=Name1:A-I-C-S-R,Name2:A-I-C-S-R
  const teamShareUrl = useMemo(() => {
    if (teamMembers.length === 0) return shareUrlWithScores;
    
    const baseUrl = window.location.origin + window.location.pathname;
    const teamParam = teamMembers.map(member => {
      const scoreStr = categoryOrder.map(cat => member.scores[cat]).join('-');
      return `${encodeURIComponent(member.name)}:${scoreStr}`;
    }).join(',');
    
    return `${baseUrl}?s=${scoresString}&team=${teamParam}`;
  }, [scoresString, teamMembers, shareUrlWithScores]);

  const shareText = `I just took the Emploid Vibe Check and I'm "${primaryBadge.title}"! ${primaryBadge.vibe} Find out your work personality:`;
  const shareUrl = window.location.href;

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share your Vibe Check with others.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const handleCopyScores = async () => {
    const formattedScores = `My Work Love Languages (Emploid Vibe Check)
━━━━━━━━━━━━━━━━━━━━━━━━
${categoryOrder.map(cat => `${categoryLabels[cat]}: ${normalizedUserScores[cat]}`).join(' | ')}
━━━━━━━━━━━━━━━━━━━━━━━━
Compare at: ${shareUrlWithScores}`;
    
    try {
      await navigator.clipboard.writeText(formattedScores);
      setScoresCopied(true);
      toast({
        title: "Scores copied!",
        description: "Share with a friend to compare results.",
      });
      setTimeout(() => setScoresCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTeamLink = async () => {
    try {
      await navigator.clipboard.writeText(teamShareUrl);
      setTeamLinkCopied(true);
      toast({
        title: "Team link copied!",
        description: "Share this link to show everyone's comparison.",
      });
      setTimeout(() => setTeamLinkCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTeamMember = () => {
    if (!newMemberName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the team member.",
        variant: "destructive",
      });
      return;
    }

    const parts = newMemberScores.trim().split('-').map(Number);
    if (parts.length !== 5 || parts.some(n => isNaN(n) || n < 0 || n > 10)) {
      toast({
        title: "Invalid format",
        description: "Please enter 5 numbers (0-10) separated by dashes. Example: 8-6-4-2-6",
        variant: "destructive",
      });
      return;
    }

    if (teamMembers.length >= 8) {
      toast({
        title: "Team limit reached",
        description: "Maximum 8 team members for chart readability.",
        variant: "destructive",
      });
      return;
    }
    
    const parsed: Record<Category, number> = {
      autonomy: parts[0],
      impact: parts[1],
      collaboration: parts[2],
      security: parts[3],
      recognition: parts[4],
    };

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      scores: parsed,
      color: teamColors[teamMembers.length % teamColors.length],
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    setSelectedBenchmark(null); // Clear benchmark when adding team members
    setNewMemberName('');
    setNewMemberScores('');
    
    toast({
      title: `${newMember.name} added!`,
      description: "Check out the comparison on the chart.",
    });
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setTeamMembers(prev => {
      const filtered = prev.filter(m => m.id !== memberId);
      // Reassign colors to maintain order
      return filtered.map((member, index) => ({
        ...member,
        color: teamColors[index % teamColors.length],
      }));
    });
  };

  const clearTeamComparison = () => {
    setTeamMembers([]);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="small" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-2">
          Your Vibe Check Results
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Here's what makes you tick at work
        </p>

        {/* User Scores Summary & Share Buttons (moved to top) */}
        <Card className="p-4 mb-6 bg-card shadow-lg border-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Score summary */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
              {categoryOrder.map(cat => (
                <div key={cat} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                  <span className="font-medium text-foreground">{categoryLabels[cat].slice(0, 3)}:</span>
                  <span className="font-bold text-primary">{normalizedUserScores[cat]}</span>
                </div>
              ))}
            </div>
            
            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyScores}
                variant="default"
                size="sm"
                className="flex items-center gap-1.5"
              >
                {scoresCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {scoresCopied ? 'Copied!' : 'Copy Scores'}
              </Button>
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                size="sm"
                className="p-2"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleLinkedInShare}
                variant="outline"
                size="sm"
                className="p-2"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="p-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Radar Chart */}
        <Card className="p-6 mb-8 bg-card shadow-xl border-0">
          <h2 className="text-lg font-semibold text-primary text-center mb-4">
            Your Vibe Shape
          </h2>
          <div className="w-full h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 10]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickCount={6}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="hsl(263, 50%, 21%)"
                  fill="hsl(263, 50%, 21%)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {/* Render team members */}
                {teamMembers.map((member) => (
                  <Radar
                    key={member.id}
                    name={member.name}
                    dataKey={member.id}
                    stroke={member.color}
                    fill={member.color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                {/* Render benchmark only if no team members */}
                {selectedBenchmark && teamMembers.length === 0 && (
                  <Radar
                    name={selectedBenchmark.name}
                    dataKey="benchmark"
                    stroke="hsl(5, 100%, 69%)"
                    fill="hsl(5, 100%, 69%)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                )}
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Compare with Your Team Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Compare with Your Team</span>
            </div>
            
            {/* Existing team members as chips */}
            {teamMembers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="font-medium text-foreground">{member.name}</span>
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {teamMembers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTeamComparison}
                    className="text-xs text-muted-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            )}
            
            {/* Add team member form */}
            {teamMembers.length < 8 && (
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  placeholder="Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="text-sm sm:w-28"
                />
                <Input
                  placeholder="Scores: 8-6-4-2-6"
                  value={newMemberScores}
                  onChange={(e) => setNewMemberScores(e.target.value)}
                  className="text-sm flex-1"
                />
                <Button onClick={handleAddTeamMember} size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            )}

            {/* Copy Team Link button */}
            {teamMembers.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleCopyTeamLink}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {teamLinkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  {teamLinkCopied ? 'Team Link Copied!' : 'Copy Team Link'}
                </Button>
              </div>
            )}
          </div>

          {/* Benchmark Comparison Selector (hidden when team members exist) */}
          {teamMembers.length === 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
                Compare Your Shape Against...
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {benchmarks.map((benchmark) => (
                  <button
                    key={benchmark.id}
                    onClick={() => setSelectedBenchmark(
                      selectedBenchmark?.id === benchmark.id ? null : benchmark
                    )}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedBenchmark?.id === benchmark.id
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {benchmark.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chemistry Insights (works for first team member or benchmark) */}
          {(teamMembers.length > 0 || selectedBenchmark) && chemistryInsights.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-primary mb-3 text-center">
                Chemistry Insights {teamMembers.length > 0 ? `with ${teamMembers[0].name}` : `with ${selectedBenchmark?.name}`}
              </h4>
              <div className="space-y-2">
                {chemistryInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      insight.type === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-green-50 text-green-800 border border-green-200'
                    }`}
                  >
                    <span className="mr-2">
                      {insight.type === 'warning' ? '⚠️' : '✨'}
                    </span>
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Delta Breakdown for Team */}
          {teamMembers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-primary mb-4 text-center">
                Score Breakdown vs Your Team
              </h4>
              <div className="space-y-4">
                {categoryOrder.map((category) => {
                  const userScore = normalizedUserScores[category];
                  
                  return (
                    <div key={category} className="space-y-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {categoryLabels[category]}
                      </span>
                      <div className="space-y-1">
                        {/* User score bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-xs text-muted-foreground">You</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(userScore / 10) * 100}%`,
                                backgroundColor: 'hsl(263, 50%, 21%)'
                              }}
                            />
                          </div>
                          <span className="w-8 text-xs font-semibold text-foreground text-right">{userScore}</span>
                        </div>
                        {/* Team member bars */}
                        {teamMembers.map((member) => {
                          const memberScore = member.scores[category];
                          const delta = userScore - memberScore;
                          return (
                            <div key={member.id} className="flex items-center gap-2">
                              <div className="w-12 text-xs text-muted-foreground truncate" title={member.name}>
                                {member.name}
                              </div>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(memberScore / 10) * 100}%`,
                                    backgroundColor: member.color
                                  }}
                                />
                              </div>
                              <span className={`w-8 text-xs font-semibold text-right ${
                                delta > 0 
                                  ? 'text-primary' 
                                  : delta < 0 
                                    ? 'text-muted-foreground' 
                                    : 'text-muted-foreground'
                              }`}>
                                {delta > 0 ? '+' : ''}{delta !== 0 ? delta : memberScore}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(263, 50%, 21%)' }} />
                  <span>You</span>
                </div>
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Delta Breakdown for Benchmark */}
          {selectedBenchmark && teamMembers.length === 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-primary mb-4 text-center">
                Score Breakdown vs {selectedBenchmark.name}
              </h4>
              <div className="space-y-3">
                {categoryOrder.map((category) => {
                  const userScore = normalizedUserScores[category];
                  const benchmarkScore = selectedBenchmark.scores[category];
                  const delta = userScore - benchmarkScore;
                  
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground w-28">
                        {categoryLabels[category]}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        {/* User score bar */}
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(userScore / 10) * 100}%`,
                              backgroundColor: 'hsl(263, 50%, 21%)'
                            }}
                          />
                        </div>
                        {/* Benchmark score indicator */}
                        <div className="relative flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(benchmarkScore / 10) * 100}%`,
                              backgroundColor: 'hsl(5, 100%, 69%)'
                            }}
                          />
                        </div>
                      </div>
                      {/* Delta indicator */}
                      <div className={`text-xs font-semibold w-14 text-right ${
                        delta > 0 
                          ? 'text-primary' 
                          : delta < 0 
                            ? 'text-accent' 
                            : 'text-muted-foreground'
                      }`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(0)} pts
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend for bars */}
              <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(263, 50%, 21%)' }} />
                  <span>You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(5, 100%, 69%)' }} />
                  <span>{selectedBenchmark.name}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Primary Badge */}
        <Card className="p-8 mb-8 bg-card shadow-xl border-0 text-center">
          <p className="text-sm font-medium text-accent uppercase tracking-wide mb-2">
            Your Primary Badge
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">
            {primaryBadge.title}
          </h2>
          <p className="text-lg font-medium text-muted-foreground italic mb-4">
            {primaryBadge.vibe}
          </p>
          <p className="text-foreground leading-relaxed">
            {primaryBadge.description}
          </p>
        </Card>

        {/* Deep Dive Section */}
        <Card className="p-8 mb-8 bg-card shadow-xl border-0">
          <h3 className="text-xl font-bold text-primary mb-6">Deep Dive</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-green-600">✓</span> Wins
            </h4>
            <ul className="space-y-2">
              {primaryBadge.wins.map((win, index) => (
                <li key={index} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-amber-500">⚠</span> Watch-Outs
            </h4>
            <ul className="space-y-2">
              {primaryBadge.watchOuts.map((watchOut, index) => (
                <li key={index} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{watchOut}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Best Match */}
          <div className="pt-6 border-t border-border">
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-primary">★</span> Best Match
            </h4>
            <p className="text-muted-foreground bg-muted/50 rounded-lg p-4 italic">
              {primaryBadge.bestMatch}
            </p>
          </div>
        </Card>

        {/* Restart Section (simplified since share is at top) */}
        <Card className="p-6 bg-card shadow-xl border-0">
          <Button
            onClick={onRestart}
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Retake the Vibe Check
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ResultsScreen;
