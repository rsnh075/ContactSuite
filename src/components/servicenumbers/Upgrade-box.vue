<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : status}]" data-e2e="service-upgrade-box">
    <div class="detailscreen" id="detailscreen">
      <!-- <a v-if="status" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
      <div class="grid-row">
        <h2 class="detailscreen__fieldsetheader">{{ headerContent }}</h2>
      </div>
      <!-- <div :class="['grid-unit--alpha typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.servicenrconfig.helptextupgrade }}</div>   -->
      
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <div class="numberlist-wrapper">
            <div class="numberlist__header">
              <span class="numberlist__row-cell numberlist__row-cell--50">&nbsp;</span>
              <!-- <span class="numberlist__row-cell numberlist__row-cell--25"><img :src="createUrl('/images/illustratie-essential.svg')"><h4>Essential</h4></span>
              <span class="numberlist__row-cell numberlist__row-cell--25"><img :src="createUrl('/images/illustratie-plus.svg')"><h4>Plus</h4></span> -->
              <span class="numberlist__row-cell numberlist__row-cell--25"><img src="/assets/images/illustratie-essential.svg"><h4>Essential</h4></span>
              <span class="numberlist__row-cell numberlist__row-cell--25"><img src="/assets/images/illustratie-plus.svg"><h4>Plus</h4></span>
            </div>
            <div class="numberlist__list">
              <div v-for="(number, index) in numberList">
                <span class="numberlist__row-cell numberlist__row-cell--50">{{ number.Number }}</span>
                <span class="numberlist__row-cell numberlist__row-cell--25">
                  <div class="numberlist__radio">
                    <input type="radio" :name="'radio_' + index" :id="'radio_' + index" value="2" v-model="number.NumberType" :disabled="numberOrgList[index].NumberType == 1">
                    <label :for="'radio_' + index"></label>
                  </div>
                </span>
                <span class="numberlist__row-cell numberlist__row-cell--25">
                  <div class="numberlist__radio">
                    <input type="radio" :name="'radio_' + index" :id="'radio2_' + index" value="1" v-model="number.NumberType" :disabled="numberOrgList[index].NumberType == 1">
                    <label :for="'radio2_' + index"></label>
                  </div>
                </span>
              </div>
            </div>  
          </div>
        </div>
      </div>

      <div class="grid-row">
        <div class="grid-unit--alpha">
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="doCanceled">{{ cancelLabel }}</a>
            <a class="button-primary" @click="doSave">{{ acceptLabel }}</a>
          </span>
        </div>  
      </div>  
    </div>
  </div>
</template>

<script>
  
  export default {
    name: 'UpgradeBox',
    props: ['status', 'headerContent', 'cancelLabel', 'acceptLabel', 'numberlist'],
    data: () => {
      return {
        upGradeCheck  : false,
        acceptedCheck : false,
        showHelp      : false,
        // siteroot      : siteroot,
        numberList    : [],
        numberOrgList : []
      }
    },
    watch: {
      status: function(newVal, oldVal) {
        if(!newVal) {
          this.showHelp      = false;
          this.numberList    = [];
          this.numberOrgList = [];
        } else {
          this.numberList    = [...this.numberlist];
          this.numberOrgList = JSON.parse(JSON.stringify(this.numberlist));
        }
      }
    },
    computed: {
      dialogStatus() {
        let _class = 'dialog__modal';
        if(this.$props.status)
          _class += ' dialog__modal--open';

        return _class;
      },
      windowStatus() {
        let _class = 'dialog__window dialog__window--w500';
        if(this.$props.status)
          _class += ' dialog__window--open';

        return _class;
      },
    },
    methods: {
      // createUrl(path) {
      //   // return siteroot + path;
      //   return path;
      // },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      doSave() {
        this.$emit('savenumbers', this.numberList);
      },
      doCanceled() {
        this.$emit('canceled');
      },
    },
  }
</script>

<style lang="scss" scoped>
@use "@/scss/includes/numberlist";
</style>
