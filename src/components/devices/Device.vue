<template>
  <div v-if="visible" :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="device">
    <div id="detailscreen" class="detailscreen">
      <!-- <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ showTitle }}</span>
        </div>
      </div>
      <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">

        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="formdevicename" id="formdevicename" v-model="data.Description" :placeholder="$store.state.settings.devices.devicenameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.devices.validatedevicename">
              <label for="formdevicename" class="form-label form-label--hidden">{{ $store.state.settings.devices.formdevicename }}</label>
              <!-- <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.devices.helptextdevicename }}</div> -->
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="formdeviceid" id="formdeviceid" v-model="data.DeviceId" :placeholder="$store.state.settings.devices.deviceidplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.devices.validatedeviceid" :disabled="dataop != 'readnew'">
              <label for="formdeviceid" class="form-label form-label--hidden">{{ $store.state.settings.devices.formdeviceid }}</label>
              <!-- <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.devices.helptextdeviceid }}</div> -->
            </div>
          </div>
          <!-- <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="detailSubscription" id="detailSubscription" v-model="data.Subscription" :placeholder="$store.state.settings.devices.subscriptionplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.devices.validatesubscription">
              <label for="detailSubscription" class="form-label form-label--hidden">{{ $store.state.settings.devices.formsubscription }}</label>
              <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.devices.helptextsubscription }}</div>
            </div>
          </div>
          <div class="grid-unit--beta"></div> -->
        </div>

        <!-- <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="formurl" id="formurl" v-model="data.Url" :placeholder="$store.state.settings.devices.urlplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.devices.validateurl">
              <label for="formurl" class="form-label form-label--hidden">{{ $store.state.settings.devices.formurl }}</label>
              <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.devices.helptexturl }}</div>
            </div>
          </div>
        </div> -->

      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span>
          <a class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.devices.deletebtnlbl }}</a>
        </span>
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.devices.closebtnlbl }}</a>
          <a class="button-primary js-submitbtn">{{ $store.state.settings.devices.savebtnlbl }}</a>
        </span>
      </div>

    </div>
  </div>
</template>

<script>

  import { ValidateDir }  from './../../directives/validate';

  export default {
    name: 'Device',
    props: ['visible', 'data', 'dataop'],
    data: () => {
      return {
        // showHelp       : false,
      }
    },
    directives: {
      Validate: ValidateDir
    },
    computed: {
      showTitle() {
        return this.data.DeviceId.length > 0 ? this.data.DeviceId : this.$store.state.settings.devices.newtitleplaceholder;
      },
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
    //   displayHelp() {
    //     this.showHelp = !this.showHelp;
    //   },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      }
    }
  }

</script>
