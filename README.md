# ApexSignal — Stakeholder Relationship Visualiser

**Yash Garg** | August 2026  
**Client:** Shell plc

---

## Why Shell

I picked Shell over Repsol or RWE mainly because the Milieudefensie court case gave me a really concrete "deteriorating relationship" to anchor the data model around. It made the `state` field feel meaningful rather than made-up — there's an actual court ruling that makes the Shell–Netherlands relationship objectively worse than it was two years ago. That kind of concreteness helped me design the rest of the edges.

---

## Live URL

**[https://assignment-puce-three.vercel.app](https://assignment-puce-three.vercel.app)**

---

## Data Model

This is the part I spent the most time on, because the brief said to "decide deliberately" — so I tried to.

### Node

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Slug-style, e.g. `gov_uk`, `ngo_greenpeace` |
| `name` | `string` | Display name |
| `type` | `StakeholderType` | Drives colour coding on the graph |
| `country` | `string` | Useful context, not used visually (yet) |
| `influence` | `critical \| high \| medium \| low` | Maps to node radius — bigger = more influential |
| `description` | `string` | Who they are and why they matter to Shell |

**On the `influence` field:** I debated whether to derive this from relationship `strength` instead of setting it explicitly. I ended up keeping it explicit because a stakeholder like Milieudefensie has high influence on Shell *structurally* (via the court ruling) even if their day-to-day interaction strength is low. They're different things.

### Edge

| Field | Type | Notes |
|---|---|---|
| `source` / `target` | `string` | Always `shell` as source in this version |
| `type` | `RelationshipType` | `collaborative`, `regulatory`, `adversarial`, `financial`, `operational` |
| `strength` | `1–10` | How much this relationship actually matters operationally |
| `state` | `stable \| improving \| deteriorating` | The trajectory — this is the core analytical signal |
| `direction` | `bilateral \| inbound \| outbound` | Who's driving the relationship |
| `description` | `string` | What's actually happening right now |

**The `state` field is the useful part.** Knowing that Shell has a relationship with the UK Government is obvious. Knowing it's *deteriorating* because of windfall taxes — that's what a risk analyst actually needs.

**On edge `direction`:** I added this late. I realised "Shell has a relationship with the EPA" doesn't tell you whether Shell is lobbying them or just being regulated. The direction field tries to capture that. `inbound` means the other actor is applying pressure or control; `outbound` means Shell is leading.

---

## One decision I was genuinely unsure about

**Including Wael Sawan (Shell's CEO) as an individual node.**

It felt a bit weird at first — like, obviously the CEO is connected to the company, that's tautological. But the more I thought about it, the more it made sense. His personal relationships with ministers, NOC heads, and QatarEnergy matter independently of Shell as an institution. If he left tomorrow, those relationships would partly leave with him. That's a real risk signal. So I kept it.

The same logic applies to Follow This (Mark van Baal) — a single activist with a shareholder resolution strategy that's getting 28% support at AGMs. That's an individual acting with material influence, which is the definition of a node in this model.

---

## Technical Approach

**React + TypeScript** for state management and component structure.  
**D3.js** for the force simulation, SVG rendering, and zoom/pan. I gave D3 exclusive control of the SVG DOM inside a `useEffect` rather than trying to reconcile it with React's virtual DOM — that was the main architectural decision and it made everything cleaner.

**On legibility** — this was the real design problem. 35 nodes with hub-and-spoke edges is genuinely hard to read. I handled it with layers:

1. Node size reflects influence, so your eye goes to what matters
2. Edge colour shows state (red = deteriorating, green = improving, grey = stable) — you can read the risk picture before you even click anything
3. Click any node to dim everything unconnected — isolates the context of that stakeholder
4. Filter by type to see just regulators, or just financiers, etc.
5. Search if you know who you're looking for

I don't think I fully solved it. At 35 nodes the graph is still busy. The filter helps a lot.

---

## What I didn't build (and why)

**Stakeholder-to-stakeholder edges.** Greenpeace coordinates with Milieudefensie. BlackRock talks to Vanguard. Those lateral relationships exist and matter. I left them out because they would have doubled the visual complexity and I didn't have a clean way to make them legible. With more time I'd add them as a second-depth toggle — hidden by default, shown on demand.

**Historical state.** The `state` field is a snapshot. A more useful version would show how it's *changed* — a time-series showing that the Shell–UK Government relationship was `stable` in 2022, `improving` in 2023 during the North Sea Transition Deal, and is now `deteriorating` post-windfall tax. That's the version that actually supports decision-making.

**Mobile layout.** The sidebar breaks on small screens. It works fine on a laptop, which is where this would actually be used, so I deprioritised it.

---

## Challenges

**D3 + React ownership conflict.** D3 mutates the DOM directly; React re-renders it. I resolved this by mounting the SVG via React but handing all rendering to D3 inside `useEffect`. Visual updates (highlighting, dimming) run in a separate `useEffect` that only touches SVG attributes without restarting the simulation.

**Making the `state` field feel real.** It's easy to just assign `stable` to everything. I tried to root each edge's state in something concrete — a specific policy, a court case, a signed agreement — so the descriptions actually explain *why* the relationship is where it is, not just label it.
