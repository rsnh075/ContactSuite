import { defineConfig } from 'vite';
import vue              from '@vitejs/plugin-vue';
import { resolve, join }      from 'path';

// const { resolve }       = path;

export default defineConfig(({ command, mode }) => {
	if (command === 'serve') {
		return {
		// dev specific config
			plugins: [
				vue()
			],
			css: {
				preprocessorOptions: {
					scss: {
						charset: false,
					}
				}
			},
			resolve: {
				alias: {
				'@': resolve(__dirname, './src/'),
				},
			},
			root    : './',
			base    : './',
			build   : {
				emptyOutDir   : true,
				assetsDir     : '',
				sourcemap     : true,
				rollupOptions: {
					input: {
						main: resolve(__dirname, 'index.html'),
						'main-dashboard' : resolve(__dirname, 'dashboard.html')
					}
				}
			},
			server  : {
				host   : 'local.contactsuite.nl',
				port   : 3000,
				https  : { pfx : './contactsuite.pfx' },
				open   : true
			}
		}
	} else {
		// command === 'build'
		return {
		// build specific config
			plugins: [
				vue()
			],
			css: {
				preprocessorOptions: {
					scss: {
						charset: false,
					}
				}
			},
			resolve: {
				alias: {
				'@': resolve(__dirname, './src/'),
				},
			},
			root    : './',
			base    : '/contactsuite/',
			build   : {
				emptyOutDir		: true,
				assetsDir		: '',
				sourcemap		: false,
				manifest		: true,
				rollupOptions: {
					input: {
						main: resolve(__dirname, 'index.html'),
						'main-dashboard' : resolve(__dirname, 'dashboard.html')
					}
				}
			},
			server  : {
				host   : 'local.contactsuite.nl',
				port   : 3000,
				https  : { pfx : './contactsuite.pfx' },
				open   : true
			}
		}
	}
})
