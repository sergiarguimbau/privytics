---
slug: ad-blockers-analytics-first-party-proxy
title: "Ad blockers blocking analytics: the first-party fix"
description: Why ad blockers stop analytics, how much data you can lose, and how a small proxy on your own domain gets it back.
date: 2026-07-29
updated: 2026-11-27
tag: Guide
---

Ad blockers stop analytics by matching each request a page makes against public block lists. The fix is a small proxy on your own domain, so the script and events look like any other request to your site. Google Analytics is the main target, but privacy-first tools are on those lists too.

## How ad blockers decide what to block

Blockers such as uBlock Origin, AdGuard and Brave load filter lists and test each request against them. For analytics, the best-known list is EasyPrivacy. Most of its rules name a domain, but some match a filename or path on any site.

| Rule matches       | Example        | A proxy avoids it? |
|--------------------|----------------|--------------------|
| Vendor domain      | `plausible.io` | ✓                  |
| Filename, any site | `/umami.js`    | If renamed         |
| Path, any site     | `/api/collect` | If renamed         |

So a new domain alone is not enough: give the files and paths your own names too.

## How much data you lose

It depends on your audience. Without a proxy, an analytics tool typically misses 5% to 25% of visitors, according to [Plausible's proxy guide](https://plausible.io/docs/proxy/introduction).

Technical audiences block the most. In one [extreme case](https://plausible.io/blog/do-ad-blockers-block-plausible-analytics), Google Analytics missed 58% of visitors from Hacker News and Reddit.

## Privacy-first tools are blocked less, not never

EasyPrivacy lists `plausible.io`, Fathom's script and collection hosts, `umami.is` and `simpleanalytics.com`. It also blocks the default filenames `/plausible.js` and `/umami.js`, so self-hosted Plausible and Umami are caught too.

The same list blocks `openpanel.dev/op1.js`, the default script of OpenPanel (the open-source engine behind Privytics). AdGuard blocks `api.openpanel.dev`. That is why our snippets send events to `https://api.privytics.com` and load the script from `https://privytics.com/op1.js`.

Today our script and API are not on EasyPrivacy, uBlock Origin's privacy list or AdGuard Tracking Protection, so most blockers let them through. Stricter custom lists can still catch them, and a proxy is insurance in case that changes.

## The fix: move both requests to your domain

![Without a proxy, the browser calls privytics.com and api.privytics.com directly, and a blocker can cut both. With a proxy, the browser calls paths on yourdomain.com, and your server forwards them to Privytics with the visitor IP and User-Agent, without cookies.](/images/blog/first-party-proxy.svg)

A tracker makes two requests, and both have to move:

1. **The script**, from `privytics.com/op1.js` to `yourdomain.com/js/pv.js`.
2. **The events**, from `api.privytics.com/track` to `yourdomain.com/pv/track`.

Moving only the script is a common mistake: the script loads, but a blocker can still stop the events.

Your proxy must forward:

- the visitor's IP, in the `openpanel-client-ip` header (not `X-Forwarded-For`);
- the browser's `User-Agent` and `Origin` headers;
- the `openpanel-client-id` header, with the method and body unchanged.

If the IP is missing, visitors with the same browser and system merge into one, and every visit shows your server's location. Also strip cookies: the browser sends your site's cookies with every request to your domain, and Privytics does not need them.

## Two examples: Nginx and a Cloudflare Worker

Pick your own paths rather than copying `/pv/`: a path many sites share can end up on a block list. EasyPrivacy already has a generic rule for `/op/op1.js`.

**Nginx**

```nginx
location = /js/pv.js {
    proxy_pass https://privytics.com/op1.js;
    proxy_set_header Host privytics.com;
    proxy_set_header Cookie "";
    proxy_ssl_server_name on;
}

location /pv/ {
    proxy_pass https://api.privytics.com/;
    proxy_set_header Host api.privytics.com;
    proxy_set_header Cookie "";
    proxy_set_header openpanel-client-ip $remote_addr;
    proxy_ssl_server_name on;
}
```

Nginx passes `User-Agent` and `Origin` through by default. Behind a CDN or load balancer, `$remote_addr` is that machine, not the visitor: set `set_real_ip_from` and `real_ip_header` first.

**Cloudflare Worker**

Route the Worker on `yourdomain.com/js/pv.js` and `yourdomain.com/pv/*`. Cloudflare puts the visitor's address in `CF-Connecting-IP`, so the IP is right with no extra setup.

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);

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
      headers.set('openpanel-client-ip', request.headers.get('CF-Connecting-IP') ?? '');
      return fetch(`https://api.privytics.com${url.pathname.slice('/pv'.length)}`, {
        method: request.method,
        headers,
        body: request.body,
      });
    }

    return fetch(request);
  },
};
```

On another stack, such as Next.js or Nuxt, write a server route that does the same. Skip the proxy helpers in OpenPanel's packages for them (`createRouteHandler`, `proxy: true`): they point at OpenPanel's hosts, not ours.

Then point the [script tag](/for/script-tag) at your paths:

```html
<script>
  window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}} ,has:function(t,r){return"q"===r}}) }();
  window.op('init', {
    apiUrl: 'https://yourdomain.com/pv',
    clientId: 'YOUR_CLIENT_ID',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  });
</script>
<script src="https://yourdomain.com/js/pv.js" defer async></script>
```

## Is a proxy fair to your visitors?

Yes, for cookieless counting on your own site. It is not a way to track people who said no.

Privytics sets no cookies and stores nothing on your visitors' devices. Each visitor gets an anonymous ID that changes every day, so no one is followed from one day to the next. We explain how in [what is cookieless analytics](/blog/what-is-cookieless-analytics).

If a visitor's browser sends Global Privacy Control (`navigator.globalPrivacyControl` is `true`), respect it: start the SDK with `disabled: true` and never call `ready()`.

## FAQ

### Does a custom subdomain with a CNAME fix it?

Only partly. Brave and uBlock Origin on Firefox look up where a CNAME points and block the vendor behind it, and EasyPrivacy lists many such subdomains by name.

### Do I need to move the script if I install from npm?

Not with `@openpanel/web`: the tracker is part of your bundle, so only `apiUrl` changes. The Next.js and Astro components load a script, so point `scriptUrl` at your path too.

### Will a proxy change my visitor numbers?

It adds the visits blockers were hiding, as long as the proxy forwards the visitor's IP and User-Agent. If the Countries panel shows one country for every visit, the IP is not getting through.

### Do I still need a cookie banner if I proxy?

The proxy changes nothing here: the banner rule is about data stored on or read from the visitor's device, not the script's domain. Privytics stores nothing there, so anonymous analytics [generally needs no cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).
