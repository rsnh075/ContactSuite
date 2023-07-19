<template>
  <div v-if="visible" :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="destination">
    <div id="detailscreen" class="detailscreen">
      <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ showTitle }}</span>
          
        </div>
      </div>
      <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">

        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <!--<input :disabled="readonly" type="text" name="formnumber" id="formnumber" v-model="data.PhoneNumber" :placeholder="$store.state.settings.extensions.numberplaceholder" data-validate="isPhone" :data-message="$store.state.settings.extensions.validatenumber" @keydown="checkIsNumber($event, 'PhoneNumber')">-->
              <input :disabled="readonly" type="text" name="formnumber" id="formnumber" v-model="data.PhoneNumber" :placeholder="$store.state.settings.extensions.numberplaceholder" data-validate="isPhone" :data-message="$store.state.settings.extensions.validatenumber">
              <label for="formnumber" class="form-label form-label--hidden">{{ $store.state.settings.extensions.formnumber }}</label>
              <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.extensions.helptextnumber }}</div>
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input :disabled="readonly" type="text" name="detailTitle" id="detailTitle" v-model="data.Title" :placeholder="$store.state.settings.extensions.titleplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.extensions.validatetitle">
              <label for="detailTitle" class="form-label form-label--hidden">{{ $store.state.settings.extensions.formtitle }}</label>
              <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.extensions.helptextname }}</div>
            </div>
          </div>
        </div>

        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input :disabled="readonly" type="text" name="formconnections" id="formconnections" v-model="data.Connections">
              <label for="formconnections" class="form-label form-label--hidden">{{ $store.state.settings.extensions.formconnections }}</label>
              <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.extensions.helptextconnections }}</div>
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.extensions.formcalltimeoutunit}">
              <input :disabled="readonly" type="text" name="formtimeout" id="formtimeout" v-model="data.CallTimeout" data-validate="isZeroOrFiveToNinety" :data-message="$store.state.settings.extensions.validatecalltimeout">
              <label for="formtimeout" class="form-label form-label--hidden">{{ $store.state.settings.extensions.formtimeout }}</label>
              <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.extensions.helptextcalltimeout }}</div>
            </div>
          </div>
        </div>
          
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span v-show="selectedId !== -1">
          <a class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.extensions.deletebtnlbl }}</a>
        </span>
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.extensions.closebtnlbl }}</a>
          <a  :disabled="readonly" class="button-primary js-submitbtn">{{ $store.state.settings.extensions.savebtnlbl }}</a>
        </span>
      </div>
    
    </div>
  </div>
</template>

<script>

  import { ValidateDir } from './../../directives/validate';
  import { UnitsLabel }  from './../../directives/unitslabel';
  import * as Mask       from './../../utils/cm_mask';

  export default {
    name: 'Destination',
    props: ['visible', 'data', 'selectedId'],
    data: () => {
      return {
        showHelp       : false,
      }
    },
    directives: {
      Unitslabel : UnitsLabel,
      Validate : ValidateDir
    },
    computed: {
      showTitle() {
        return this.data.Title.length > 0 ? this.data.Title : this.$store.state.settings.extensions.newtitleplaceholder;
      },
      readonly() {
        return Math.sign(this.selectedId) == -1 && this.selectedId != -1 ? true : false;
      }
    },
    methods: {
      saveDetail() {
        this.$emit('save', this.data);
      },
      deleteDetail() {
        this.$emit('delete', this.data);
      },
      closeDetail() {
        this.$emit('close');
      },
      //==========================================HELPER FUNCTIONS
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.data[prop] = Mask.isPhoneNumberMask(evt);

      }
    }
  }

</script>
