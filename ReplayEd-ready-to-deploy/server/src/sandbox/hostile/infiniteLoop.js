/**
 * Hostile Test Sample 1: Infinite Loop Attack
 *
 * This script attempts to monopolize CPU resources indefinitely.
 * The sandbox enforces a 5-second timeout and forcefully terminates the process,
 * reporting timedOut: true and exitCode: 124.
 */

console.log('[Hostile Test 1] Initiating infinite CPU loop...');
let counter = 0;
while (true) {
  counter++;
}
