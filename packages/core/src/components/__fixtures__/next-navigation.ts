// The router a mounted component asks for. Tests that care about navigation read
// the calls back off these arrays.
export const pushed: string[] = []
export const prefetched: string[] = []

const router = {
  back: () => undefined,
  forward: () => undefined,
  prefetch: (href: string) => {
    prefetched.push(href)
  },
  push: (href: string) => {
    pushed.push(href)
  },
  refresh: () => undefined,
  replace: (href: string) => {
    pushed.push(href)
  },
}

export function useRouter() {
  return router
}

// Read off the address bar the way next/navigation does, so a test can put a
// slide in presenter preview with history.replaceState.
export function useSearchParams() {
  return new URLSearchParams(window.location.search)
}

export function usePathname() {
  return "/"
}
