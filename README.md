# PacketScope - Front End

**Upload, analyze and organize network packet captures — in your browser.**

PacketScope is a full-stack web application (**React + FastAPI + PostgreSQL**) that turns raw `.pcap` capture files into a clear, organized view of network traffic. Upload a capture and the backend parses it with [Scapy](https://scapy.net/), showing you protocols, top talkers and packet-level detail — then lets you tag and annotate every capture so nothing gets lost.


![PacketScope dashboard](docs/landing.png)

🌐 **Live app:** _coming soon_ 

⚙️ **Backend repo:** [packetscope-back-end](https://github.com/dana12812/packetscope-back-end) 

📋 **Planning board:** [GitHub Projects board](PASTE_PROJECT_BOARD_LINK)

---

## Table of contents

1. [The problem](#the-problem)
2. [How PacketScope works](#how-packetscope-works)
3. [Features](#features)
4. [User stories](#user-stories)
5. [Wireframes](#wireframes)
6. [Database design](#database-design)
7. [Technologies used](#technologies-used)
8. [Planning materials](#planning-materials)
9. [File Structure](#file-structure)
10. [Next steps](#next-steps)


---

## The problem

A `.pcap` file is a recording of network traffic — every packet in and out — but on its own it's just an opaque binary blob. To make sense of one you normally reach for a heavy desktop tool like Wireshark, installed locally, with nothing shared and nothing saved between sessions.

That leaves a few gaps:

- **No quick overview.** You have to dig through thousands of packets to answer simple questions — what protocols are here, who's talking to whom, how long did this last?
- **Nothing is kept.** Once you close the tool, your analysis and notes are gone.
- **Nothing is organized.** There's no easy way to label captures, group related ones, or come back to a past analysis.

PacketScope solves **visibility** first — an instant summary of what's inside a capture — and then **organization** — tags, notes and a personal library you can return to.

## How PacketScope works

```
 UPLOAD                 PARSE                 ANALYZE                    ORGANIZE
 ──────                 ─────                 ───────                    ────────
 Upload a .pcap ──> Read with Scapy ──> Protocol breakdown,   ──> Tag, annotate
 (size-limited)     (rdpcap)            top talkers, timing        and revisit
```

## Features

| Feature | Description |
|---|---|
| **Accounts** | Sign up, sign in and sign out with JWT token authentication |
| **Upload & parse** | Upload a `.pcap` file (size-limited); parsed server-side with Scapy |
| **Traffic summary** | Protocol breakdown, packet count, duration and top source/destination IPs |
| **Packet inspection** | Browse individual packets — time, source, destination, protocol, length |
| **Notes** | Add, edit and delete notes on any capture to record findings |
| **Tags** | Create color-coded tags and attach them to captures (many-to-many) |
| **Authorization** | Every user sees and edits only their own captures, notes and tags |

## User stories

### Account

| ID | User story |
|---|---|
| A1 | As a visitor, I want to sign up, so that I can save and manage my captures. |
| A2 | As a user, I want to sign in and sign out, so that my data stays private. |

### Captures

| ID | User story |
|---|---|
| C1 | As a user, I want to upload a `.pcap` file, so that I can analyze its traffic. |
| C2 | As a user, I want to be warned when a file is over the size limit, so that I know why it was rejected. |
| C3 | As a user, I want to see a capture's summary, so that I can understand it at a glance. |
| C4 | As a user, I want to browse the individual packets, so that I can inspect details. |
| C5 | As a user, I want to see a list of all my captures, so that I can revisit past work. |
| C6 | As a user, I want to rename and delete captures, so that I can keep my library tidy. |

### Notes & tags

| ID | User story |
|---|---|
| N1 | As a user, I want to add notes to a capture, so that I can record findings. |
| N2 | As a user, I want to edit and delete my notes, so that I can keep them accurate. |
| T1 | As a user, I want to create tags with names and colors, so that I can categorize captures. |
| T2 | As a user, I want to attach and detach tags on a capture, so that I can group related ones. |

### Security

| ID | User story |
|---|---|
| S1 | As a user, I want my password stored securely, so that my account is safe even if data leaks. |
| S2 | As a user, I want to see only my own data, so that no one else can access my captures. |

## Wireframes

| Landing | Sign up | Sign in |
|---|---|---|
| ![Landing](docs/Landing.png) | ![Sign up](docs/Sign-up.png) | ![Sign in](docs/Sign-in.png) |

| Dashboard | Capture detail | Edit capture |
|---|---|---|
| ![Dashboard](docs/Dashboard.png) | ![Capture detail](docs/Capture-detail.png) | ![Edit capture](docs/Edit-capture.png) |

## Database design

The backend uses **PostgreSQL** with four tables — `users`, `captures`, `annotations` and `tags` — plus a `capture_tags` join table that makes captures and tags many-to-many. A user owns their captures, annotations and tags, and each capture has many annotations.

See the full ERD, API endpoints and packet-parsing details in the **[backend README](https://github.com/dana12812/packetscope-back-end)**.

## Technologies used

| Category | Technologies |
|---|---|
| **Frontend** | React, Vite, React Router, CSS (Flexbox & Grid) |
| **Backend** | Python, FastAPI, SQLAlchemy, Alembic, Pydantic |
| **Database** | PostgreSQL |
| **Auth** | JWT, bcrypt |
| **Packet parsing** | Scapy |
| **Planning & design** | GitHub Projects, DrawSQL |
| **Deployment** | _hosting platforms to be added_ |


You'll also need the [backend](https://github.com/dana12812/packetscope-back-end) running for the app to work.

## Planning materials

- **Planning board:** [GitHub Projects board](PASTE_PROJECT_BOARD_LINK)
- **ERD:** [PacketScope on DrawSQL](https://drawsql.app/teams/dana-alsaleh/diagrams/packetscope)

## File Structure

```
packetscope-front-end/
├── src/
│   ├── components/
│   │   ├── Landing/
│   │   │   └── Landing.jsx
│   │   ├── NavBar/
│   │   │   └── NavBar.jsx
│   │   ├── SignUpForm/
│   │   │   └── SignUpForm.jsx
│   │   ├── SignInForm/
│   │   │   └── SignInForm.jsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── CaptureDetail/
│   │   │   └── CaptureDetail.jsx
│   │   ├── EditCaptureForm/
│   │   │   └── EditCaptureForm.jsx
│   │   ├── CaptureCard/
│   │   │   └── CaptureCard.jsx
│   │   ├── TagChip/
│   │   │   └── TagChip.jsx
│   │   └── ProtectedRoute/
│   │       └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── UserContext.jsx
│   ├── lib/helpers/
│   │   └── jwt-helpers.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── captureService.js
│   │   ├── annotationService.js
│   │   └── tagService.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Next steps

Planned features for future versions:

- **Filter by tag** — narrow the dashboard to a single tag
- **Packet search** — find packets by IP or protocol
- **Geo-IP map** — plot external IP locations, looked up from the backend so no keys live in the frontend
- **Anomaly flags** — automatically highlight patterns like port scans or ARP spoofing
- **PDF export** — download a capture summary to share


**Author:** Dana AlSaleh — [GitHub](https://github.com/dana12812)