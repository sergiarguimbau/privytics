/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully prerendered static site, deployed to Cloudflare Pages. Every route is
  // static or SSG, so there is nothing to run at request time.
  //
  // This is also why it works where OpenNext did not: the blog and /for guides
  // read their markdown/JSON from `content/` with node:fs, which a Workers
  // runtime cannot do per-request. With `export` those reads happen during the
  // build, in Node, and only HTML ships.
  //
  // Consequence to remember: `headers()` and `redirects()` are not supported
  // here. Cache-Control for the tracker lives in `public/_headers` instead,
  // which Cloudflare Pages reads natively.
  output: 'export',
};

export default nextConfig;
