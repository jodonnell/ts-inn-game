# Architecture & Decisions

This is the single source of truth for both architecture and key technical decisions.

Status markers:

- `[DECIDED]` Chosen and should be implemented as-is
- `[PARTIAL]` Direction is chosen but details still needed
- `[OUTSTANDING]` Not chosen yet; avoid building irreversible dependencies

## Current decisions (summary)

- `[DECIDED]` Resolution/scaling: base 640×360 safe frame, integer scaling, nearest filtering, letterbox, UI in safe-frame space, camera clamp uses safe frame.
- `[DECIDED]` Determinism scope: simulation must be deterministic; rendering-only VFX/audio may vary but must not affect simulation state.
- `[PARTIAL]` RNG: one saved/loaded `worldSeed`, per-system streams derived from it; no `Math.random()` in simulation. (Exact PRNG implementation still `[OUTSTANDING]`.)
- `[DECIDED]` Items in inventories: `ItemStack`-style data records, not ECS entities; ECS entities only for physical world items.
- `[DECIDED]` Networking (future): authoritative server runs a fixed-tick bitECS world; clients send commands and receive snapshots/deltas (no lockstep/rollback).

## Outstanding decisions (early + hard-to-change)

### 1) Resolution/scaling and pixel-art policy

- `[DECIDED]` Base resolution: 640×360
- `[DECIDED]` Scaling: integer
- `[DECIDED]` Filtering: nearest
- `[DECIDED]` Letterbox: yes
- `[DECIDED]` UI coordinate space: base resolution (“safe frame”)
- `[DECIDED]` Camera clamp uses safe frame size, not window size

### 2) Determinism boundaries and randomness

- `[DECIDED]` Determinism scope: simulation only
- `[DECIDED]` PRNG policy: one `worldSeed` with per-system streams; no `Math.random()` in simulation
- `[OUTSTANDING]` Floating point policy: float vs fixed-point for simulation
- `[OUTSTANDING]` Replay/debug policy: whether to record input streams + seed for replays

### 3) State/events model inside ECS

- `[PARTIAL]` We distinguish commands (intent) from events (outcomes)
  - Commands written by input/network systems
  - Events written by simulation systems
  - Both are ECS components
  - Both live for one simulation tick
  - They are never serialized
  - Systems must not call other systems directly
- `[OUTSTANDING]` Events mechanism: transient event components cleared each tick vs event queue/ring buffer
- `[OUTSTANDING]` Side-effects policy: which systems may spawn/despawn entities, play audio, enqueue UI, etc.

### 4) Scene/world lifecycle and ownership

- `[OUTSTANDING]` Loading unit: location/map vs chunks vs single persistent overworld
- `[OUTSTANDING]` Entity ownership across transitions (persist player; destroy map entities; global singletons, etc.)
- `[OUTSTANDING]` Streaming vs hard loads (loading screens? background streaming?)

### 5) Data-driven content contract

- `[OUTSTANDING]` Validation strategy: JSON schema / zod parsing at load time vs build-time validation
- `[OUTSTANDING]` Stable IDs policy: string IDs everywhere vs numeric registries
- `[OUTSTANDING]` Localization stance: decide if strings are keys from day 1 (even if English-only now)

### 6) Save system details beyond “JSON”

- `[PARTIAL]` Save format: JSON (one file per save game)
- `[DECIDED]` Canonical model: serialize only gameplay state (never rendering/cache state)
- `[OUTSTANDING]` Stable entity identity: persistent IDs across loads (NPC “abby”, chest “farm_01_chest_02”, etc.)
- `[OUTSTANDING]` Partial saves: one blob vs separate sections (world/player/options)
- `[OUTSTANDING]` Compression/encryption policy (Steam Cloud friendliness, tamper tolerance)

### 7) Inventory/items: entities vs pure data

- `[DECIDED]` Inventory items are data records (`ItemStack`), not ECS entities

### 8) Tile/world representation details

- `[OUTSTANDING]` Tile layers list (ground/tilled/watered/crop/object/decals/etc.)
- `[OUTSTANDING]` “What’s on this tile” source of truth: tilemap structure vs ECS queries
- `[OUTSTANDING]` Pathfinding grid: source of truth and dynamic update strategy

### 9) Interaction targeting rules

- `[OUTSTANDING]` Target selection: front-tile, cone, overlap radius, cursor, hybrid
- `[OUTSTANDING]` Priority rules: talk > pickup > use machine > open door, etc.
- `[OUTSTANDING]` Tool semantics: tools act on tile, entity, or both

### 10) Animation/state machine ownership

- `[OUTSTANDING]` State machine ownership: pure data components + advancing system vs external animator objects
- `[OUTSTANDING]` Animation events (“footstep”, “hit frame”) representation as data events

### 11) UI architecture contract

- `[OUTSTANDING]` UI approach inside Pixi: pure Pixi UI vs immediate-mode vs DOM/React overlay
- `[OUTSTANDING]` UI reads state: direct ECS reads vs view-model snapshot
- `[OUTSTANDING]` Input routing rules: when UI captures vs gameplay

### 12) Performance budget strategy

- `[OUTSTANDING]` Target entity counts (NPCs, particles, crops, placed objects)
- `[OUTSTANDING]` Allocation policy (pools for transient entities; avoid GC spikes)
- `[OUTSTANDING]` Asset loading strategy (manifest + refcount + warm caches)

### 13) Platform integration decisions (Electron + Steam)

- `[OUTSTANDING]` Save paths, Steam Cloud, achievements, controllers (Steam Input vs Gamepad API)
- `[OUTSTANDING]` Crash reporting/log capture strategy
- `[OUTSTANDING]` Update/patch strategy for content (bundled vs downloadable)

### 14) Multiplayer “compatibility seams” beyond authoritative server

- `[OUTSTANDING]` Snapshot format: full vs delta; binary vs JSON
- `[OUTSTANDING]` Interest management: AOI radius/chunks (even if later)
- `[OUTSTANDING]` Client prediction: none now, but define allowed local simulation (usually interpolation only)

### 15) Versioning strategy for everything

- `[OUTSTANDING]` Content vs code vs save versioning conventions
- `[OUTSTANDING]` Migration tooling approach (explicit functions, declarative transforms, etc.)

---

### 1. High-level goals and constraints

* Target platform: browser and electron so can be distrubted to steam.  should have controller support.  can support many screen sizes.
* Target FPS: 60fps
* Start single player but would love to add multiplayer.  So should design the game so that isn't hard to add later.
* Resolution/scaling policy:
  * Base resolution (“safe frame”): 640×360
  * Scaling: integer
  * Filtering: nearest
  * Letterbox: yes
  * Camera clamp uses safe frame size (not window size)

---

### 2. Tech stack + project layout

You already chose:

* Language: TypeScript
* Rendering: Pixi.js
* Audio: Howler
* ECS: bitecs

Decide and document:

* Bundler/build: Vite.

* Project structure, e.g.:

  * `src/engine/` (generic reusable engine code)
  * `src/gameplay/` (game-specific logic, content)
  * `src/assets/` or `public/assets/`
  * `src/systems/`, `src/components/`, `src/scenes/`
  * `src/tools/` (content loaders, editors, etc.)

* Code style: ESLint/Prettier config, TS strictness (`strict: true`?).

---

### 3. ECS (bitECS) design

Decisions the agent must not guess:

* How many worlds?

  * One global `world` i think
* Entity ID management:

  * I think for a lot of components it makes sense to have a dedicated component creator like a PlayerFactory in the src/component-factory folder
* Component definitions:

  * `src/components/*.
  * Naming conventions: `Position`, `Velocity`, `Sprite`, `CropGrowth`, `NPCSchedule`, etc.
  * Rules: pure data only, no methods, SoA-friendly types.
* Systems:

  * How systems are grouped (movement, interaction, AI, rendering sync, audio, etc.).
  * System order (critical for determinism): e.g.

    1. Input
    2. AI/logic
    3. Physics/movement
    4. Interaction/collision
    5. Animation/state machines
    6. Rendering sync
    7. Audio triggers
  * Where to register systems and how: a single `registerSystems(world)` function, or scene-specific registration.
* Queries and tags:

  * Conventions for “tag components” (empty components like `IsPlayer`, `IsNPC`).

---

### 4. Game loop and time

* Single main loop or separate simulation / render loops?

  * fixed timestep simulation + variable render (i.e., “separate sim/render”).
* Time source:

  * pass `dt` to each system?
* Pausing and time scaling:

  * How pause works: (simulation stops, UI continues).
  * Time-of-day speed; in-game day length.
* Calendars and schedule:

  * How “days”, “seasons”, “years” are represented and updated.

---

### 5. Pixi.js integration

Specify exactly how ECS talks to Pixi:

* Pixi root and layers:

---

## Camera System

### Overview

The game uses a single Pixi container (`worldContainer`) to represent all world-space visuals. The camera is implemented by modifying the transform of this container based on a camera entity stored in the ECS.

### Scene Graph

```
app.stage
 ├─ worldContainer     // affected by camera
 └─ uiContainer        // screen-space UI, not moved by camera
```

### Camera Component

A single entity has the `Camera` component:

```ts
Camera: {
  x: f32,    // world-space center
  y: f32,
  zoom: f32  // default 1.0
}
```

### Follow Logic

A `cameraFollowSystem` runs every simulation tick:

* Reads the player’s `Position`.
* Updates `Camera.x` and `Camera.y` to follow the player (optionally smoothed).
* Clamps camera center to map bounds, accounting for viewport size and zoom.

### Applying the Camera

A `cameraRenderSystem` runs during the render phase:

```
worldContainer.scale.set(zoom, zoom)
worldContainer.position.set(
  viewWidth  / 2 - Camera.x * zoom,
  viewHeight / 2 - Camera.y * zoom
)
```

This centers the camera entity at the screen center.

### Bounds

Camera center is clamped so the camera never reveals outside the world:

```
halfViewW = viewWidth  / (2 * zoom)
halfViewH = viewHeight / (2 * zoom)

Camera.x = clamp(Camera.x, halfViewW, mapWidth  - halfViewW)
Camera.y = clamp(Camera.y, halfViewH, mapHeight - halfViewH)
```

### Effects (Optional)

Additional components (e.g., `CameraEffect.offsetX/Y`) may modify the camera for shake, cutscene panning, or zoom transitions. These offsets are applied on top of the base camera center in `cameraRenderSystem`.

---



  * Main stage + layers: background, world, entities, UI, overlays.
* Render components:

  * e.g. `Sprite` component holds an entity’s reference/index to a Pixi `Sprite` or to an `atlasId + frameName` that is resolved in a render system.
Separation of ECS and Pixi

ECS components store pure data only; they never hold Pixi instances.

Pixi DisplayObjects (sprites, containers, etc.) live in a render layer managed by render systems.

This keeps the simulation engine (bitECS) independent of the rendering library and easier to test, replace, or run headless (e.g., server, replay tools).
* Coordinate system:

Concept

Define everything in world space:

Positions, movement, tiles, camera, etc. live in a single coordinate system.

Screen resolution (actual canvas size) can change:

You adapt by scaling the view, not by changing world units.

That gives you:

Same gameplay behavior on all devices.

Different amounts of the world visible depending on screen size and chosen zoom.

For a Stardew-like, simplest is:

World units = “world pixels”.

1 tile = TILE_SIZE world pixels (e.g. 16 or 32).

Origin (0,0) at the top-left of the world.

All Position.x/y are in world pixels from that origin.

The camera plus scaling decide how much of that world fits on screen.
* UI:
  * UI using Pixi
  
---

### 6. Howler / audio architecture

* Audio resource mapping:

  * How IDs map to audio files, e.g. `AudioId = "step_grass" | "door_open" | ...`.
  * Asset manifest file for sounds/music.
* Systems:

  * An `AudioSystem` that watches ECS state or events and plays sounds.
  * Categories: SFX vs music vs ambient, with per-category volume control.
* Music behavior:

  * How background tracks change by time-of-day, location, weather, etc.
* Volume and settings:

  * Global settings object + persistence (localStorage in save file, etc.).

---

### 7. Input and interaction

* Input abstraction:

  * Central `InputService` that normalizes keyboard/mouse/gamepad to high-level actions:

    * `MoveUp`, `MoveDown`, `Interact`, `UseTool`, `OpenMenu`, etc.
* ECS integration:

  * Input system that writes to components (e.g., `InputState` on the player entity) instead of game logic systems reading DOM events directly.
* Remapping:

  * Are controls configurable? If yes, where is the mapping defined and saved?

---

### 8. World, tiles, and scenes

For a Stardew-like, this is critical:

* World representation:

  * Tile-based? Grid size? Multiple maps? Indoor/outdoor.
  * Data formats: Tiled maps (.tmx/.json)
* Collisions:

  * How collision data is stored per tile / per entity.
  * Which components mark collidable objects (`Collider`, `Solid`).
* Scenes / locations:

  * High-level “scene” or “location” abstraction (farm, town, mines, house interiors).
  * Scene loading/unloading flow:

    * How to dispose of entities/assets when leaving a scene.
* Triggers:

  * How to represent warp tiles, cutscene triggers, interaction hotspots.

---

### 9. Core gameplay systems (high-level decisions)

You don’t need full design here, but at least outline:

* Player character:

  * Components: stats, inventory, tool, animation state, interaction radius.
* Farming/crops:

  * How crop growth is represented (component with growth stage, days watered, etc.).
  * How tiles know what’s on them (seed, crop, watered state).
* Time of day & seasons:

  * Mapping from in-game time to visuals/audio (lighting, music).
* NPCs:

  * Schedule representation (per-NPC schedule data, pathing).
  * Dialogue system data format and how it plugs into ECS/UI.
* Items & inventory:

  * Items as data definitions (ID, icon, stack size, type).
  * Inventory storage: array of item stacks vs ECS entities for items.
* Interaction model:

  * How “press interact” becomes “talk”, “open chest”, “till soil”, etc.
  * Use of raycast / front tile / overlap queries.

You don’t have to detail mechanics entirely, but you should at least define where the logic will live (which systems, which data).

---

### 10. Save/load and persistence

* Save format:

  * JSON.  one file per save game.
* Serialization strategy:

  * Serialize ECS state directly
  * Versioning and migrations (include a save version and migration plan).

---

### 11. Asset pipeline and content authoring

* Sprites:

  * Atlas format (TexturePacker, Aseprite’s JSON, etc.).
  * Naming conventions for sprites/animations.
* Maps:

  * Tool (e.g., Tiled); folder layout; how to reference maps in code.
* Data:

  * Items, crops, NPCs, dialogue, events stored as JSON/TS configs.
  * ID conventions and where they are defined (`src/content/*`).

---

### 12. Configuration and globals

* Central config:

  * Where global constants live (tile size, run speed, day length, etc.).
* Environment:

  * Dev vs production flags, debug overlays on/off.

---

### 13. Error handling, logging, and debugging

* Logging strategy:

  * Simple console logging vs small logger utility with levels.
* Debug tools:

  * Debug overlay (FPS, entity count, queries).
  * Cheats / debug commands (teleport, spawn item, set time).
* Runtime checks:

  * Invariants the agent can assert in development build (e.g., “no entity should have both `Solid` and `Ghost` components”).

---

### 14. Testing strategy

* Unit tests:

  * What kinds of systems or pure functions should have tests.
* Integration tests:

  * Simulate a few frames, ensure crop grows, time advances, etc.
* Separation of logic from rendering:

  * Make core gameplay testable without Pixi.

---

### 15. Extension guidelines for the coding agent

Make this very explicit for the agent:

* How to add a new component:

  * File location, naming, shape, and registration pattern.
* How to add a new system:

  * Where to put it, how to hook it into the system pipeline, how to document inputs/outputs.
* How to add new content:

  * Steps to add a new item, NPC, map, or crop.
* Coding conventions:

  * Function naming, file naming, preferred patterns (pure functions where possible, no side effects in components, etc.).

---

If you want, next step I can take this and turn it into a skeleton architecture doc with headings and TODO slots that you can fill in, specifically tailored to your Pixi + Howler + bitECS stack.


## Networking
Networking model:
Use an authoritative server. The server runs a single bitECS world and simulates the game in fixed ticks. Clients send high-level player commands to the server and receive state snapshots/deltas in return.

Determinism policy:
The server simulation should be locally deterministic given the same inputs and PRNG seed, to simplify debugging and replays, but we do not rely on strict lockstep determinism between clients. We do not use lockstep or rollback netcode.
