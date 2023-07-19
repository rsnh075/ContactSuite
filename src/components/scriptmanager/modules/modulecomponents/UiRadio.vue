<script lang="ts">
// Radio: buttons horizontal
export default {
    name: 'uiComponent_13'
};
</script>
<script setup lang="ts">
import {onMounted, ref, computed, watch, nextTick} from 'vue';

const emit = defineEmits(['propchanged']);
const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true},
    propsopen: {type: Boolean, required: true}
});
const radioValue = ref();
watch(
    () => props.propsopen,
    (isOpen) => {
        if (isOpen) {
            radioValue.value = '-99999'; // needed for close and reopen props
            nextTick(() => {          // also needed
                radioValue.value = props.params.CurrentValue;
            });
        }
    });

const setValue = () => {
    props.params.CurrentValue = radioValue.value;
    emit('propchanged');
};

const topLabel = computed(() => {
    const firstValue = props.params?.DisplayText.split(',')[0];
    return firstValue.startsWith('lbl:') ? firstValue.substring(4) : '';
});
const labels = computed(() => {
    let res = props.params.DisplayText.split(',');
    if (topLabel.value !== '') res.shift();
    return res;
});
const values = computed(() => props.params.LookupValue.split(','));

const uids = ref([]);
onMounted(() => {
    for (let i = 0; i < labels.value.length; i++) {
        uids.value.push('_' + Math.random().toString(32).substring(2, 11));
    }
});
</script>

<template>
    <div class="scriptform__textfield scriptform__stepper" data-e2e="radio-list">
        <label v-if="topLabel.value !== '' && showlabel" class="scriptform-label">{{ topLabel }}</label>
        <span v-if="params[0]?.Mandatory" class="form-field--mandatory">*</span>
        <div v-for="(label, index) in labels" class="field-container"
             :key="uids[index]"
             :class="params.DefaultValue.toLowerCase()">
            <input type="radio" :id="uids[index]" :name="uids[index]" :value="values[index]" v-model="radioValue"
                   @change="setValue()">&nbsp;
            <label :for="uids[index]">{{ label }}</label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals";

input[type=radio] {
    z-index: 10;
    height: 20px;
}

input[type=radio] + label {
    font-size: 0.8rem;
}

label {
    position: relative;
    top: -6px;
}

.field-container label {
    color: globals.$color-gray60;
    font-size: 0.7rem;
}

.vertical {
    max-height: 20px;
}

.horizontal {
    display: inline-block;
    padding-right: 8px;
}
</style>