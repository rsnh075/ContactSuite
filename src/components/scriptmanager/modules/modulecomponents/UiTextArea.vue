<script>
/**
 * Algemeen tekstarea veld
 * TextArea = 8,
 */
export default {
    name: 'uiComponent_8'
};
</script>
<script setup>
import {useStore} from 'vuex';
import {ref, onUpdated, onMounted} from 'vue';

const emit = defineEmits(['propchanged']);
const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});

const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const browserLanguage = ref('en');

const modifyVal = () => {
    emit('propchanged');
};

const store = useStore();
onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

onMounted(() => {
    browserLanguage.value = store.getters.getLang();
});
</script>

<template>
    <div class="scriptform__textarea" data-e2e="ui-text-area">
        <label v-if="showlabel" :for="uid" class="scriptform-label">
            {{ params.DisplayText }}
            <span v-if="params.Mandatory" class="form-field--mandatory">*</span>
        </label>
        <textarea :name="uid" :id="uid" @keyup="modifyVal" v-model="params.CurrentValue"></textarea>
    </div>
</template>
