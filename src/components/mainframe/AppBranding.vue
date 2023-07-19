<template>
  <figure class="branding-wrapper" data-e2e="app-branding">
    <img src="/assets/images/cs_logo_cs.svg">
  </figure>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AppBranding',
    setup() {

    }
});

</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals";

.branding-wrapper {
    position: relative;
    float: left;
    height: 80px;
    width: 80px;
    //transition: width .3s ease-in-out;
    overflow: hidden;
    display: none;
    @media #{globals.$media_S} {
        display: block;
    }
    @media #{globals.$media_XL} {
        width: 246px;
        &:after {
            content: '';
            position: absolute;
            top: 15px;
            right: 0;
            bottom: 15px;
            border-left: 1px solid globals.$color-gray30;
        }
    }
}

.branding-wrapper img {
    height: 80px;
    margin-left: 0;
    @media #{globals.$media_XL} {
      margin-left: -80px;
    }
}

</style>