"use client"
import { cn } from "@deckard/core/utils"
import type {
  TargetAndTransition,
  Transition,
  Variant,
  Variants,
} from "motion/react"
import { AnimatePresence, motion } from "motion/react"
import React from "react"

export type PresetType = "blur" | "fade-in-blur" | "scale" | "fade" | "slide"

export type PerType = "word" | "char" | "line"

export interface TextEffectProps {
  as?: keyof React.JSX.IntrinsicElements
  children: string
  className?: string
  containerTransition?: Transition
  delay?: number
  onAnimationComplete?: () => void
  onAnimationStart?: () => void
  per?: PerType
  preset?: PresetType
  segmentTransition?: Transition
  segmentWrapperClassName?: string
  speedReveal?: number
  speedSegment?: number
  style?: React.CSSProperties
  trigger?: boolean
  variants?: {
    container?: Variants
    item?: Variants
  }
}

const defaultStaggerTimes: Record<PerType, number> = {
  char: 0.03,
  line: 0.1,
  word: 0.05,
}

const defaultContainerVariants: Variants = {
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const defaultItemVariants: Variants = {
  exit: { opacity: 0 },
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
}

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      exit: { filter: "blur(12px)", opacity: 0 },
      hidden: { filter: "blur(12px)", opacity: 0 },
      visible: { filter: "blur(0px)", opacity: 1 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      exit: { opacity: 0 },
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  "fade-in-blur": {
    container: defaultContainerVariants,
    item: {
      exit: { filter: "blur(12px)", opacity: 0, y: 20 },
      hidden: { filter: "blur(12px)", opacity: 0, y: 20 },
      visible: { filter: "blur(0px)", opacity: 1, y: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      exit: { opacity: 0, scale: 0 },
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      exit: { opacity: 0, y: 20 },
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
}

const renderSegment = (segment: string, variants: Variants, per: PerType) => {
  if (per === "line") {
    return (
      <motion.span className="block" variants={variants}>
        {segment}
      </motion.span>
    )
  }

  if (per === "word") {
    return (
      <motion.span
        aria-hidden="true"
        className="inline-block whitespace-pre"
        variants={variants}
      >
        {segment}
      </motion.span>
    )
  }

  return (
    <motion.span className="inline-block whitespace-pre">
      {segment.split("").map((char, charIndex) => (
        <motion.span
          aria-hidden="true"
          className="inline-block whitespace-pre"
          // biome-ignore lint/suspicious/noArrayIndexKey: characters of a fixed string repeat, so position is the only stable identity
          key={`char-${charIndex}`}
          variants={variants}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

const AnimationComponent: React.FC<{
  segment: string
  variants: Variants
  per: "line" | "word" | "char"
  segmentWrapperClassName?: string
}> = React.memo(({ segment, variants, per, segmentWrapperClassName }) => {
  const content = renderSegment(segment, variants, per)

  if (!segmentWrapperClassName) {
    return content
  }

  const defaultWrapperClassName = per === "line" ? "block" : "inline-block"

  return (
    <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>
      {content}
    </span>
  )
})

AnimationComponent.displayName = "AnimationComponent"

const whitespaceSplitPattern = /(\s+)/

const splitText = (text: string, per: PerType) => {
  if (per === "line") {
    return text.split("\n")
  }
  return text.split(whitespaceSplitPattern)
}

const hasTransition = (
  variant?: Variant
): variant is TargetAndTransition & { transition?: Transition } => {
  if (!variant) {
    return false
  }
  return typeof variant === "object" && "transition" in variant
}

const createVariantsWithTransition = (
  baseVariants: Variants,
  transition?: Transition & { exit?: Transition }
): Variants => {
  if (!transition) {
    return baseVariants
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exit: _, ...mainTransition } = transition

  return {
    ...baseVariants,
    exit: {
      ...baseVariants.exit,
      transition: {
        ...(hasTransition(baseVariants.exit)
          ? baseVariants.exit.transition
          : {}),
        ...mainTransition,
        staggerDirection: -1,
      },
    },
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(hasTransition(baseVariants.visible)
          ? baseVariants.visible.transition
          : {}),
        ...mainTransition,
      },
    },
  }
}

export function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset = "fade",
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  containerTransition,
  segmentTransition,
  style,
}: TextEffectProps) {
  const segments = splitText(children, per)
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  const baseVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants }

  const stagger = defaultStaggerTimes[per] / speedReveal

  const baseDuration = 0.3 / speedSegment

  const containerVisible = variants?.container?.visible

  const customStagger = hasTransition(containerVisible)
    ? containerVisible.transition?.staggerChildren
    : undefined

  const customDelay = hasTransition(containerVisible)
    ? containerVisible.transition?.delayChildren
    : undefined

  const computedVariants = {
    container: createVariantsWithTransition(
      variants?.container || baseVariants.container,
      {
        delayChildren: customDelay ?? delay,
        staggerChildren: customStagger ?? stagger,
        ...containerTransition,
        exit: {
          staggerChildren: customStagger ?? stagger,
          staggerDirection: -1,
        },
      }
    ),
    item: createVariantsWithTransition(variants?.item || baseVariants.item, {
      duration: baseDuration,
      ...segmentTransition,
    }),
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger ? (
        <MotionTag
          animate="visible"
          className={className}
          exit="exit"
          initial="hidden"
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
          style={style}
          variants={computedVariants.container}
        >
          {per === "line" ? null : <span className="sr-only">{children}</span>}
          {segments.map((segment, index) => (
            <AnimationComponent
              // biome-ignore lint/suspicious/noArrayIndexKey: split text segments repeat, so position is the only stable identity
              key={`${per}-${index}-${segment}`}
              per={per}
              segment={segment}
              segmentWrapperClassName={segmentWrapperClassName}
              variants={computedVariants.item}
            />
          ))}
        </MotionTag>
      ) : null}
    </AnimatePresence>
  )
}
