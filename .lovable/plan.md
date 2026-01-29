
## Overview

Add a shortlist button directly to the employer swipe deck, allowing employers to save promising candidates to their shortlists without leaving the swipe flow. This creates a more efficient workflow where employers can bookmark candidates they want to compare later while continuing to swipe.

## What We'll Build

A star/bookmark button will appear in the swipe controls (next to the undo button) when employers are swiping candidates. Clicking it opens the existing `AddToShortlistDialog` to select a role and optionally add notes. The button will have visual feedback when a candidate is already shortlisted.

## Implementation Steps

### 1. Update SwipeControls Component
Add an optional shortlist button prop to the existing SwipeControls.

```
File: src/components/swipe/SwipeControls.tsx
```

- Add `onShortlist` and `isShortlisted` optional props
- Render a star button (filled when already shortlisted)
- Position it alongside the undo button on the left side
- Use amber/gold color scheme matching the shortlist indicator badges

### 2. Update FullProfileCard Component
Pass shortlist props through to SwipeControls.

```
File: src/components/swipe/FullProfileCard.tsx
```

- Add `onShortlist` and `isShortlisted` props to the interface
- Forward these to the SwipeControls component
- Button only renders when `onShortlist` is provided (employer-only)

### 3. Update SwipeStack Component
Add shortlist callback prop and pass it through.

```
File: src/components/swipe/SwipeStack.tsx
```

- Add `onShortlist` optional prop to SwipeStackProps
- Add `isShortlistedFn` optional prop (similar to `isMatchedFn`)
- Pass both through to FullProfileCard for the current item

### 4. Update EmployerSwipe Page
Integrate shortlist functionality with the swipe deck.

```
File: src/pages/EmployerSwipe.tsx
```

- Import `useShortlistStatus` hook for checking shortlist status
- Import `AddToShortlistDialog` component
- Add state for managing shortlist dialog (open/closed, candidate info)
- Create `handleShortlist` callback to open the dialog
- Create `isShortlistedFn` using the hook's `isShortlisted` method
- Pass both to SwipeStack
- Render the dialog with current candidate info
- Call `refetch` after successful shortlist addition to update badges

## Technical Details

### Props Flow
```text
EmployerSwipe
  └── SwipeStack
       └── FullProfileCard
            └── SwipeControls
                 └── Shortlist Button
```

### Button Behavior
- **Not shortlisted**: Outline star button, amber on hover
- **Already shortlisted**: Filled amber star with tooltip showing roles
- **Click action**: Opens AddToShortlistDialog with candidate pre-filled
- **After add**: Refetch shortlist status to update badge immediately

### Conditional Rendering
- Shortlist button only appears for employer swipe (type="candidate")
- Uses existing AddToShortlistDialog for consistent UX
- Dialog auto-selects current job if `jobId` is in URL params

## Visual Design

The shortlist button will be positioned in the control bar:
```text
[Undo] [Shortlist★] [✕ Pass] [⭐ Super] [♥ Like]
```

- **Icon**: Star (lucide `Star` or `Bookmark`)
- **Color**: Amber/gold (`amber-500`) matching shortlist indicators
- **Size**: Same as undo button (w-12 h-12)
- **States**: Outline (default), Filled (shortlisted), Hover glow
