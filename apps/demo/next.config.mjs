/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  images: {
    // The fullscreen slide is an SVG in public/, and next/image refuses SVG
    // through the optimizer without this. The file is ours and ships no script.
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    dangerouslyAllowSVG: true,
  },
  transpilePackages: ["@deckard/core"],
}

export default nextConfig
