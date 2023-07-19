<template>
  <div class="tabs-wrapper tabs-wrapper--underlined" data-e2e="ui-tab-bar">
    <a v-for="(tab, index) in tabdata"
      :key="index"
      @click="showTabContent(index)"
      :class="['tabs__tab',
      { 'tabs__tab--invisible' : !tab.isvisable },
      { 'tabs__tab--active'    : tab.isactive   },
      { 'tabs__tab--notvalid'  : !tab.isvalid   }
    ]">{{ tab.tablabel }}
    </a>
  </div>
</template>

<script>
  /**
   * Tabs
   *
   * tabdata = [{
   *  tablabel  : String,
   *  isvisable : Boolean,
   *  isactive  : Boolean,
   *  isvalid   : Boolean
   * }]
   *
   * @author Erik Rosenhart<rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   */

  export default {
    name: 'TabBar',
    props: [ 'tabdata' ] ,
    data: () => {
      return {

      }
    },
    methods: {
      showTabContent(index) {
        this.$emit('switchtab', index);
      },
    },
    mounted() {

    }
  }

</script>
