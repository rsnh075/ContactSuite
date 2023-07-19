<template>
  <div v-if="deviceList.length > 0" :class="['dialpad__pbx-settings-wrapper', {'dialpad__pbx-settings-wrapper--minimized' : !wrapperIsOpen}]" data-e2e="pbx-settings">
    <div v-if="$router.currentRoute.path !== '/app/'" :class="['dialpad__settings-wrapper__toggle', wrapperIsOpen ? classWrapperOpen : classWrapperClosed]" @click="wrapperToggle()"></div>
    <div class="header_settings dialpad__settings-header">{{$store.state.settings.pbxsettings.devicesettingslbl}}</div>
    <div class="form-selectfield form-selectfield--inline">
      <label class="form-label form-label--hidden form-label--lowered">
        {{ $store.state.settings.pbxsettings.devicelbl }}
      </label>
      <select v-model="currSelDevIndx" @change="saveSettings()">
        <option v-for="(device, index) in deviceList" :key="index" :value="index">{{ device.VoIPAccountNumber }}</option>
      </select>
    </div>
    <div class="form-selectfield form-selectfield--inline">
      <label class="form-label form-label--hidden form-label--lowered">
        {{ $store.state.settings.pbxsettings.outgoingidentitylbl }}
      </label>
      <select v-model="deviceList[currSelDevIndx].OutboundIdentity" @change="saveSettings()">
        <option value="">{{$store.state.settings.pbxsettings.chooseoption}}</option>
        <option v-for="(identity, index) in identityList" :key="index" :value="identity.Number">{{ identity.Label }}</option>
      </select>
    </div>

    <div class="form-textfield form-textfield--bground field-label-dnd">
      <label>{{ $store.state.settings.pbxsettings.dndlbl }}</label>
    </div>
    <div class="form-togglefield field-input-dnd">
      <input type="checkbox" name="toggle_dnd" id="toggle_dnd" v-model="deviceList[currSelDevIndx].DND" @change="saveSettings()">
      <label for="toggle_dnd" class="toggle--js"></label>
    </div>
    <hr>

    <div class="form-textfield form-textfield--bground">
      <input type="text" name="callforwarding" :disabled="deviceList[currSelDevIndx].FollowMeOn" v-model="deviceList[currSelDevIndx].FollowMe" :placeholder="$store.state.settings.pbxsettings.placeholderforwardinglbl">
      <label for="callforwarding" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.forwarding }}</label>
    </div>
    <div class="form-togglefield after_input" :class="{ after_input_off: deviceList[currSelDevIndx].FollowMeOn }">
      <input type="checkbox" name="toggle_fm" :disabled="deviceList[currSelDevIndx].FollowMe.trim() === ''" id="toggle_fm" v-model="deviceList[currSelDevIndx].FollowMeOn" @change="saveSettings()">
      <label for="toggle_fm" class="toggle--js" :class="getLabelValidClass('fm')"></label>
    </div>
    <hr>

    <div class="form-textfield form-textfield--bground">
      <input type="text" name="callforwardingbusy" :disabled="deviceList[currSelDevIndx].OverflowOn" v-model="deviceList[currSelDevIndx].Overflow" :placeholder="$store.state.settings.pbxsettings.placeholderforwardingbusylbl">
      <label for="callforwardingbusy" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.forwardingbusylbl }}</label>
    </div>
    <div class="form-togglefield after_input" :class="{ after_input_off: deviceList[currSelDevIndx].OverflowOn }">
      <input type="checkbox" name="toggle_vmb" :disabled="deviceList[currSelDevIndx].Overflow.trim() === ''" id="toggle_vmb" v-model="deviceList[currSelDevIndx].OverflowOn" @change="saveSettings()">
      <label for="toggle_vmb" class="toggle--js" :class="getLabelValidClass('vmb')"></label>
    </div>
    <hr>

    <div class="form-textfield form-textfield--bground">
      <input type="text" name="noanswernumber" :disabled="deviceList[currSelDevIndx].NoAnswerOn" v-model="deviceList[currSelDevIndx].NoAnswerNumber" :placeholder="$store.state.settings.pbxsettings.placeholdernoanswerlbl">
      <label for="noanswernumber" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.noanswerlbl }}</label>
    </div>
    <div class="form-togglefield after_input" :class="{ after_input_off: deviceList[currSelDevIndx].NoAnswerOn }">
      <input type="checkbox" name="toggle_nao" :disabled="deviceList[currSelDevIndx].NoAnswerNumber.trim() === ''" id="toggle_nao" v-model="deviceList[currSelDevIndx].NoAnswerOn" @change="saveSettings()">
      <label for="toggle_nao" class="toggle--js" :class="getLabelValidClass('nao')"></label>
    </div>
    <hr>

    <div class="form-textfield form-textfield--bground">
      <input type="text" name="voicemailaddress" :disabled="deviceList[currSelDevIndx].Voicemail" v-model="deviceList[currSelDevIndx].VMEmailAddress" :placeholder="$store.state.settings.pbxsettings.placeholdervoicemaillbl">
      <label for="voicemailaddress" class="form-label form-label--hidden">{{ $store.state.settings.pbxsettings.voicemaillbl }}</label>
    </div>
    <div class="form-togglefield after_input" :class="{ after_input_off: deviceList[currSelDevIndx].Voicemail }">
      <input type="checkbox" name="toggle_vm" :disabled="deviceList[currSelDevIndx].VMEmailAddress.trim() === ''" id="toggle_vm" v-model="deviceList[currSelDevIndx].Voicemail" @change="saveSettings()">
      <label for="toggle_vm" class="toggle--js" :class="getLabelValidClass('vm')"></label>
    </div>
    <hr>

  </div>
</template>


<script lang="ts">

  import { IPCCCUserSettings }  from '../../../ipccc/js/usersettings.js';
  import { IPCCCConfigurator } from '../../../ipccc/js/configurator.js';
  import { defineComponent } from 'vue';

// TODO:
// 3. create 'invalid' state model for checkboxes! <--------
  export default defineComponent({
    name: 'PbxSettings',
    data: () => {
      return {
        deviceList              : [],
        currSelDevIndx          : 0,
        currentSelectedIdentity : '',
        storeWatchOne           : null,
        storeWatchTwo           : null,
        storeWatchThree         : null,
        wrapperIsOpen           : true,
        classWrapperOpen        : 'dialpad__settings-wrapper__toggle--up',
        classWrapperClosed      : 'dialpad__settings-wrapper__toggle--down',
        identityList            : [],
        testlist: [1,2,3,4,5],
        test: 3
      }
    },
    inject: ["showLoader"],
    computed: {
      curIdentityId() {
        return this.$store.state.currentIdentityId;
      }
    },
    methods: {
      getLabelValidClass(checkboxName: string): string {
        const device = this.deviceList[this.currSelDevIndx];
        switch(checkboxName) {
          case 'fm':
              if (device.DND) return 'invalid';
              return '';
          case 'vmb':
          case 'nao':
            if (device.DND ||device.FollowMeOn) return 'invalid';
            return '';
          case 'vm':
            if (device.DND) return '';
            if (device.FollowMeOn || (device.OverflowOn && device.NoAnswerOn)) {
              return 'invalid';
            }
            return '';
        }
      },
      getIdentityList() {
        IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().customerId, 'outboundnumber', 'list', null, -1)
        .then(result => {
          this.identityList = [...result].reduce((acc, item) => {
            if (item.Number.length == 0) return acc;
            if (item.Label.length == 0) item.Label = item.Number;
            acc.push(item);
            return acc;
          }, []);
          this.showLoader(false);
        })
        .catch(error => {
          this.showLoader(false);
          console.error("Error: " + error);
        });
      },
      saveSettings() {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().customerId, 'PBXsettings', 'save', this.deviceList[this.currSelDevIndx], -1)
        .then(result => {
          // setDND
          if (result.VoIPAccountNumber == this.$store.getters.getCurrentSelDevice().Address) {
            this.$store.commit('SET_CURRENT_SELECTED_DEVICE_DND', result.DND ?? false);
          }
          this.showLoader(false);
        })
        .catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      getPBXData() {
        this.$store.dispatch('GET_PBXSETTINGS')
        .then(result => {
          this.$store.commit('SET_PBXSETTINGS', result);
          this.deviceList = result;
          this.setSelectedDevice();
        })
        .catch(error => {
          console.error(error);
        });
      },
      setSelectedDevice() {
        let _currentSelDeviceIndex = null;
        // first try loggedin device
        if(this.deviceList.length > 0) {
            if(this.$store.state.currentDeviceName == 'Geen toestel') {
                _currentSelDeviceIndex = 0;
            } else {
                _currentSelDeviceIndex = this.deviceList.findIndex(device => device.VoIPAccountNumber == this.$store.getters.getCurrentSelDevice().Address);
            }
        }
        this.currSelDevIndx = _currentSelDeviceIndex != -1 ? _currentSelDeviceIndex : 0;
      },
      wrapperToggle() {
        this.wrapperIsOpen = !this.wrapperIsOpen
        IPCCCUserSettings.Save('PBXSettings', 'PBXWrapperIsOpen', this.wrapperIsOpen).catch(_ => console.error('PBXWrapperIsOpen not saved'));
      }
    },
    mounted() {
      this.getIdentityList();
      IPCCCUserSettings.Get('PBXSettings').then((result):void => {
        result.forEach(setting => {
          if(setting.Name === 'PBXWrapperIsOpen') this.wrapperIsOpen = setting.Data == 'true';
        });
      });


      if(this.$store.getters.getCustomerInfo().customerId !== -1) {
        // this.getPBXData();
        this.deviceList = this.$store.getters.getPbxSettings();
        this.setSelectedDevice();
      }

      this.storeWatchOne = this.$store.watch(this.$store.getters.statusChanged, status => {
        if(this.$store.getters.getCustomerInfo().customerId !== -1) {
          this.getPBXData();
        }
      });

      this.storeWatchTwo = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        if(cObj.customerId == cObj.selectedCustomerId && this.$store.getters.getCustomerInfo().customerId !== -1) {
          this.getPBXData();
        }
      });

      this.storeWatchThree = this.$store.watch(this.$store.getters.getCurrentSelDevice, currentDevice => {
        if(this.deviceList[this.currSelDevIndx].VoIPAccountNumber !== currentDevice.Address && this.$store.getters.getCustomerInfo().customerId !== -1) {
          this.getPBXData();
        }
      });
    },
    beforeUnmount() {
      this.storeWatchOne();
      this.storeWatchTwo();
    }
})
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions" as fn;

//for pbxapp
.dialpad__pbx-settings-pbxapp .dialpad__pbx-settings-wrapper {
  top: 0;
  overflow: auto;
  width: 100%;
  .dialpad__settings-wrapper__toggle {
    display: none;
  }
}

.dialpad__pbx-settings-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  max-width: 365px;
  padding : 0.7rem 2rem 1rem 2rem;
  background-color: globals.$color-white;
  height: 492px;
  transition: height 0.25s ease-in-out;
  hr {
    float: left;
    width: 100%;
    outline: none;
    border: none;
    border-bottom: 2px solid globals.$color-gray10;
    height: 1px;
    max-height: 1px;
    min-height: 1px;
  }
}

.dialpad__pbx-settings-wrapper {
  .form-selectfield {
    float: left;
    width: 100%;
  }
  .form-textfield,
  .form-textfield--bground {
    float: left;
    width: calc(100% - 50px);
    padding-bottom: 0;
    label {
      //top: 6px;
      color: globals.$color-gray60;
    }
    input[type='text'],
    input[type='email'],
    input[type='password'],
    input[type='number'],
    input[type='tel'] {
      border-bottom: 0px;
    }
  }
  .after_input {
      background-color: #f9f9f9;
      label {
        position: relative;
        top: -14px;
        left: -5px;
      }
    }
  .after_input_off {
    background-color: transparent;
  }
  .form-togglefield {
    float: left;
    width: 50px;
    padding-left: 10px;
    padding-top: 10px;
    display: block;
    position: relative;
    top: 17px;
    height: 30px;
  }
  .form-selectfield {
    &:before {
      top: auto;
      bottom: 20px;
    }
    .form-label {
      float: left;
      width: 100%;
      height: 25px;
      line-height: 35px;
      color: globals.$color-gray60;
      .dialpad__settings-toggle {
        float: right;
        width: 30px;
        height: 30px;
        line-height: 30px;
        @include font.font-icon();
        font-size: 1.8em;
        text-align: center;
        color: globals.$color-interaction;
        cursor: pointer;
        background-color: globals.$color-gray10; //tint(globals.$color-interaction, 25%);
        border-radius: 50%;
      }
    }
  }
}

.field-label-dnd {
  position: relative;
  top: 10px !important;
}
.field-input-dnd {
  top: -15px !important;
  right: 6px;
}

.dialpad__pbx-settings-wrapper--editmode {
  .form-textfield,
  .form-textfield--bground {
    width: 100%;
    label {
      color: globals.$color-gray35;
    }
    input[type='text'],
    input[type='email'],
    input[type='password'],
    input[type='number'],
    input[type='tel'] {
      border-bottom: 1px solid globals.$color-gray35;
      box-shadow: inset 0 -30px 0px 0px rgba(0,0,0,.025);
      color: globals.$color-gray60;
    }
  }
  .form-togglefield {
    display: none;
  }
  hr {
    border-bottom: globals.$color-white;
  }
  .dialpad__simple-toggle-line {
    .form-togglefield {
      display: block;
    }
  }
}

.dialpad__simple-toggle-line {
  float: left;
  width: 100%;
  label {
    float: left;
    width: calc(100% - 50px);
    padding-top: 20px;
    color: globals.$color-gray80;
    font-size: 1rem;
  }
  .form-togglefield {
    padding-top: 0;
  }
}

.dialpad__pbx-settings-wrapper--minimized {
  height: 55px;
  padding: 0.5rem 2rem;
}

.dialpad__settings-wrapper__toggle {
  cursor : pointer;
  width: calc(100% - 4rem);
  text-align: center;
  border-top: 1px solid globals.$color-gray20;
  height: 10px;
  position: absolute;
  top: 0;
  &:before {
    // box-shadow: 0px -2px 3px rgba(0, 0, 0, .10);
    color: globals.$color-gray25;
    font-size: 1.6rem;
    position: absolute;
    width: 30px;
    height: 20px;
    line-height: 20px;
    background-color: globals.$color-white;
    @include font.font-icon;
    top: -20px;
    left: 50%;
    transform: translate(-50%, 50%);
  }
  &--up:before {
    content: '\F140'
  }
  &--down:before {
    content: '\F143'
  }
}

.dialpad__settings-header {
  font-size: 1rem;
  line-height: 0.8rem;
  @include font.font-bold;
  color: globals.$color-gray60;
  position: absolute;
  top: 8px;
}
.header_settings {
  position: relative;
  top: 5px;
  margin: 10px 0;
}
</style>
