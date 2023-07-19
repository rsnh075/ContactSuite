<script lang="ts">
export default {
    name: "CaseManagement",
    components: { ChevronDown, ChevronUp }
}
</script>
<script setup lang="ts">
/**
 *
 * Call history
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 10-12-2021
 * @modified
 *
 * @todo
 * Arrow btn is not displayed
 */

import { useStore }     from 'vuex';
import { inject, ref, watch}	from 'vue';
import { IPCCC } 	    from '../../../ipccc/js/ipccc';
import BoxProps, { ModalType } from '../../../types/BoxProps';
import { ChevronDown, ChevronUp, Refresh }      from 'mdue';

const store:object | any	= useStore(),
	toggleLoader:Function	= inject('toggleLoader'),
    casemanagementiframe    = ref(null),
    showModalDialog         = inject('showModalDialog') as Function,
    showRefresh             = ref(false),
    caseManagementUrl		= ref(`${IPCCC.Settings.ContactHistoryUrl}?sessionId=${IPCCC.LoginSession.SessionId}&extCompanyId=${IPCCC.LoginSession.Details.ApiIdentity}&extUserId=${IPCCC.LoginSession.Details.UserId}&contactMomentId=-1&company=${IPCCC.LoginSession.CompanyCode}&username=${encodeURIComponent(IPCCC.LoginSession.Details.FullName)}`);

toggleLoader(false);

let disconnectedTime;

watch(() => store.getters.getMessagingEvent(), evt => {
    if (
        evt && evt.type == 'ContactHistory' && evt.data == 'Disconnected' &&
        (!disconnectedTime || new Date().getTime() - disconnectedTime > 900000)
    ) {
        const boxProps = new BoxProps(ModalType.Alert, store.state.settings.alertheader, store.state.settings.casemanagementerrortxt);
        disconnectedTime = new Date().getTime();
        showModalDialog(boxProps);
        refreshCM();
    }
}, {immediate:true})

//Hidden feature start
const refreshCM = () => {
    showRefresh.value = false;
    caseManagementUrl.value = 'about:blank';
    setTimeout(() => {
        caseManagementUrl.value = `${IPCCC.Settings.ContactHistoryUrl}?sessionId=${IPCCC.LoginSession.SessionId}&extCompanyId=${IPCCC.LoginSession.Details.ApiIdentity}&extUserId=${IPCCC.LoginSession.Details.UserId}&contactMomentId=-1&company=${IPCCC.LoginSession.CompanyCode}&username=${encodeURIComponent(IPCCC.LoginSession.Details.FullName)}`;
    }, 200);
}

function openRefresh() {
    showRefresh.value = true;
}

function closeRefresh() {
    showRefresh.value = false;
}

const props = defineProps({
    isactive: {
        type: Boolean,
        default: false
    }
});

//Hidden feature end

</script>

<template>
	<section class="case-management-wrapper" data-e2e="case-management">
		<div class="interaction__cm">
            <div :class="['refresh-wrapper', {'refresh-wrapper--open' : showRefresh}]">
                <div title="Refresh CM" class="case-management-refresh" @click="refreshCM"><Refresh /></div>
                <ChevronDown v-if="!showRefresh" class="chevron-refresh" @click="openRefresh" />
                <ChevronUp v-if="showRefresh" class="chevron-refresh" @click="closeRefresh" />
            </div>
			<iframe ref="casemanagementiframe" allow="clipboard-write" :src="caseManagementUrl"></iframe>
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.case-management-wrapper,
.interaction__cm {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
    .refresh-wrapper {
        position: absolute;
        display: flex;
        flex-direction: column;
        height: 80px;
        background-color: #4bb24f;
        border-radius: 3px;
        left: 50%;
        top: -56px;
        transform: translate(-50%);
        transition: top .15s ease-in-out;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .15);
        &--open {
            top: 0;
        }
        .case-management-refresh {
            flex: 1;
            color: globals.$color-white;
            background-color: #0090e3;
            height: 56px;
            cursor: pointer;
            margin: 0;
            padding: 0 16px;
            font-size: 24px;
            line-height: 60px;
            text-align: center;
        }
        .chevron-refresh {
            margin: auto;
            font-size: 2rem;
            color: globals.$color-white;
            cursor: pointer;
            width: 100%;
        }
    }
}

</style>