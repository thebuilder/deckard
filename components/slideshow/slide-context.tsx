"use client"

import { createContext, type ReactNode, useContext } from "react"

interface SlideContextValue {
  isPresenterPreview: boolean
  title?: ReactNode
}

type SlideContextProviderProps = SlideContextValue & {
  children: ReactNode
}

const SlideContext = createContext<SlideContextValue>({
  isPresenterPreview: false,
  title: undefined,
})

export function SlideContextProvider({
  title,
  isPresenterPreview = false,
  children,
}: SlideContextProviderProps) {
  return (
    <SlideContext.Provider value={{ isPresenterPreview, title }}>
      {children}
    </SlideContext.Provider>
  )
}

function useSlideContext() {
  return useContext(SlideContext)
}

export function useSlideTitle() {
  return useSlideContext().title
}

export function useIsPresenterPreview() {
  return useSlideContext().isPresenterPreview
}
