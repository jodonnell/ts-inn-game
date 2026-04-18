# Day 1 Vertical Slice

## Purpose

This slice should function as both a demo and the real first day of the game.

It should:

- introduce the inn and the manager's role
- teach the core loop through play
- create abnormal but legible pressure
- end with the sense that the inn is manageable, but fragile

## Opening Sequence

The game opens at 5:32 AM with the front desk bell ringing.

It is Friday the 13th, and a storm hit overnight.

The manager wakes in their bedroom, which opens directly into the front desk area. Before getting up, they see that one employee has called in sick and the other has quit by text with no notice.

When the player reaches the desk, a soaked walk-in guest is waiting for a room.

This should immediately establish that the manager is always close to duty, that the inn is already in motion before the player is ready, and that this morning is worse than normal.

## First Task

The first task should be uninterrupted.

The first guest does not have a reservation. They need a room immediately because of the storm.

The nicest room would normally be the obvious choice, but it has developed a leak. A lower-quality room is ready now.

This creates the first meaningful decision without introducing full interruption pressure yet.

## First Decision

Likely options:

- assign the lower-quality ready room immediately
- inspect the leaking room and decide whether it can still be used
- turn the guest away if no acceptable room can be offered

The important design idea is that guest service, room state, and facilities problems are entangled from the start.

## First Escalation

The leak should be the first concrete sign that the day is going wrong operationally, not just socially.

The player may need to:

- inspect the damaged room
- contain the leak with buckets, towels, or a quick fix
- mark the room unavailable or lower its quality
- return to the desk and explain the situation to the guest

This teaches that room availability is not the same as room readiness or room quality.

The walk-in guest should also track mud and water into the inn. Muddy footprints in the lobby or hall are a good first cleanup problem because they are small, obvious, and directly caused by serving the guest during the storm.

## What This Opening Teaches

- how to move from the bedroom to the desk
- how check-in works for a walk-in guest
- that rooms can have different quality levels
- that room state matters
- that storms and facility failures can change what rooms are actually sellable
- that short staffing pushes manual labor back onto the manager
- that helping one guest can immediately create cleanup elsewhere
- that the manager is personally responsible for unresolved work

## Tutorial Philosophy

The tutorial should follow a "Mega Man X" style approach.

That means:

- minimal explicit instruction
- the player learns by acting inside believable situations
- each early problem introduces one new layer of play
- the game trusts the player to infer meaning from consequences

## Constraints For Day 1

- The first task should stay simple and readable.
- The first lesson should be judgment under bad conditions, not pure chaos.
- Early consequences should be immediate and physical.
- Interruption pressure should arrive after the player understands the basic shape of the job.
