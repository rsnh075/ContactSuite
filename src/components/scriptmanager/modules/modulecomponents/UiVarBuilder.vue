<script lang="ts">
// VarBuilder = 9
// Also VarBuilder = 16, which uses slight modifications, but is otherwise the same
export default {
    name: 'uiComponent_9' // and 16, which hides the $-system vars
};
</script>
<script setup lang="ts">
import PromptVarLookup from '../modulecomponents/UiPromptVarLookUp.vue';

const emit = defineEmits(['propchanged']);
const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
// const uid = ref('_' + Math.random().toString(32).substring(2, 11));

const changeVarVal = (val: string) => {
    props.params.CurrentValue = val;
    emit('propchanged');
};
</script>

<template>
    <div class="scriptform__textarea" data-e2e="ui-var-builder">
        <PromptVarLookup
            :params="params"
            :showprompt="false"
            :showlabel="showlabel"
            @varvalue="changeVarVal($event)"
            :hidesystemvars="params.UIElement === 16"
            :selectedcustomerid="selectedcustomerid"/>
    </div>
</template>

<style scoped>
.scriptform__textarea {
    display: flex;
    align-items: flex-end;
}
</style>
