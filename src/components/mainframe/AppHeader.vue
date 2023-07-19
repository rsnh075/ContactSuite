<template>
  <header class="header-wrapper" data-e2e="app-header">
    <app-branding />
    <app-main-menu />
    <app-meta-menu />
  </header>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import AppBranding    from "./AppBranding.vue";
import AppMainMenu    from "./AppMainMenu.vue";
import AppMetaMenu    from "./AppMetaMenu.vue";

export default defineComponent({
    name: 'AppHeader',
    components: {
        AppBranding,
        AppMainMenu,
        AppMetaMenu
    },
    setup() {

    }
});

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";

  .header-wrapper {
    position: absolute;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .15);
    background-color: globals.$color-white;
    top: 0;
    right: 0;
    left: 0;
    font-size: 1.2rem;
    height: 80px;
    user-select: none;
    z-index: 5000;
  }

</style>