<script>
  /**
   * Algemeen tekst veld
   * TextField = 1,
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
import { ref, onUpdated, onMounted } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
    params: {type: Object, required: true},
    selectedcustomerid: {type: Number, required: false},
    showlabel: {type: Boolean, required: false, default: true}
});
const uid = ref('_' + Math.random().toString(32).substring(2, 11));
const browserLanguage = ref('en');

const emit = defineEmits(['propchanged']);
const modifyVal = () => {
    emit('propchanged');
}

const store = useStore();
onUpdated(() => {
      browserLanguage.value    = store.getters.getLang();
});

onMounted(() => {
      browserLanguage.value    = store.getters.getLang();
});
</script>

<template>
    <div class="scriptform__textfield" data-e2e="ui-textbox">
        <label v-if="showlabel" :for="uid" class="scriptform-label">{{ params.DisplayText }}</label>
        <input type="text" :name="uid" :id="uid" v-model="params.CurrentValue" @keyup="modifyVal">
    </div>
</template>
