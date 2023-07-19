<template></template>

<script lang="ts">

declare const window            : any;

import { IPCCC }				from './../../ipccc/js/ipccc.js';
import { useStore }				from 'vuex';
import { onBeforeMount,
         inject,
         defineComponent
        }						from 'vue';

export default defineComponent({
    name : 'LogOut',
    setup() {
      	const showLoader:Function			= inject('showLoader'),
        		store:object | any			= useStore();

		let sipCall:object | any			= inject('sipCall');

		onBeforeMount(() => {
			store.state.settings ? showLoader(true, store.state.settings.agentPanel.logouttext) : showLoader(true);
			if(store.state.commands) {
				window.removeEventListener('beforeunload', window.bLoad, false);
				window.addEventListener('unload', window.uLoad, false);
				logOut();
			}
		})

		const logOut = () => {
			IPCCC.Logout()
			.then(() => {
				showLoader(false);
			})
			.catch((e) => {
				console.warn(e);
				showLoader(false);
				//load CS by lack of a better option.
				window.location.href = window.siteroot;
			});
		}

    }
})

</script>