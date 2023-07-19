<script lang="ts">
  export default {
    name: 'uiComponent_14'
  }
</script>
<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps(['params', 'selectedcustomerid', 'class']);

const colSize = computed(():string => props.params?.MinValue === 2 ? 'col-large' : 'col-small');
const fontSize = computed(():string => props.params?.DefaultValue.toLowerCase() === 'large' ? 'font-large' : 'font-small');
</script>

<template>
  <div class="scriptform__textfield scriptform__label" data-e2e="label-element" :class="colSize">
    <label class="scriptform-label" :class="fontSize">{{ params.DisplayText || 'label not set' }}</label>
    <hr v-if="fontSize === 'font-large'">
  </div>
</template>

<style lang="scss" scoped>
@use "@/scss/includes/globals";

label {
    text-overflow: ellipsis;
    margin-top: 9px;
    color: globals.$color-gray80;
}
.font-large {
    display: block;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 1.2rem;
    font-weight: bold;
}
.font-small {
    font-size: 0.7rem;
}
hr {
    outline: none;
    border: none;
    border-bottom: 2px solid globals.$color-gray20;
    height: 1px;
    max-height: 1px;
    min-height: 1px;
}
</style>
