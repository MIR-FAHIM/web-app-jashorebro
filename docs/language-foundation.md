# Language foundation

Section 06 introduces Bengali (`bn`) and English (`en`) for the consumer shell, account tools and language settings. Full page localization remains Section 11. No new dependency is installed.

`LocaleProvider` wraps the existing auth, friends and cart providers without changing their identities. The language control changes only locale state and `jb_locale_v1`; it does not navigate, clear carts, change referral receipts or modify account data.

Preference order: a valid explicit browser choice, then English as the user-approved initial default. Signing in does not override that choice. Same-origin tabs receive storage updates. Invalid saved values fall back to the default. If storage is unavailable, the choice stays in memory for the session; language settings explain that it could not be saved. There is no account/cross-device sync in this section.

Add UI strings to both `src/shared/i18n/locales/bn.js` and `en.js`, then call `useLocale().t('key', { count: 2 })`. Numeric substitutions are formatted for the selected locale; `_one`/`_other` keys support grammatical variants. Missing Bengali entries fall back to English, then to the key so unfinished development is visible. Product names and user-authored content are not translated.

The hook exposes `formatNumber`, `formatMoney` (BDT, up to two decimal places) and `formatDate` (Asia/Dhaka unless explicitly overridden). Use these in newly localized UI. Existing one-argument formatting utilities keep their current behavior until those screens are migrated in Section 11; arithmetic/API values remain unchanged.

`LocaleDocument` sets consumer document language, left-to-right direction and localized title. Admin remains English. The existing font stack now includes Bengali-capable system fallbacks; no remote font request or font installation is added.

Primary navigation is Shop (`/`), Community (`/community`), Friends (`/friends`) and Profile (`/profile`). `/explore` still renders the marketplace with its exact query/hash; `/feed` renders Community. Product/Pick/profile/order aliases remain intact. Account tools include My Picks, Friend Picks, Orders, Saved addresses, Earnings and Language; personal stores remain behind the existing feature flag.
