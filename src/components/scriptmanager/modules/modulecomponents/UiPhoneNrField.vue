<script>
/**
 * Tekstveld met telefoonnummer validatie
 * PhoneField = 4,
 *
 */
export default {
    name: 'uiComponent_4'
};
</script>
<script setup>
import {ref, onUpdated, onMounted} from 'vue';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const emit = defineEmits(['propchanged']);

const uid = ref('_' + Math.random().toString(32).substring(2, 11));
// const changeTimer = ref(null); // not used?
const browserLanguage = ref('en');

const modifyVal = evt => {
    let _input = evt.target.val;
    let _currentvalue = Mask.isPhoneNumberMask(evt);
    props.params.CurrentValue = _currentvalue;
    if (_currentvalue !== _input)
        emit('propchanged');
};

onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

onMounted(() => {
    browserLanguage.value = store.getters.getLang();
});
</script>

<template>
    <div class="scriptform__textfield" data-e2e="ui-phone-number">
        <label v-if="showlabel" :for="uid" class="scriptform-label">
            {{ params.DisplayText }}<span v-if="params.Mandatory" class="form-field--mandatory">*</span>
        </label>
        <input type="text" :name="uid" :id="uid" v-model="params.CurrentValue" @keydown.stop="modifyVal">
    </div>
</template>
