
# Usability Audit Report: Emploid Application

After a deep examination of the codebase, I've identified 28 usability issues across the application. These are organized by severity and category.

---

## Critical Issues (Immediate Fix Required)

### 1. Chat FAB Backdrop Blocks Input Focus
**Location:** `src/components/chat/ChatActionsMenu.tsx`
**Issue:** When the Chat Actions Menu (+ button) is opened in the chat, it renders a full-screen backdrop with `fixed inset-0` that captures all clicks. Even after closing, the focus management doesn't properly return to the input field.
**Impact:** Users report the FAB "grays out the chat box and loses focus" after sending messages.
**Root Cause:** The backdrop and menu are siblings to the input, and the AnimatePresence exit animation may be interfering with focus restoration.

### 2. HelpFAB Hidden on Desktop but Uses Fixed Positioning
**Location:** `src/components/layout/HelpFAB.tsx` (line 39)
**Issue:** The HelpFAB is `hidden md:block` (only visible on desktop md+), but the Chat page doesn't use AppLayout (where HelpFAB lives). The user reports FAB popup interference in chat, but chat has its own ChatActionsMenu FAB that may be the actual culprit.
**Impact:** Confusion between two FAB systems with similar UI patterns.

### 3. Quiz Results Not Accessible After Completion
**Location:** `src/components/chat/ChatInterface.tsx`
**Issue:** The `QuizResultsDialog` is created but the `completedInsights` array may not properly map to viewable quiz results for employers. The QuizSummaryCard is clickable, but the dialog requires proper insight data.
**Impact:** Employers cannot review quiz responses; candidates cannot edit answers.

### 4. Missing Loading States on Critical Actions
**Locations:**
- `JobRecommendationCard` "View" button has no loading indicator
- `MatchesForYouSection` cards navigate without feedback
- Discovery Scout "View Profile" buttons have no loading state
**Impact:** Users click, nothing appears to happen immediately.

---

## High Priority Issues (Navigation/Routing)

### 5. Scout Report Links Navigate to Profile Instead of Filtered View
**Location:** `src/components/dashboard/DiscoverySectionCandidate.tsx` (line 241-245)
**Issue:** Clicking a Discovery Scout job card navigates to `/company/{user_id}` instead of showing the specific job or a filtered scout report.
**Current behavior:** `navigate(\`/company/${job.user_id}\`)`
**Expected:** User mentioned "Scout report shows all jobs" - the Discovery section only shows top 3, but clicking navigates away entirely rather than expanding/filtering.

### 6. CandidateSwipe Guard May Cause Flash Redirect
**Location:** `src/pages/CandidateSwipe.tsx` (lines 58-64)
**Issue:** The redirect guard runs in a `useEffect` after initial render, causing a brief flash of the swipe UI before redirecting if params are missing.
**Better approach:** Use early return with redirect before any state initialization.

### 7. JobRecommendationCard View Button Ignores Job ID
**Location:** `src/components/dashboard/JobRecommendationCard.tsx` (line 67)
**Issue:** The `onView(job.id)` callback is passed, but in `CandidateDashboard.tsx` (line 66-68), the handler ignores the job ID entirely:
```tsx
const handleViewJob = (jobId: string) => {
  navigate(`/city?type=candidate`);  // Job ID is ignored!
};
```
**Impact:** Clicking "View" on a specific job doesn't take you to that job.

### 8. MobileBottomNav "Swipe" Routes Differently for Employers
**Location:** `src/components/layout/MobileBottomNav.tsx`
**Issue:** Employers route directly to `/swipe/employer`, but candidates route through `/city?type=candidate`. This asymmetry may confuse users about the preference flow.

---

## Medium Priority Issues (Mobile-Specific)

### 9. HelpFAB Not Visible on Mobile
**Location:** `src/components/layout/HelpFAB.tsx` (line 39)
**Issue:** `className="fixed bottom-6 right-6 z-50 hidden md:block"` - the FAB is completely hidden on mobile devices.
**Impact:** Mobile users cannot access help, feedback, or tour restart features.

### 10. AppLayout Bottom Padding May Overlap Content
**Location:** `src/components/layout/AppLayout.tsx` (line 43)
**Issue:** `pb-20 md:pb-0` adds 80px bottom padding on mobile for the bottom nav, but some pages with their own fixed bottom elements may have double padding.

### 11. Chat Sidebar Hidden on Mobile Without Alternative
**Location:** `src/pages/Matches.tsx` (lines 61-68)
**Issue:** The ChatSidebar is `hidden md:block` on mobile, leaving mobile users without the sidebar preview panel functionality.

### 12. Swipe Card Drag Threshold May Be Too Small for Touch
**Location:** `src/components/swipe/SwipeStack.tsx` (line 85)
**Issue:** The swipe threshold is 100px (`const threshold = 100`), which may be too small for reliable touch interactions on larger mobile devices.

---

## Medium Priority Issues (UI/UX)

### 13. Chat Input Not Properly Refocused After Message Send
**Location:** `src/components/chat/ChatInterface.tsx` (lines 202-210)
**Issue:** After `handleSubmit`, the code calls `inputRef.current?.focus()`, but this happens inside the async callback. If the FAB or any other element captures focus between the submit and the focus call, the focus won't stick.

### 14. Multiple Sonner/Toast Systems May Conflict
**Location:** `src/App.tsx` (lines 58-59)
**Issue:** The app uses both `<Toaster />` (from @/components/ui/toaster) AND `<Sonner />` simultaneously. Having two toast systems can cause:
- Visual overlap
- Conflicting z-index issues
- Inconsistent toast behavior

### 15. ChatsDropdown May Have Stale Data
**Location:** `src/components/ChatsDropdown.tsx`
**Issue:** The dropdown fetches matches in a useEffect but doesn't subscribe to realtime updates, so new messages may not appear until page refresh.

### 16. Profile Preview Modal Missing User Context
**Location:** Multiple dashboard pages use `ProfilePreviewModal`
**Issue:** The modal is opened without passing which profile to preview - it likely defaults to current user, but this isn't clear from the implementation.

---

## Low Priority Issues (Polish/Consistency)

### 17. Inconsistent Empty State Messaging
**Locations:**
- `Matches.tsx`: "No matches yet"
- `MatchesForYouSection.tsx`: "No synergy matches found yet"
- `DiscoverySectionCandidate.tsx`: "No high-synergy matches yet"
**Issue:** Similar features use different terminology which may confuse users.

### 18. NavigationMenu Missing Aria Labels
**Location:** `MobileBottomNav.tsx`, `AppSidebar.tsx`
**Issue:** Navigation buttons use icons without proper aria-label attributes for screen readers.

### 19. Dialog Close Buttons Not Keyboard Accessible
**Location:** Multiple dialog components
**Issue:** Some custom close buttons in dialogs may not be properly keyboard focusable.

### 20. SwipeStack "isAnimating" Race Condition
**Location:** `src/components/swipe/SwipeStack.tsx` (lines 36-81)
**Issue:** The `handleSwipe` function uses state (`isAnimating`) to prevent double-swipes, but there's a potential race condition between the animation timeout (350ms) and rapid user input.

### 21. Document Signed URL Expiration Not Handled
**Location:** `src/components/chat/DocumentReceivedCard.tsx`
**Issue:** Signed URLs expire after 3600 seconds (1 hour). If a user keeps the chat open, the document links may become stale without any refresh mechanism.

---

## Hanging/Non-Responsive Triggers

### 22. AdminMatchButton Success Dialog May Not Close Properly
**Location:** `src/components/testing/AdminMatchButton.tsx`
**Issue:** The success dialog `setShowSuccess(true)` is set, but the dialog close handler should reset `matchId` as well. If the dialog is dismissed without clicking "Start Chatting", the state may persist.

### 23. CreateJobDialog Page Reload Anti-Pattern
**Location:** `src/pages/EmployerDashboard.tsx` (lines 194, 207)
**Issue:** `onJobCreated={() => window.location.reload()}` forces a full page reload instead of refreshing the jobs list via React Query invalidation.
**Impact:** Poor UX, loses any unsaved state.

### 24. LinkedIn Import Hangs If Edge Function Times Out
**Location:** `src/components/profile/LinkedInImportButton.tsx`
**Issue:** The progress interval runs indefinitely until the import completes. If the edge function times out or fails silently, the user sees an incomplete progress bar.

### 25. RoleDefinitionDialog May Not Refresh Parent State
**Location:** `src/pages/Chat.tsx` (lines 692-698)
**Issue:** The `onComplete={handleRoleComplete}` callback fetches job info again, but if the Supabase update hasn't propagated, the UI may show stale data.

---

## Specific Links Doing Nothing

### 26. "View Role Info" Link in Chat Uses roleId Not jobId
**Location:** `src/pages/Chat.tsx` (line 410)
```tsx
onClick={() => navigate(`/results?role=${jobInfo.roleId}`)}
```
**Issue:** The Results page expects a `role` query param that's a role_id (like "head_marketing"), not a job UUID. This may work for some jobs but could fail if roleId is unexpected.

### 27. Matches Page "Continue Swiping" Goes Backward
**Location:** `src/pages/Matches.tsx` (line 107)
```tsx
<Button onClick={() => navigate(-1)}>Continue Swiping</Button>
```
**Issue:** `navigate(-1)` goes to the previous page in history, which may not be the swipe page. Should be explicit: `/swipe/employer` or `/city?type=candidate`.

### 28. MatchesForYouSection Cards All Go to Same URL
**Location:** `src/components/dashboard/MatchesForYouSection.tsx` (line 172)
**Issue:** Every card in the section navigates to `/city?type=candidate` regardless of which job was clicked. Users expect clicking a specific job to show that job.

---

## Summary Priority Matrix

| Priority | Count | Key Areas |
|----------|-------|-----------|
| Critical | 4 | FAB focus, Quiz results, Loading states |
| High | 4 | Navigation routing, Job ID ignored |
| Medium (Mobile) | 4 | Hidden features, Padding issues |
| Medium (UX) | 4 | Toast conflicts, Stale data |
| Low | 5 | Consistency, Accessibility |
| Links/Buttons | 7 | Specific non-working interactions |

---

## Recommended Fix Order

1. **Chat FAB focus issue** - Fix immediately as it blocks core messaging
2. **Quiz results accessibility** - Employers need to review candidate responses
3. **JobRecommendationCard job ID routing** - Basic expected behavior
4. **Mobile HelpFAB visibility** - Mobile users have no help access
5. **Toast system consolidation** - Prevent visual glitches
6. **Stale signed URL handling** - Add refresh mechanism for documents

