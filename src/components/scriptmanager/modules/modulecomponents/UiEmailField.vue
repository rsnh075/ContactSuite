<script>
  /**
   * Email tekst veld
   * EmailField = 1,
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
    name: 'uiComponent_6'
  }
</script>
<script setup>
import {ref, onUpdated, onMounted, computed} from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const emit = defineEmits(['propchanged']);

const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const browserLanguage = ref('en');

const modifyVal = () => {
    emit('propchanged');
}

const store = useStore();
onUpdated(() => {
    browserLanguage.value = store.getters.getLang();
});

onMounted(() => {
    browserLanguage.value = store.getters.getLang();
});
const highlight = computed(() => props.params.Mandatory && props.params.CurrentValue === '');
</script>

<template>
    <div class="scriptform__textfield" data-e2e="ui-email">
        <label v-if="showlabel" :for="uid" class="scriptform-label">{{ params.DisplayText }}<span
                  v-if="params.Mandatory" class="form-field--mandatory">*</span></label>
        <input type="text" :name="uid" :id="uid" v-model="params.CurrentValue" @keyup="modifyVal" :class="highlight ? 'highlight' : ''">
    </div>
</template>

<style scoped>
.highlight {

}
</style>