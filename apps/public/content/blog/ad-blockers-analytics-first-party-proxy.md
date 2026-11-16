---
slug: ad-blockers-analytics-first-party-proxy
title: "Ad blockers blocking analytics: the first-party fix"
description: Ad blockers blocking analytics? How filter lists work, how much data you lose by audience type, and how a first-party proxy on your own domain wins it back.
date: 2026-07-29
updated: 2026-07-29
tag: Guide
---

Ad blockers break analytics by matching every outgoing request against filter lists: tens of thousands of rules covering tracking domains, script filenames and endpoint paths. Privacy-first tools are hit far less often than Google Analytics, but they are on those lists too. The durable fix is to stop looking third-party: serve the tracker script from your own domain and forward events through your own server, so a blockable cross-site call becomes an ordinary first-party one.

One boundary first: a first-party proxy is legitimate for cookieless, aggregate measurement of your own site, not a way to smuggle cross-site tracking past someone who has said no.

*Filter list contents checked against [EasyPrivacy](https://easylist.to/) version 202607282254 (28 July 2026) on 29 July 2026. Vendor figures checked the same day. General information, not legal advice.*

## How ad blockers decide what to block

uBlock Origin, AdGuard, Brave's shields and Safari content blockers work the same way: they ship filter lists, and every request a page makes is tested against them before it leaves the browser. For analytics the list that matters is EasyPrivacy, on by default in uBlock Origin.

The version we checked held roughly 55,600 active rules: about 51,300 anchored to a domain, about 3,000 matching a path or filename on *any* domain. That second group defeats the naive fix of renaming your host.

| Matching method | Example rule shape | What it catches |
| --- | --- | --- |
| Vendor domain | anchor on `plausible.io`, `cdn.usefathom.com`, `umami.is` | Anything served from the vendor's host |
| Domain plus file | anchor on `openpanel.dev/op1.js` | One named script on one named host |
| Filename anywhere | `/umami.js` | Self-hosted installs keeping the stock filename |
| Path on any host | `/api/collect`, limited to XHR and ping | The ingestion endpoint wherever you move it |
| Host name pattern | `://fathom.` plus an allowlist | Subdomains whose name gives the tool away |
| CNAME target | resolved by DNS, Firefox only | Vanity subdomains pointing back at the vendor |

That last row is why the classic CNAME trick, pointing `stats.yoursite.com` at the vendor, has a shelf life: uBlock Origin on Firefox resolves the CNAME and blocks the real destination, what its documentation calls uncloaking third-party servers disguised as first-party. Chrome has no equivalent DNS API.

## How much data actually vanishes

Audience decides it, and the spread is enormous. Three reference points: GWI, via DataReportal, put ad blocker usage at 29.5% of internet users worldwide in Q2 2025, counting anyone who blocks at least sometimes, peaking in the 25 to 34 band and declining through every older bracket after it. [Plausible's proxy documentation](https://plausible.io/docs/proxy/introduction) puts the share of visitors a vendor-hosted install misses at typically 5% to 25%. And [Plausible reported a case](https://plausible.io/blog/do-ad-blockers-block-plausible-analytics) on Hacker News and Reddit traffic where Google Analytics missed 58% of visitors, which they call extreme.

| Audience | Blocking pressure | Reading of the evidence |
| --- | --- | --- |
| Developer tools, open source, security, privacy communities | Highest | The 58% gap came from this traffic mix, flagged as extreme |
| Technical SaaS and B2B software | High | Upper end of Plausible's 5% to 25% range |
| General consumer and ecommerce | Moderate | Blockers are installed for ads; analytics loss is collateral |
| Older or less technical audiences | Lowest | GWI's age bands peak at 25 to 34 and decline from there |

The practical read: sell to developers and your unproxied numbers are wrong by a margin that changes decisions.

## Privacy-first tools are blocked less, not never

Being cookieless helps. Firefox blocks Google Analytics in private windows by default and everywhere in Strict mode, and Safari's default protections cap or discard the cookies it depends on, with its advanced protection blocking known-tracker requests outright in private browsing. Neither blocks the privacy-first tools out of the box. That is an advantage, not an exemption.

We checked EasyPrivacy directly. It carries entries for `plausible.io`, `cdn.usefathom.com`, `collect.usefathom.com`, `umami.is` and `simpleanalytics.com`, plus filename rules such as `/plausible.js` and `/umami.js` that catch self-hosted copies whatever domain serves them. It also carries a rule for `openpanel.dev/op1.js`, the upstream default for the open-source engine Privytics runs on. Better to say so here than let you find it in production. It is why our snippets point `scriptUrl` at `https://privytics.com/op1.js`, and why the proxy below is the durable fix rather than a workaround.

## The fix: two things must move to your domain

A tracker makes two kinds of request, and both have to become first-party.

1. **The script.** A `GET` for the tracker file. Served from `yourdomain.com/js/pv.js`, no filename or domain rule matches.
2. **The events.** A `POST` to the ingestion endpoint. Sent to `yourdomain.com/pv/track`, no endpoint rule matches either.

Moving only the script is the common half-finished job: the script loads, every event it sends is blocked, and the dashboard breaks more confusingly than before.

Privytics supports this: the web SDK takes an `apiUrl`, and the components that inject the script tag, including the Next.js and Astro ones, take a `scriptUrl`. Point both at your own paths.

Three things your proxy must forward, or ingestion fails confusingly:

- **The real visitor IP.** The API reads `openpanel-client-ip`, then `true-client-ip`, `x-client-ip`, `cf-connecting-ip`, `x-forwarded-for`, `x-real-ip`. Get this wrong and every visitor collapses into one anonymous id, since the [cookieless visitor hash](/blog/what-is-cookieless-analytics) is IP plus user agent plus project, and country reporting breaks too.
- **The `origin` header.** The API checks it against your project's allowed domains and rejects mismatches.
- **The `openpanel-client-id`, `openpanel-sdk-name` and `openpanel-sdk-version` headers**, plus the method and body unchanged.

## Code sketches

Adapt the paths: a `/pv/` that becomes common becomes a filter rule.

**Nginx**

```nginx
# in the http block, not the server block
proxy_cache_path /var/cache/nginx/pvjs levels=1:2 keys_zone=pvjs:10m max_size=64m;

location = /js/pv.js {
    proxy_pass https://privytics.com/op1.js;
    proxy_set_header Host privytics.com;
    proxy_ssl_server_name on;
    proxy_cache pvjs;
    proxy_cache_valid 200 6h;
}

location /pv/ {
    proxy_pass https://api.privytics.com/;
    proxy_set_header Host api.privytics.com;
    proxy_ssl_server_name on;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header openpanel-client-ip $remote_addr;
}
```

`proxy_cache_valid` is inert without both the zone and `proxy_cache`. And if nginx sits behind a CDN or load balancer, `$remote_addr` is that upstream, not the visitor: set `set_real_ip_from` and `real_ip_header` first, then check the Countries panel.

**Next.js rewrites**

```js
// next.config.js
module.exports = {
  async rewrites() {
    return [
      { source: '/js/pv.js', destination: 'https://privytics.com/op1.js' },
      { source: '/pv/:path*', destination: 'https://api.privytics.com/:path*' },
    ];
  },
};
```

Rewrites to an external destination are proxied by the Next server, so whether the visitor IP survives depends on your host: check the Countries panel after deploying. Base setup is on the [Next.js guide](/for/nextjs).

**Cloudflare Worker**, the least error-prone of the three, since [Cloudflare sets `CF-Connecting-IP`](https://developers.cloudflare.com/fundamentals/reference/http-request-headers/) to the original visitor address:

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const clientIp = request.headers.get('CF-Connecting-IP') ?? '';

    if (url.pathname === '/js/pv.js') {
      return fetch('https://privytics.com/op1.js', {
        cf: { cacheTtl: 21600, cacheEverything: true },
      });
    }

    if (url.pathname.startsWith('/pv/')) {
      const headers = new Headers(request.headers);
      headers.delete('cookie');
      headers.delete('authorization');
      headers.delete('host');
      headers.set('openpanel-client-ip', clientIp);
      headers.set('X-Forwarded-For', clientIp);
      return fetch(
        `https://api.privytics.com${url.pathname.slice('/pv'.length)}`,
        { method: request.method, headers, body: request.body },
      );
    }

    return fetch(request);
  },
};
```

Note the deletes: the proxy path is on your own domain, so the browser attaches your site's session cookies to it. Forward only what ingestion needs.

Then repoint the [script tag](/for/script-tag):

```html
<script>
  // queue stub from your setup snippet, unchanged
  window.op('init', {
    apiUrl: 'https://yourdomain.com/pv', // was https://api.privytics.com
    clientId: 'YOUR_CLIENT_ID',
    trackScreenViews: true,
  });
</script>
<!-- was https://privytics.com/op1.js -->
<script src="https://yourdomain.com/js/pv.js" defer async></script>
```

One caveat for the [Nuxt module](/for/nuxt): its `proxy: true` option generates a handler that posts to a hardcoded upstream OpenPanel host rather than your `apiUrl`, so events would not reach Privytics. Write your own server route instead.

## The ethics, which are the whole argument

A first-party proxy is only defensible because of what is inside the requests. Cookieless measurement qualifies: nothing lands on the device to object to, no cookie, no local storage, no persistent id. The Privytics anonymous id is a salted hash of IP, user agent and project id, the salt rotating at midnight UTC, so it cannot follow anyone into tomorrow or onto another site. Proxying that is not proxying an ad pixel, and we would not write this guide for one.

Do Not Track is over: [MDN lists `navigator.doNotTrack` as deprecated](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack) and the specification as discontinued, and Firefox removed the setting in 2025. [Global Privacy Control](https://globalprivacycontrol.org/) replaced it and carries weight: it became a W3C Privacy Working Group work item in November 2024, and California's Attorney General has stated that the CCPA requires businesses to treat a user-enabled global privacy control as a valid opt-out request. Read `navigator.globalPrivacyControl` and honour it: in Privytics, initialise with `disabled: true` and never call `ready()` for those visitors.

## FAQ

### Do ad blockers block privacy-friendly analytics too?

Yes. Every major privacy-first vendor has an EasyPrivacy entry, and self-hosting does not help on its own: filename rules catch the stock script name whatever domain serves it. The advantage over Google Analytics is real but a difference of degree, not of category.

### How much traffic do ad blockers actually hide?

Audience decides it, and the published ranges span an order of magnitude: a few per cent on a general consumer site, a quarter of visitors on a technical one, well over half in the worst documented comparison.

### Does a custom subdomain with a CNAME fix it?

Only partially. uBlock Origin on Firefox resolves CNAME records and blocks the true destination, so a vanity subdomain pointing at a known analytics host still gets caught. A real reverse proxy has no such weakness.

### Will proxying break the cookieless visitor count?

Only if the proxy drops the visitor IP, which the anonymous id is derived from. Forward the real address in `openpanel-client-ip` or `x-forwarded-for` and counts are unchanged. A Countries panel showing one country for everything is the symptom.

### Is proxying analytics dishonest?

Not for cookieless, aggregate measurement of your own site, which is what a first-party request always was. It would be dishonest for anything that sets identifiers, follows people across sites, or routes around a stated preference. Honouring Global Privacy Control is the line.

### Do I still need a cookie banner if I proxy?

No change either way. Under EU ePrivacy rules the trigger is storing or reading information on the device, not the domain that served the script, so a cookieless tool sits in the same position proxied or not. The reasoning is in [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). Confirm your own case with your compliance advice.
