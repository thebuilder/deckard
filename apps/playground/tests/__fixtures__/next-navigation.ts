// next/link and next/navigation both want an app around them. A block test
// mounts one component on its own, so vitest.config.ts points those imports
// here. Navigation is not what these tests are about, so nothing is recorded.
const router = {
  back: () => undefined,
  forward: () => undefined,
  prefetch: () => undefined,
  push: () => undefined,
  refresh: () => undefined,
  replace: () => undefined,
}

export function useRouter() {
  return router
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function usePathname() {
  return "/"
}
