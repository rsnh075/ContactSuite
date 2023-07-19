<script setup>
import { EXIT_LABELS }  from './exitLabels';
import { inject, ref } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['branch']);
const store = useStore();
const showModuleMenu = inject('showModuleMenu');
let browserLanguage = store.state.browserLanguage;

const setTitle = (type, typeAlt) => {
    let _type = type !== typeAlt ? typeAlt : type;
    return EXIT_LABELS[browserLanguage][_type] ? EXIT_LABELS[browserLanguage][_type].label : '-';
}

const scrEl = ref(null);

</script>

<template>
    <div
        ref="scrEl"
        class="scriptmodule__content scriptmodule__content--mandatory openmodulemenu--js"
        @click.stop="showModuleMenu(scrEl, branch.ParentModule, branch.exitType,branch.exitTypeAlt)"
        :data-modnr="branch.ParentModule"
        :data-exittype="branch.exitType"
        :data-exittype-alt="branch.exitTypeAlt"
        data-e2e="mandatory-module"
    >
        <span class="scriptmodule__icon scriptmodule__icon--add-exit child--js">&#xF419</span>
        <span class="scriptmodule__name child--js description-text">{{ setTitle(branch.exitType, branch.exitTypeAlt) }}</span>
    </div>
</template>