/**
 * A local build for the library needed before we have a cli.
 */

let LibraryTracker = require('./__artifacts/local/src/tracking/library_tracker').LibraryTracker;

new LibraryTracker().runAsync();
