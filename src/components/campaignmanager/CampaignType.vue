<template>
  <div class="typescreen-wrapper" data-e2e="campaign-type">
    <div class="grid-row">
        <span class="detailscreen__title detailscreen__title--underline">{{ $store.state.settings.campaignmanager.typetitle }}</span>
    </div>
    <div class="grid-row">
        <span class="detailscreen__title detailscreen__title--small detailscreen__title--centered">{{ $store.state.settings.campaignmanager.typesubtitle }}</span>
    </div>
    <div class="grid-row">
        <div class="menubuttonicon-wrapper">
            <Menu-button-icon
            :iconclass="'telephony'"
            :icontitle="$store.state.settings.campaignmanager.typeiconheader[0]"
            @clickediconbutton="setType"
            />
            <Menu-button-icon
            :iconclass="'textmessage'"
            :icontitle="$store.state.settings.campaignmanager.typeiconheader[1]"
            @clickediconbutton="setType"
            />
        </div>
    </div>
    <!-- BUTTONS -->
    <div class="detailscreen-footer detailscreen-footer--inside">
      <span class="grid--push">
        <a class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.campaignmanager.cancellabel }}</a>
      </span>
    </div>
  </div>
</template>

<script>

  import MenuButtonIcon            from './../uielements/MenuButtonIcon.vue';

  export default {
    name: 'CampaignType',
    components: {
      MenuButtonIcon
    },
    methods: {
      backToList() {
        this.$emit('cancel');
      },
      setType(val) {
        let _ref;
        switch(val) {
          case 'telephony':
            this.$emit('settype', 1);
            break;
          case 'textmessage':
            this.$emit('settype', 5);
        }
      }
    },
    mounted() {
      this.tabData       = this.$store.state.settings.campaignmanager.tablbl;
      this.tabList       = this.$refs['tabContent'];
    }
  }

</script>

<style scoped>
.menubuttonicon-wrapper {
  text-align: center;
}
</style>