**Title:** Hush — a quiet poster watchface that only speaks up when something matters (PT2 / Round 2)

---

Built a watchface called **Hush** for Pebble Time 2 and Round 2.

Most faces either dump a dashboard on your wrist or go so minimal they feel unfinished. Hush tries a third lane: the resting face is a small poster (big hours, minutes in a color chip, a mood word like AFTERNOON / GOLDEN / NIGHT), and the accent color shifts through the day. The side stripe and bottom rail show day/hour progress so it still feels alive when nothing’s wrong.

When something crosses a threshold you set — calendar, rain, step pace, battery, sun, or a second timezone overlap — colored pips show up. Flick for a short detail card, then it goes quiet again.

Battery was a hard constraint: minute ticks only, cached weather/ICS, no live HR on the face, low-power mode when the battery is low.

**Links**
- GitHub: https://github.com/TechJeeper/hush
- CloudPebble zip: https://github.com/TechJeeper/hush/blob/main/dist/hush-cloudpebble.zip
- Import in CloudPebble: https://cloudpebble.repebble.com/ide/import/github/TechJeeper/hush

Would love feedback on the calm layout vs the signal behavior — still tuning how “quiet” vs “useful” it should feel.
