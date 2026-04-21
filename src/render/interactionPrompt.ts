import { Position } from "@/src/ecs/components"
import type { GameWorld } from "@/src/ecs/world"
import {
  getCurrentInteractionPoint,
  isWithinInteractionRange,
} from "@/src/game/fixtureInteraction"
import type { RoomState } from "@/src/game/roomState"
import { Text } from "pixi.js"
import type { Container } from "pixi.js"

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

export const createPromptStore = (
  container: Container,
  options: { text?: string; color?: string; fontSize?: number } = {},
): PromptStore => ({
  prompt: null,
  createPrompt: () => {
    const prompt = new Text({
      text: options.text ?? "Press E",
      style: {
        fill: options.color ?? "#ffffff",
        fontSize: options.fontSize ?? 12,
      },
    })
    prompt.anchor.set(0.5, 1)
    return prompt
  },
  addPrompt: (prompt) => {
    container.addChild(prompt)
  },
})

const ensurePrompt = (store: PromptStore): PromptLike => {
  if (store.prompt) return store.prompt
  const prompt = store.createPrompt()
  store.prompt = prompt
  store.addPrompt(prompt)
  return prompt
}

export const createInteractionPromptSystem =
  (player: number, store: PromptStore, roomState: RoomState) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const prompt = ensurePrompt(store)
    const playerX = Position.x[player]
    const playerY = Position.y[player]
    const interaction = getCurrentInteractionPoint(roomState)
    const offsetY = interaction.offsetY ?? 0

    prompt.x = interaction.x
    prompt.y = interaction.y - offsetY
    prompt.visible = isWithinInteractionRange(playerX, playerY, interaction)
  }
