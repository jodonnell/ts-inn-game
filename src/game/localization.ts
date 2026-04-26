import i18next from "i18next"
import type { RoomNpc } from "@/src/game/roomState"
import type { DialogNode } from "@/src/game/conversation"

const resources = {
  en: {
    translation: {
      conversation: {
        npcs: {
          manager: {
            dialog: {
              message:
                "Chief: I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
              choices: [
                {
                  label: "Maybe you should eat some vegetables and row!",
                  next: {
                    message: "Chief: Chiiiiiiiiii!  I'm 147.3 and proud of it!",
                  },
                },
                {
                  label: "Chief anything you do I am 100% in favor of!",
                  next: {
                    message:
                      "Chief: Thank u bubby, treat me gentle!  *Gulp gulp gulp*",
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  es: {
    translation: {
      conversation: {
        npcs: {
          manager: {
            dialog: {
              message:
                "Chief: Tengo tanta hambre para el almuerzo que tal vez coma almendras cubiertas de chocolate con un whisky de 10 oz para acompaniarlas!",
              choices: [
                {
                  label: "¡Quizás deberías comer algunas verduras y remar!",
                  next: {
                    message:
                      "Chief: ¡Jefffffffff! ¡Estoy en 147.3 y orgulloso de ello!",
                  },
                },
                {
                  label: "¡Jefe, cualquier cosa que hagas, estoy 100% a favor!",
                  next: {
                    message:
                      "Chief: Gracias, bubby, trátame con suavidad. *Glup glup glup*",
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
} as const

export type GameLocale = keyof typeof resources

export const getGameLocale = (
  language: string | null | undefined,
): GameLocale => {
  const locale = language?.split("-")[0]
  return locale === "es" ? "es" : "en"
}

export type GameText = {
  npcDialog: (npc: Pick<RoomNpc, "id">) => DialogNode
  npcGreeting: (npc: Pick<RoomNpc, "id">) => string
  npcResponses: (npc: Pick<RoomNpc, "id">) => string[]
}

export const createGameText = (locale: GameLocale = "en"): GameText => {
  const i18n = i18next.createInstance()

  void i18n.init({
    fallbackLng: "en",
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
    lng: locale,
    resources,
  })

  const npcDialog = (npc: Pick<RoomNpc, "id">) =>
    i18n.t(`conversation.npcs.${npc.id}.dialog`, {
      defaultValue: i18n.t("conversation.npcs.manager.dialog", {
        returnObjects: true,
      }),
      returnObjects: true,
    }) as DialogNode

  return {
    npcDialog,
    npcGreeting: (npc) => npcDialog(npc).message,
    npcResponses: (npc) =>
      npcDialog(npc).choices?.map((choice) => choice.label) ?? [],
  }
}
