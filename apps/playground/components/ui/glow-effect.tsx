"use client"
import { cn } from "@deckard/core/utils"
import { motion, type TargetAndTransition, type Transition } from "motion/react"

export interface GlowEffectProps {
  blur?:
    | number
    | "softest"
    | "soft"
    | "medium"
    | "strong"
    | "stronger"
    | "strongest"
    | "none"
  className?: string
  colors?: string[]
  duration?: number
  mode?:
    | "rotate"
    | "pulse"
    | "breathe"
    | "colorShift"
    | "flowHorizontal"
    | "static"
  scale?: number
  style?: React.CSSProperties
  transition?: Transition
}

const blurPresets = {
  medium: "blur-md",
  none: "blur-none",
  soft: "blur-sm",
  softest: "blur-xs",
  strong: "blur-lg",
  stronger: "blur-xl",
  strongest: "blur-xl",
}

const getBlurClass = (blur: GlowEffectProps["blur"]) => {
  if (typeof blur === "number") {
    return `blur-[${blur}px]`
  }

  return blurPresets[blur as keyof typeof blurPresets]
}

export function GlowEffect({
  className,
  style,
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const baseTransition: Transition = {
    duration,
    ease: "linear",
    repeat: Number.POSITIVE_INFINITY,
  }

  const mirroredTransition: Transition = {
    ...baseTransition,
    repeatType: "mirror",
  }

  const animations: Record<
    NonNullable<GlowEffectProps["mode"]>,
    TargetAndTransition
  > = {
    breathe: {
      background: [
        ...colors.map(
          (color) =>
            `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
        ),
      ],
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...(transition ?? mirroredTransition),
      },
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length]
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`
      }),
      transition: {
        ...(transition ?? mirroredTransition),
      },
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const nextColor = colors[(colors.indexOf(color) + 1) % colors.length]
        return `linear-gradient(to right, ${color}, ${nextColor})`
      }),
      transition: {
        ...(transition ?? mirroredTransition),
      },
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      opacity: [0.5, 0.8, 0.5],
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      transition: {
        ...(transition ?? mirroredTransition),
      },
    },
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(", ")})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(", ")})`,
      ],
      transition: {
        ...(transition ?? baseTransition),
      },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(", ")})`,
    },
  }

  return (
    <motion.div
      animate={animations[mode]}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        "scale-[var(--scale)] transform-gpu",
        getBlurClass(blur),
        className
      )}
      style={
        {
          ...style,
          "--scale": scale,
          backfaceVisibility: "hidden",
          willChange: "transform",
        } as React.CSSProperties
      }
    />
  )
}
