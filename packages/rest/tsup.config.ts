import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
	entry: ['src/agnostic.ts', 'src/web.ts', 'src/strategies/*.ts'],
	esbuildPlugins: [esbuildPluginVersionInjector()],
});
