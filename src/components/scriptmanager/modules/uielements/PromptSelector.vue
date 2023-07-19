<script setup lang="ts">
import { onBeforeMount, onUpdated, ref } from 'vue';
import { useStore } from 'vuex';
import uiComponent_7 from '../modulecomponents/UiFixedDropdown.vue';
import PromptVarLookup from '../modulecomponents/UiPromptVarLookUp.vue';
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    params: { type: Object, required: true },
    modelValue: { type: Object, required: true},
    selectedcustomerid: { required: false }
});

const changePromptVal = (id: any) => {
    props.modelValue.VariableName = '';
    props.modelValue.PromptId = id;
    emit('update:modelValue', props.modelValue);
};

const changeVarVal = (val: string) => {
    props.modelValue.PromptId = -1;
    props.modelValue.VariableName = val;
    emit('update:modelValue', props.modelValue);
}

const changeTypeVal = (text: string) => {
    props.modelValue.PromptType = store.state.settings.scriptmanager.prompttypes.indexOf(text);
    emit('update:modelValue', props.modelValue);
};

const promptParams = ref();
const typeParams = ref();
const store = useStore();
onBeforeMount(() => {
    setValues();
})

const setValues = () => {
    // use copies, we're changing values in parent component
    promptParams.value = JSON.parse(JSON.stringify(props.params)); // use a copy
    promptParams.value.LookupValue = 'Id';
    if (props.modelValue.PromptId !== -1) {
        promptParams.value.CurrentValue = props.modelValue.PromptId;
        promptParams.value.IsVariable = false;
    } else {
        promptParams.value.CurrentValue = props.modelValue.VariableName;
        promptParams.value.IsVariable = true;
    }

    typeParams.value = JSON.parse(JSON.stringify(props.params)); // use a copy
    typeParams.value.SelectableValues = store.state.settings.scriptmanager.prompttypes; // fixed list, indexes correspond with back end
    typeParams.value.LookupValue = 'Id';
    typeParams.value.CurrentValue = typeParams.value.SelectableValues[props.modelValue.PromptType];
}

</script>

<template>
    <div class="selector-wrap">
        <div class="btn">
            <PromptVarLookup
                :params="promptParams"
                @varvalue="changeVarVal($event)"
                @promptvalue="changePromptVal($event)"
                :showlabel="false"
                :selectedcustomerid="selectedcustomerid" />
        </div>
        <div class="type">
            <uiComponent_7
                :params="typeParams"
                @propvalue="changeTypeVal($event)"
                :showlabel="false"
                :selectedcustomerid="selectedcustomerid" />
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "@/scss/includes/globals";
.selector-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 3px;
}
.selector-wrap div {
    overflow: hidden;
}
.remove {
    text-align: center;
}
</style>