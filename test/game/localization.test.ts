import { describe, expect, it } from "vitest"
import { createGameText } from "@/src/game/localization"

describe("game localization", () => {
  it("translates the manager greeting by locale", () => {
    expect(createGameText("en").npcGreeting({ id: "manager" })).toBe(
      "Chief: I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
    )

    expect(createGameText("es").npcGreeting({ id: "manager" })).toBe(
      "Chief: Tengo tanta hambre para el almuerzo que tal vez coma almendras cubiertas de chocolate con un whisky de 10 oz para acompaniarlas!",
    )
  })

  it("builds the manager dialog tree", () => {
    expect(createGameText("en").npcDialog({ id: "manager" })).toEqual({
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
            message: "Chief: Thank u bubby, treat me gentle!  *Gulp gulp gulp*",
          },
        },
      ],
    })
  })
})
