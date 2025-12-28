import "./style.css"
import { startGame } from "./src/game/bootstrap"

void startGame().catch((error) => {
  // Surface boot errors without crashing silently.
  console.error("Failed to start game:", error)
})
