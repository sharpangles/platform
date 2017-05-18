import { TypescriptCompiler } from './src/typescript/typescript_compiler';
import { ContextFactory } from './src/tracking/contexts/context_factory';

new ContextFactory().buildAsync(process.argv[2] === 'watch' ? undefined : t => t instanceof TypescriptCompiler);
