# Japan Lost Item Check

Free checker for anyone who lost something in Japan: who to contact first (station, Tokyo Metro, JR East / Central / West, Osaka Metro, taxi, Narita / Haneda / Kansai, police), what to stop right away (cards, phone, My Number card), how long found items are kept under the Lost Property Act (遺失物法: 3 months; umbrellas and clothing may go after 2 weeks), when shops and railways hand items to the police, the finder's reward (5–20%) and the residence card (在留カード) 14-day reissue deadline. English + Japanese.

Live: https://japan-lost-item.vercel.app

- API: `GET /api/check?items=wallet,residence_card&place=subway&operator=tokyo_metro&lostDate=2026-11-01` (keyless, CORS open, POST JSON too), `/api/rules`, `/openapi.json`, `/llms.txt`, `/.well-known/ai-plugin.json`
- MCP: `japan_lost_item_check` on https://free-agent-tools.vercel.app/mcp

Sources: 遺失物法 and 遺失物法施行令 (e-Gov), National Police Agency lost-property site, prefectural police (Keishicho, Osaka, Kanagawa), Immigration Services Agency, Digital Agency, operator lost-and-found pages. Rules as of 2026-11-03.

**Disclaimer:** educational, not legal advice and not an official service; not affiliated with the National Police Agency, any police force, the Immigration Services Agency, the Digital Agency, or any railway, airport or taxi company. It can't search for your item.
