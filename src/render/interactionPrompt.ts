import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import { Text } from "pixi.js"
import type { Application } from "pixi.js"

export type PromptLike = {
  x: number
  y: number
  visible: boolean
}

export type PromptStore = {
  prompt: PromptLike | null
  createPrompt: () => PromptLike
  addPrompt: (prompt: PromptLike) => void
}

export type InteractionPoint = {
  x: number
  y: number
  radius: number
  offsetY?: number
}

export const createPromptStore = (
  app: Application,
  options: { text?: string; color?: string; fontSize?: number } = {},
): PromptStore => ({
  prompt: null,
  createPrompt: () => {
    const prompt = new Text(options.text ?? "Press E", {
      fill: options.color ?? "#ffffff",
      fontSize: options.fontSize ?? 12,
    })
    prompt.anchor.set(0.5, 1)
    return prompt
  },
  addPrompt: (prompt) => {
    app.stage.addChild(prompt)
  },
})

const ensurePrompt = (store: PromptStore): PromptLike => {
  if (store.prompt) return store.prompt
  const prompt = store.createPrompt()
  store.prompt = prompt
  store.addPrompt(prompt)
  return prompt
}

const isWithinRange = (x: number, y: number, interaction: InteractionPoint) => {
  const dx = x - interaction.x
  const dy = y - interaction.y
  return Math.hypot(dx, dy) <= interaction.radius
}

export const createInteractionPromptSystem =
  (player: number, store: PromptStore, interaction: InteractionPoint) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const prompt = ensurePrompt(store)
    const playerX = Position.x[player]
    const playerY = Position.y[player]
    const offsetY = interaction.offsetY ?? 0

    prompt.x = interaction.x
    prompt.y = interaction.y - offsetY
    prompt.visible = isWithinRange(playerX, playerY, interaction)
  }
