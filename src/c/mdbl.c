#include <pebble.h>

int main(void) {
  Window *w = window_create();
  window_stack_push(w, true);

  /*
   * Hush's settings + signal engine need a large slot heap.
   * Error was: "Slot allocation: failed in fixed size heap".
   * When stack+slot+chunk exceeds 32 KB the pools are fixed (no growth),
   * so size for peak use. App RAM on emery/gabbro is ~122 KB total.
   */
  ModdableCreationRecord creation = {
    .recordSize = sizeof(ModdableCreationRecord),
    .stack = 6144,
    .slot = 55296,
    .chunk = 24576,
  };
  moddable_createMachine(&creation);

  window_destroy(w);
}
