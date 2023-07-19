<script>
  /**
   * FixedDropdown
   * FixedDropdown = 7,
   *
   * @author Wim Jurriaans <wjurriaans@contactmakers.nl>
   *
   * @version 1.0
   *
   * @todo
   * - validation
   *
   */
  export default {
    name: 'uiComponent_7'
  }
</script>
<script setup>
import { useStore } from 'vuex';
import { ref, onUpdated, onMounted } from 'vue';

const props = defineProps({
    params: { type: Object, required: true },
    selectedcustomerid: { required: false },
    showlabel: { type: Boolean, required: false, default: true }
});
const emit = defineEmits(['propchanged', 'propvalue']);

const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const browserLanguage = ref('en');

const setSelectedValue = optionValue => {
    let _val = (props.params.CurrentValue === '') ? props.params.DefaultValue : props.params.CurrentValue;
    return optionValue === _val;
}

const modifyVal = evt => {
    emit('propvalue', props.params.CurrentValue);
    emit('propchanged');
}

const store = useStore();
onUpdated(() => {
    browserLanguage.value    = store.getters.getLang();
});

onMounted(() => {
    browserLanguage.value = store.getters.getLang();
    props.params.CurrentValue = (props.params.CurrentValue === '') ? props.params.DefaultValue : props.params.CurrentValue;
});
</script>

<template>
    <div class="scriptform__selectfield" data-e2e="ui-dropdown" :class="{nolabel: !showlabel}">
        <label v-if="showlabel" :for="uid" class="scriptform-label">{{ params.DisplayText }}<span v-if="params.Mandatory" class="form-field--mandatory">*</span></label>
        <select :name="uid" :id="uid" v-model="params.CurrentValue" @change="modifyVal">
            <option v-for="option in params.SelectableValues" :value="option" :selected="setSelectedValue(option)">{{ option }}</option>
        </select>
    </div>
</template>

<style scoped>
.nolabel:before {
    top: 17px;
}
</style>