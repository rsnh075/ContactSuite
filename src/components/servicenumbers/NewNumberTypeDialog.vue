<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : modalopen}]">
    <div class="detailscreen detailscreen--fit" id="detailscreen">
      <!-- <a v-if="modalopen" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
        <div class="grid-row">
          <div class="grid-unit-alpha">
            <div class="grid-row">
              <div class="grid-unit-alpha">
                <div class="detailscreen__title--secondary">
                  <span class="detailscreen__title--secondary__icon">&#xF61C;</span>
                  <span class="detailscreen__title--secondary__text">{{ $store.state.settings.numbertype.numbertypetitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit-alpha">
            <span class="detailscreen__title--secondary__question">{{ $store.state.settings.numbertype.numbertypequestion }}</span>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit-alpha">
            <div class="menubuttonicon-wrapper">
              <Menu-button-icon
                :iconclass="'externalservicenumber'"
                :icontitle="$store.state.settings.numbertype.externalnumbertypeheader"
                @clickediconbutton="onSelectType"
              />
              <Menu-button-icon
                :iconclass="'internalservicenumber'"
                :icontitle="$store.state.settings.numbertype.internalnumbertypeheader"
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
    name: 'NewNumberTypeDialog',
    props: ['modalopen', 'title', 'numbertype'],
    components: {
      MenuButtonIcon
    },
    data() {
      return {
        listContent      : [],
        // showHelp         : false,
      }
    },
    methods: {
    //   displayHelp() {
    //     this.showHelp = !this.showHelp;
    //   },
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

<style lang="scss" scoped>
  .menubuttonicon-wrapper {
    text-align: center;
  }
</style>
