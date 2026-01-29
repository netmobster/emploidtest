
## Overview

Adding shortlist indicator badges to the Matches page allows employers to quickly see which candidates they've already shortlisted for roles, improving workflow efficiency and reducing duplicate actions.

## What We'll Build

When an employer views their matches list, each candidate card will display a visual indicator if that candidate has been added to any shortlist. The badge will show the job title(s) they're shortlisted for, making it easy to track hiring pipeline status at a glance.

## Implementation Steps

### 1. Create Shortlist Status Hook
Create a new hook `useShortlistStatus` to efficiently fetch all shortlisted candidate IDs for the current employer in a single query.

```
File: src/hooks/useShortlistStatus.ts
```

- Fetches all shortlist entries for the employer
- Includes job title information via join
- Returns a map of candidate_id to array of job titles
- Only runs for employer users

### 2. Create Shortlist Indicator Badge Component
Create a reusable badge component that displays shortlist status.

```
File: src/components/shortlist/ShortlistIndicatorBadge.tsx
```

- Shows a star icon with "Shortlisted" label
- Tooltip or expandable section showing which role(s)
- Uses gold/amber color scheme to stand out
- Compact design that fits the match card layout

### 3. Update Matches Page
Integrate the shortlist status into the main Matches page.

```
File: src/pages/Matches.tsx
```

- Import and use the new `useShortlistStatus` hook
- Only fetch shortlist data when user is an employer
- Pass shortlist info to each match card
- Add the `ShortlistIndicatorBadge` component next to existing badges

### 4. Update Chat Sidebar (Optional Enhancement)
Also show shortlist indicators in the collapsible chat sidebar for consistency.

```
File: src/components/chat/ChatSidebar.tsx
```

- Add shortlist indicator to preview panel
- Show shortlist status on hover/preview

## Visual Design

The badge will appear in the match card's info section:
- Position: After the "Candidate" badge, before the archetype badge
- Style: Amber/gold background with star icon
- Text: "Shortlisted" with role count if multiple
- Interaction: Click to see full list of roles in tooltip

## Technical Considerations

### Query Optimization
- Single query fetches all shortlist entries for the employer
- Data is cached in React state, not refetched per-card
- Uses Supabase joins to get job titles efficiently

### User Type Check
- Shortlist status only fetched for employer users
- Candidates see no shortlist badges (not applicable to their view)
- Prevents unnecessary database queries

### Data Structure
```typescript
type ShortlistMap = Map<string, { jobId: string; jobTitle: string }[]>;
```

This maps each candidate_id to an array of jobs they're shortlisted for.
