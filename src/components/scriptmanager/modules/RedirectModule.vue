<script setup>
import { MODULE_LABELS }  from './moduleLabels';
import { useStore } from 'vuex';
import { inject, onMounted } from 'vue';

const props = defineProps(['branch']);
const store = useStore();

let browserLanguage = store.state.browserLanguage;

const highlightModule = inject('highlightModule');
const setTitle = (type, label) => MODULE_LABELS[browserLanguage][type].moduleTitle + ': ' + label;

const hover = () => {
    if(props.branch.RedirectIndex < MANDATORY_EXIT && props.branch.RedirectIndex > REDIRECT_EXIT) {
        highlightModule(props.branch.RedirectIndex);
    }
}

const setFrom = () => {
    let curFrom = store.getters.getScriptRedirectFrom();
    if (curFrom?.modnr !== -1) {
        store.commit('SET_MODULE_REDIRECT_FROM', { modnr: -1, exittype: '' });
    } else {
        store.commit('SET_MODULE_REDIRECT_FROM', { modnr: props.branch.ParentModule, exittype: props.branch.exitType });
    }
}

onMounted(() => {
    // should never be automatically in redirect mode
    // select buttons should be hidden, and only visible after setFrom()
    store.commit('SET_MODULE_REDIRECT_FROM', { modnr: -1, exittype: '' });
});

</script>

<template>
    <div class="scriptmodule__content redirect--js"
        @click.stop="setFrom()"
        :data-destination="branch.RedirectIndex"
        :data-modnr="branch.ParentModule"
        :data-exittype="branch.exitType"
        @mouseover="hover" data-e2e="redirect-module"
    >
        <!-- <span style="float: left; color:red">{{ branch.RedirectIndex }}</span> -->
        <span class="scriptmodule__icon scriptmodule__icon--add-exit child--js">&#xF9BD;</span>
        <span class="scriptmodule__name child--js description-text" v-html="setTitle(branch.ModuleNumber, branch.RedirectLabel)"></span>
    </div>
</template>

<style scoped>

.redirect {
    font-weight: bold;
    position: absolute;
    right: 40px;
    top: 10px;
    height: 18px;
    width: 18px;
}
</style>