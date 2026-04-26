import { Container, Graphics, Text } from "pixi.js"
import type { GameWorld } from "@/src/ecs/world"
import type { ConversationState } from "@/src/game/conversation"

export type ConversationDialogLike = {
  x: number
  y: number
  text: string
  visible: boolean
  container: Container
  layout?: () => void
}

export type ConversationDialogStore = {
  dialog: ConversationDialogLike | null
  createDialog: () => ConversationDialogLike
  addDialog: (dialog: ConversationDialogLike) => void
}

const DIALOG_X = 16
const DIALOG_Y = 252
const DIALOG_WIDTH = 608
const DIALOG_HEIGHT = 88
const DIALOG_PADDING = 16

export const createConversationDialogStore = (
  container: Container,
): ConversationDialogStore => ({
  dialog: null,
  createDialog: () => {
    const container = new Container()
    const border = new Graphics()
    const background = new Graphics()
    const label = new Text({
      text: "",
      style: {
        fill: "#ffffff",
        fontFamily: "monospace",
        fontSize: 18,
        wordWrap: true,
        wordWrapWidth: DIALOG_WIDTH - DIALOG_PADDING * 2,
      },
    })
    label.x = DIALOG_PADDING
    label.y = DIALOG_PADDING
    container.addChild(border)
    container.addChild(background)
    container.addChild(label)

    const layout = () => {
      border.clear()
      border.rect(0, 0, DIALOG_WIDTH, DIALOG_HEIGHT).fill(0xf5f0dc)
      background.clear()
      background.rect(4, 4, DIALOG_WIDTH - 8, DIALOG_HEIGHT - 8).fill(0x17263a)
    }

    layout()

    return {
      get x() {
        return container.x
      },
      set x(value) {
        container.x = value
      },
      get y() {
        return container.y
      },
      set y(value) {
        container.y = value
      },
      get text() {
        return label.text
      },
      set text(value) {
        label.text = value
      },
      get visible() {
        return container.visible
      },
      set visible(value) {
        container.visible = value
      },
      container,
      layout,
    }
  },
  addDialog: (dialog) => {
    container.addChild(dialog.container)
  },
})

const ensureDialog = (
  store: ConversationDialogStore,
): ConversationDialogLike => {
  if (store.dialog) return store.dialog
  const dialog = store.createDialog()
  store.dialog = dialog
  store.addDialog(dialog)
  return dialog
}

export const createConversationDialogSystem =
  (state: ConversationState, store: ConversationDialogStore) =>
  (_world: GameWorld, _dt: number) => {
    void _world
    void _dt
    const dialog = ensureDialog(store)
    if (!state.isOpen) {
      dialog.visible = false
      return
    }

    dialog.x = DIALOG_X
    dialog.y = DIALOG_Y
    dialog.text = state.message
    dialog.visible = true
    dialog.layout?.()
  }
