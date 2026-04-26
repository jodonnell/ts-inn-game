import { describe, expect, it } from "vitest"
import { createGameText } from "@/src/game/localization"

describe("game localization", () => {
  it("translates the manager greeting by locale", () => {
    expect(createGameText("en").npcGreeting({ id: "manager" })).toBe(
      "Hi, my name is Chief!  I'm so hungry for lunch maybe I'll eat some chocolate covered almonds with a 10oz whiskey to wash it down!",
    )

    expect(createGameText("es").npcGreeting({ id: "manager" })).toBe(
      "Hola, me llamo Chief! Tengo tanta hambre para el almuerzo que tal vez coma almendras cubiertas de chocolate con un whisky de 10 oz para acompaniarlas!",
    )
  })
})
