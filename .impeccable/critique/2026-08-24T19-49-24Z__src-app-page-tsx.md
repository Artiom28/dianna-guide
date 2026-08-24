---
target: головна сторінка (/) — RulesScreen/RulesOverlay/MainScreen
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-24T19-49-24Z
slug: src-app-page-tsx
---
# Критика дизайну головної сторінки DiAnna Guide (`/`)

Method: dual-agent (A: design review · B: detector/browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No confirmation "Продовжити" registered; hard-cut transitions |
| 2 | Match System / Real World | 2 | Authentic terminology undercut by live placeholder content |
| 3 | User Control and Freedom | 3 | Esc/close work; no browser-history integration |
| 4 | Consistency and Standards | 3 | Consistent pill/color system; accordion vs link not pre-signaled |
| 5 | Error Prevention | 2 | Good phone validation; no guard against shipping placeholders |
| 6 | Recognition Rather Than Recall | 2 | No TOC/anchors in 1478-word rules text |
| 7 | Flexibility and Efficiency | 1 | RULES_VALID_DAYS=0 live in prod (own comment says temp) |
| 8 | Aesthetic and Minimalist Design | 3 | Clean system, marred by placeholder intrusions |
| 9 | Error Recovery | 3 | Phone format error handled well |
| 10 | Help and Documentation | 2 | No help during highest-stakes reading moment |

Total: 23/40 — Acceptable band. No heuristics n/a.

## Design Specificity Verdict
Genuinely grounded (real hotel photo, dense authentic rules text, idiomatic Ukrainian) but undermined by live placeholder content: 3/4 link buttons -> dianna-spa.example.com, one YouTube stub, tel:+380000000000, "Послуги" accordion literally reads "(плейсхолдер)". CLI detector: 1 finding (gray-on-color, RulesOverlay.tsx:176) verified false positive (Tailwind disabled: variant confusion). Browser injection on main screen found ai-color-palette + flat-type-hierarchy (14/16/18/24px, 1.7:1 ratio) — empirically confirms Assessment A's independent "flat button hierarchy" finding.

## Priority Issues
[P0] Live placeholder content and dead links (example.com links, YouTube stub, placeholder accordion text) -> /impeccable audit, /impeccable harden
[P1] RULES_VALID_DAYS=0 disables repeat-visit skip in production -> /impeccable harden
[P1] Cognitive overload on rules-gate screen (6/8 checklist items failed; ~45% viewport eaten by fixed footer) -> /impeccable clarify
[P2] No warm welcome moment before legal wall -> /impeccable delight
[P2] Flat, ungrouped button hierarchy on MainScreen (confirmed by detector) -> /impeccable clarify

## Persona Red Flags
Jordan (first-timer/elderly): jargon wall, no tap affordance signal, no accept confirmation, dead restaurant link.
Casey (in a hurry / returning guest): full gate replay every visit, cramped footer, no in-app wifi/hours answer.
Sam (accessibility): no focus management on dialog open, 11px/low-contrast disclaimer below WCAG AA.

## Minor Observations
gray-on-color CLI flag verified false positive; empty gap on tall viewports; run-on teaser text; contact info buried at end of rules; no browser-history integration on overlay.
