<script>
/**
 * Algemeen tekst veld
 * TextField = 1,
 *
 */
export default {
    name: 'uiComponent_1'
};
</script>
<script setup>
import {useStore} from 'vuex';
import {ref, onUpdated, onMounted, computed} from 'vue';

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
    props.params.CurrentValue = (props.params.CurrentValue === '') ? props.params.DefaultValue : props.params.CurrentValue;
});
const highlight = computed(() => props.params.Mandatory && props.params.CurrentValue === '');
</script>

<template>
    <div class="scriptform__textfield" data-e2e="ui-text">
        <label :for="uid" class="scriptform-label" v-if="showlabel">{{ params.DisplayText }}
            <span v-if="params.Mandatory" class="form-field--mandatory">*</span>
        </label>
        <input type="text" :name="uid" :id="uid" v-model="params.CurrentValue" @keyup="modifyVal" :class="highlight ? 'highlight' : ''">
    </div>
</template>

<style scoped>
.highlight {

}
</style>