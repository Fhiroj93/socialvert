# SocialVert Client Content Dashboard

A real-time content operations platform built for SocialVert to give clients full visibility into their content pipeline, and give the internal team a single place to manage delivery across every stage — from idea to published post.

## What This Is

SocialVert manages content production for 40+ clients every month. Before this, clients had no way to see where their content stood without reaching out directly. This dashboard solves that by giving every client a live, always-current view of their content pipeline, and giving the SocialVert team a streamlined system to manage that pipeline without manual status updates or spreadsheets.

## Live Links

- **Client Dashboard:** https://social-vert.netlify.app/client-login
- **Manager Dashboard:** [https://socialvert.lovable.app/manager](https://social-vert.netlify.app/manager-login)

## The Experience

### For Clients
Each client logs into their own dedicated dashboard showing exactly where their content stands, with no technical knowledge required to understand it.

- **Monthly Quota Tracker** — a clear visual of how many videos are planned, completed, in progress, and remaining for the month
- **Pipeline Status Board** — every video shown moving through all five production stages (Idea, Script, Video, Caption, Schedule) at a glance, color-coded so progress is instantly obvious
- **Scripts Library** — clients can read every finalized script, see delivery dates and upcoming ETAs, and approve or request changes directly from the dashboard
- **Video Library** — every video with its current status, with an embedded preview so clients can watch content directly without leaving the dashboard
- **Captions & Hashtags** — full caption breakdown (hook, body, CTA, hashtags) per video, with inline editing so clients can adjust copy themselves if needed
- **Content Calendar** — a real calendar view showing exactly what's posting, when, and on which platform, with statuses that update automatically as content moves through scheduling and publishing
- **Performance Analytics** — views, engagement, top-performing platform, and top-performing posts, so clients can see how their content is actually landing, not just that it shipped

Every section reflects live data. When the SocialVert team updates something internally, the client sees it update on their own dashboard in real time — no refresh, no waiting, no chasing.

### For the SocialVert Team
A single manager dashboard to run content operations for every client from one place.

- Full client roster with at-a-glance completion tracking across the entire client base
- Per-client content management: create new video ideas, write and finalize scripts, update video production status, add captions, and schedule posts
- One-click scheduling that immediately triggers the automation layer — the moment a post is scheduled, it's picked up by the system and queued for publishing without anyone needing to log into a separate tool
- Account-level analytics across all clients: platforms connected, plan utilization, completion rates, and recent activity, so account managers can spot which clients need attention without digging through individual dashboards

## How It Stays Up to Date — Automatically

This is the core of the system: nothing on the client dashboard requires manual syncing.

When a member of the SocialVert team marks a script complete, updates a video's production status, or schedules a post, that action is written directly to the system's live database. A real-time automation layer is listening for exactly these changes — the moment a script flips to "complete" or a video becomes "ready," that update is detected automatically and pushed to the client's dashboard instantly, along with an automated internal notification confirming the change went through.

The scheduling step goes a level further: when a piece of content is marked "Scheduled," that action triggers a live automation workflow that processes the request, confirms it, and updates the dashboard status accordingly — all without manual intervention. The final connection from this workflow to the social platforms themselves (Instagram, TikTok, YouTube Shorts) is fully wired and ready to activate as soon as platform-side API access is approved for posting — at that point, the same automation that currently confirms scheduling will handle the actual publish step end-to-end, with no additional development work required.

In short: the system is built so that content moves from "idea" to "posted" with the data updating itself at every step, and the client never has to ask "where's my content?" because the answer is always already on their screen.

## Data Isolation

Each client only ever sees their own content. Clients access their dashboard through a unique, private link tied specifically to their account, and every piece of data shown is scoped to that client alone.

## What's Next

With more time, the natural next steps are: connecting the live publish step to each platform once API approvals are in place, adding authenticated login in place of unique links for an extra layer of access control, and extending the same automation pattern to pull from tools like Airtable or ClickUp if SocialVert's internal team prefers managing content there instead of directly in this dashboard.


## Built By
Shaik Fhiroj — AI Automation Engineer
+919347301449
