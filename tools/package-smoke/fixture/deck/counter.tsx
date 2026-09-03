"use client"

import { Button } from "@thebuilder/deckard-core/ui"
import { useCallback, useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => {
    setCount((current) => current + 1)
  }, [])

  return (
    <Button onClick={increment} type="button">
      Clicked {count} times
    </Button>
  )
}
