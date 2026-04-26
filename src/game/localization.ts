import i18next from "i18next"
import type { RoomNpc } from "@/src/game/roomState"

const resources = {
  en: {
    translation: {
      conversation: {
        npcs: {
          manager: {
            greeting:
              "Chief: I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
            responses: [
              "Maybe you should eat some vegetables and row!",
              "Chief anything you do I am 100% in favor of!",
            ],
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
            greeting:
              "Chief: Tengo tanta hambre para el almuerzo que tal vez coma almendras cubiertas de chocolate con un whisky de 10 oz para acompaniarlas!",
            responses: [
              "¡Quizás deberías comer algunas verduras y remar!",
              "¡Jefe, cualquier cosa que hagas, estoy 100% a favor!",
            ],
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

  return {
    npcGreeting: (npc) =>
      i18n.t(`conversation.npcs.${npc.id}.greeting`, {
        defaultValue: i18n.t("conversation.npcs.manager.greeting"),
      }),
    npcResponses: (npc) =>
      i18n.t(`conversation.npcs.${npc.id}.responses`, {
        defaultValue: i18n.t("conversation.npcs.manager.responses", {
          returnObjects: true,
        }),
        returnObjects: true,
      }),
  }
}
