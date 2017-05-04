import * as path from 'path';
import { LibraryTracker } from './library_tracker';

let library = process.cwd().substr(process.cwd().lastIndexOf(path.sep) + 1);
new LibraryTracker('@sharpangles', library);

