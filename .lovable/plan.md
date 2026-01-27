
## What I found (root causes)

### 1) “Match with Admin” does nothing (no UI feedback)
The current `AdminMatchButton` implementation is fully client-side and tries to “fake” a mutual like by writing **two** swipe rows:

- Candidate swipe: `swiper_id = authUserId` ✅ allowed by swipe insert policy (`auth.uid() = swiper_id`)
- Employer swipe: `swiper_id = TEST_EMPLOYER_ID` ❌ **not allowed** by the same policy (because the logged-in user is not the test employer)

That second write will return an RLS/permission error. Right now, the code **does not check** the error from either swipe upsert, so it can silently fail and feel like “nothing happened,” especially if the follow-up match insert also fails for any reason (or if the UI never reaches the success dialog).

Additionally, your database currently shows **no triggers**—so the “mutual swipe should trigger a match” assumption is not reliable in this environment.

### 2) “Browse Jobs” not going through preference flow
In the files you named, the buttons already route to `/city?type=candidate`. However, candidates can still land on `/swipe/candidate` **directly** (e.g., via saved last route, other links, or direct nav). Since `CandidateSwipe` does not enforce the presence of `city` and `role` query params, it can appear like “Browse Jobs skipped preferences” if the user ends up at `/swipe/candidate` without going through `/city → /roles → /game/skills`.

So: updating buttons is necessary, but adding a **guard in `CandidateSwipe`** is what makes it impossible to bypass the preference flow.

---

## Implementation approach

### A) Fix “Match with Admin” properly (reliable + visible feedback)
**Goal:** Clicking “Match with Admin” always results in either:
- “Already matched” dialog, or
- A newly created match + dialog + “Start Chatting”

**Strategy:** Move the privileged work to a backend function (Lovable Cloud function) using a server key so it can:
- Create/ensure an “Admin” profile row exists (in `profiles`) for `TEST_EMPLOYER_ID`
- Create/ensure the `matches` row exists for `(candidate_id = auth.uid(), employer_id = TEST_EMPLOYER_ID)`
- Optionally create swipes for realism (not required for functionality)

**Why this is best:**
- Avoids client RLS limitations (the main failure mode today)
- Deterministic: no “maybe the trigger ran” / no sleeps/polling required
- Lets us return a match id immediately for routing to `/chat/:matchId`
- Lets us provide immediate UI feedback (loading → success/error)

**Concrete changes**
1. **Create a backend function** (e.g., `force-admin-match`)
   - Requires authentication (must have a logged-in user)
   - Reads `candidateId` from the auth token
   - Performs:
     - `upsert profiles` for `TEST_EMPLOYER_ID` (full_name: “Admin”, user_type: “employer”)
     - `select matches` for existing match
     - if none, `insert matches` (status: `active`, job_id: null)
   - Returns `{ matchId, alreadyExisted }`

2. **Update `src/components/testing/AdminMatchButton.tsx`**
   - Replace the current client-side swipe/match logic with a single call:
     - `supabase.functions.invoke("force-admin-match", { method: "POST" })`
   - Add guaranteed UI feedback:
     - Immediately show a loading toast or inline loading state
     - On success: open the existing success dialog and store `matchId`
     - On error: show `toast.error(...)` and log detailed error

3. **(Optional but recommended) Add guardrails**
   - If the backend returns no matchId, show a clear error toast.
   - Ensure the button cannot be clicked repeatedly while loading.

**Files involved**
- `supabase/functions/force-admin-match/index.ts` (new backend function)
- `src/components/testing/AdminMatchButton.tsx` (replace implementation to call backend)

---

### B) Ensure Candidate Browse Jobs always goes through preferences
**Goal:** Candidates cannot enter the swipe deck without the preference flow.

**Strategy (2 layers)**
1. **Keep the button fixes you requested**
   - Confirm `CandidateDashboard` and `MatchesForYouSection` route to `/city?type=candidate` (they already do, but we’ll re-verify and ensure there are no regressions).

2. **Add an enforcement guard inside `CandidateSwipe`**
   - If `city` or `role` is missing:
     - Redirect to `/city?type=candidate`
     - Optionally show a toast: “Pick a city + role to start swiping”
   - This prevents bypassing the preference flow via:
     - last-route restore
     - direct URL navigation
     - any missed link elsewhere

**Files involved**
- `src/pages/CandidateDashboard.tsx` (verify no remaining direct `/swipe/candidate`)
- `src/components/dashboard/MatchesForYouSection.tsx` (verify no remaining direct `/swipe/candidate`)
- `src/pages/CandidateSwipe.tsx` (add guard redirect when params missing)

---

## Testing checklist (what we’ll verify in Preview)

### Match with Admin
1. Go to candidate swipe page and click **Match with Admin**
2. Expected:
   - Button shows loading immediately
   - A toast appears (loading → success)
   - Success dialog opens
3. Click **Start Chatting**
4. Expected:
   - Navigates to `/chat/:matchId`
   - Chat loads without crash
   - “Admin” displays as the other party (not “Unknown”)

5. Refresh the page, go to matches list
6. Expected:
   - Match persists
   - Clicking it opens chat again

### Preference flow enforcement
1. Navigate directly to `/swipe/candidate` (no query params)
2. Expected:
   - Auto-redirect to `/city?type=candidate`
3. Click Browse Jobs from:
   - CandidateDashboard
   - MatchesForYouSection
4. Expected:
   - Lands on CitySelection, not the swipe deck

---

## Notes / edge cases
- Because the “Admin” is not a real authenticated user, we will **not** attempt to log in as Admin. We’ll only ensure the profile row exists so the UI can render a name/avatar and chats can resolve the other profile cleanly.
- This approach avoids any database schema changes and does not rely on triggers.

---

## After this scope
Once “Match with Admin” is reliable and the preference flow is enforced, the next logical step is to address the other issues you listed (private PDF signed URLs, chat logging for document/quiz/interview events, and scout report filtering). Those are separate, larger scopes—happy to plan them next.