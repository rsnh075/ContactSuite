<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : modalopen}]" data-e2e="service-destination-type">
    <div class="detailscreen detailscreen--fit" id="detailscreenY">
      <a v-if="modalopen" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
        <div class="grid-row">
          <div class="grid-unit-alpha">
            <h2 class="detailscreen__fieldsetheader">{{ title }}<span class="detailscreen__fieldsetheader-textright detailscreen__title--small">{{ getTypeLabel(numbertype, $store.state.settings.servicenumbers) }}</span></h2>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit-alpha">
            <div class="menubuttonicon-wrapper">
              <Menu-button-icon v-if="numbertype == 2"
                :iconclass="'voipaccount'"
                :icontitle="$store.state.settings.destinationtype.voipaccounttypeheader"
                @clickediconbutton="onSelectType"
              />
              <Menu-button-icon v-if="numbertype == 2"
                :iconclass="'voipgroup'"
                :icontitle="$store.state.settings.destinationtype.voipgrouptypeheader"
                @clickediconbutton="onSelectType"
              />
              <Menu-button-icon v-if="numbertype == 2"
                :iconclass="'email'"
                :icontitle="$store.state.settings.destinationtype.emailtypeheader"
                @clickediconbutton="onSelectType"
              />
              <Menu-button-icon v-if="numbertype == 1"
                :iconclass="'couple'"
                :icontitle="$store.state.settings.destinationtype.coupletypeheader"
                @clickediconbutton="onSelectType"
              />
            </div>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <span class="grid--push">
              <a class="button-primary button-primary--gray" @click="onCancel()">{{ $store.state.settings.servicenrconfig.cancellbl }}</a>
            </span>
          </div>  
        </div>
    </div>
  </div>
</template> 

<script>

  import MenuButtonIcon     from './../uielements/MenuButtonIcon.vue';

  export default {
    name: 'DestinationTypeScreen',
    props: ['modalopen', 'title', 'numbertype'],
    components: {
      MenuButtonIcon
    },
    data() {
      return {
        listContent      : [],
        showHelp         : false,
      }
    },
    methods: {
      getTypeLabel(typeIndex, store) {
        return store.numbertypelabels[typeIndex];
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      onSelectType(val) {
        this.$emit('onselect', val);
      },
      onCancel() {
        this.$emit('oncancel');
      }
    },
    mounted() {
          
    }
  }
</script>

<style scoped>
.menubuttonicon-wrapper {
  text-align: center;
}
</style>