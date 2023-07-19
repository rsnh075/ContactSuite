<script>
  /**
   * Checkbox
   * CheckBox = 3,
   *
   * Boolean
   *
   * @author Wim Jurriaans <wjurriaans@contactmakers.nl>
   *
   * @version 1.0
   *
   * @todo
   *
   */
export default {
    name: 'uiComponent_3'
}
</script>
<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const emit = defineEmits(['propchanged']);

const uid = ref ('_' + Math.random().toString(32).substring(2, 11));

const hasTopLabel = computed(() => props.params.DisplayText.startsWith('lbl:'));
const topLabel = computed(() => hasTopLabel.value
    ? props.params.DisplayText.split(',')[0].substring(4)
    : props.params.DisplayText);
const label = computed (() => hasTopLabel.value
    ? props.params.DisplayText.split(',')[1]
    : props.params.DisplayText);

const modifyVal = () => {
    emit('propchanged');
}

onMounted(() => {
    if(props.params.CurrentValue == null || props.params.CurrentValue == undefined || props.params.CurrentValue === '') {
        props.params.CurrentValue = false;
        console.error('This should not happen, checkbox curval always filled');
    }
});
</script>

<template>
  <div class="scriptform__checkbox" data-e2e="ui-checkbox">
    <div v-if="topLabel !== '' && showlabel" class="scriptform-label">{{ topLabel }}</div>
    <input type="checkbox" :name="uid" :id="uid" v-model="params.CurrentValue" @change="modifyVal">
    <label :for="uid">{{ label }}<span v-if="params.Mandatory" class="form-field--mandatory">*</span></label>
  </div>
</template>
