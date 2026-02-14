

## Overview

Three fixes to ensure a consistent, bug-free onboarding experience for both user types: correct routing from Auth, enable the "Skip to Dashboard" button for returning users on the Welcome page, and add step-resume logic to the Employer Onboarding V2.

## 1. Fix V1/V2 Routing in Auth.tsx

**File:** `src/pages/Auth.tsx` (lines 117-119)

Currently, returning users who haven't completed culture are routed to `/employer-onboarding` or `/candidate-onboarding` (V1 routes). Change these to V2:

- `/employer-onboarding` becomes `/employer-onboarding-v2`
- `/candidate-onboarding` becomes `/candidate-onboarding-v2`

## 2. Wire Up isReturningUser in Welcome.tsx

**File:** `src/pages/Welcome.tsx`

The `Day14Interstitial` component already accepts `isReturningUser` and `onSkip` props but they are never passed. Changes:

- Determine `isReturningUser` from profile data (e.g., `profile.has_completed_profile === true` or `profile.has_completed_walkthrough === true` from onboarding status)
- Pass `isReturningUser` and an `onSkip` handler that navigates directly to the appropriate dashboard
- This enables the "Skip to Dashboard" button for users who have already been through onboarding

## 3. Add Resume Logic to EmployerOnboardingV2

**File:** `src/pages/EmployerOnboardingV2.tsx`

Mirror the candidate V2 pattern (lines 37-61 of CandidateOnboardingV2.tsx):

- If `has_completed_profile` and `company_name` exist, mark step 0 (Identity) complete, jump to step 1 (Culture)
- If `has_completed_culture_game` is also true, mark steps 0-1 complete, jump to step 2 (Team)
- If all steps are done (profile + culture + team_environment), redirect to `/employer-dashboard`

This prevents employers from being forced to redo completed steps when they return to the onboarding flow.

## Technical Details

### Auth.tsx Change (line 118)
```typescript
// Before
const destination = profile.user_type === "employer" ? "/employer-onboarding" : "/candidate-onboarding";
// After
const destination = profile.user_type === "employer" ? "/employer-onboarding-v2" : "/candidate-onboarding-v2";
```

### Welcome.tsx Changes
```typescript
// Determine returning user status
const isReturningUser = profile?.has_completed_profile === true;

// Skip handler
const handleSkip = () => {
  const dashboard = profile?.user_type === "employer" ? "/employer-dashboard" : "/candidate-dashboard";
  navigate(dashboard);
};

// Pass to Day14Interstitial
<Day14Interstitial
  userType={profile.user_type}
  onComplete={handleInterstitialComplete}
  isReturningUser={isReturningUser}
  onSkip={handleSkip}
/>
```

### EmployerOnboardingV2.tsx Resume Logic
Add inside the existing `useEffect` after the auth/type checks:

```typescript
// Resume: skip already-completed steps
if (profile.has_completed_profile && profile.company_name) {
  setCompletedSteps([0]);
  if (profile.has_completed_culture_game) {
    setCompletedSteps([0, 1]);
    setCurrentStep(2); // Jump to Team step
  } else {
    setCurrentStep(1); // Jump to Culture step
  }
}

// Fully done - redirect to dashboard
if (profile.has_completed_profile && profile.has_completed_culture_game && (profile as any).team_environment) {
  navigate("/employer-dashboard");
}
```
