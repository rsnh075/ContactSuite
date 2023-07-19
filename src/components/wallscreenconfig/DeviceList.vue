<template>
  <div class="device-list__wrapper" data-e2e="device-list">
    <span class="wallscreen__title">{{ $store.state.settings.wallscreen.deviceheader }}</span>
    <AddMultiSelectSearchFlyOut class="device-list__add-button"
      :list="deviceList"
      :selectBoxConfig="selectBoxConfig"
      @addSelected="addSelectedDevice"
    />
    <ol>
      <li v-for="device in deviceList" :key="'D1_' + device.DeviceId" :class="['device-list__item', {'device-list__item--hidden' : !device.selected}]">
        <span v-html="activeIcon(device.SessionId)"></span>
        <span class="device-list__item__label">{{ device.Description }}</span>
        <span class="icon-remove-device" @click="removeDeviceFromList(device.DeviceId)">&#xF156;</span>
      </li>
    </ol>
  </div>
</template>

<script>
  import { dynamicSort }      from '../../use/sortFunctions';
  import AddMultiSelectSearchFlyOut   from './../uielements/AddMultiSelectSearchFlyOut.vue';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name : 'DeviceList',
    props : ['selectedDevices', 'disabledDevices'],
    data: () => {
      return {
        storeWatch             : null,
        deviceList             : [],
        selectBoxConfig        : {
          filterProperty       : 'Description',
          title                : ''
        }
      }
    },
    inject: ["showLoader"],
    components: {
      AddMultiSelectSearchFlyOut
    },
    watch: {
      'selectedDevices': function() {
        this.onSelectedDevicesChanged();
      },
      'selectedDevices.length': function() {
        this.onSelectedDevicesChanged();
      },
      'disabledDevices.length': function() {
        this.onDisabledDevicesChanged();
      },
      'disabledDevices': function() {
        this.onDisabledDevicesChanged();
      }
    },
    methods: {
      onSelectedDevicesChanged() {
        this.deviceList.forEach((device, index) => {
          let _selectedIndex = this.selectedDevices.findIndex(selectedDevice => selectedDevice.DeviceId == device.DeviceId);
          if(_selectedIndex == -1)
            this.deviceList[index].selected = false;
          else
            this.deviceList[index].selected = true;
        });
      },
      onDisabledDevicesChanged() {
        this.deviceList.forEach((device, index) => {
          let _disabledIndex = this.disabledDevices.findIndex(disabledDevice =>disabledDevice == device.DeviceId);
          if(_disabledIndex == -1)
            this.deviceList[index].disabled = false;
          else
            this.deviceList[index].disabled = true;
        });
      },
      getDevices() {
        IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, 'devices', 'readall', null, -1).then(result => {
          this.deviceList = result;
          this.deviceList.sort(dynamicSort('Description'));
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
          this.showLoader(false);
        });
      },
      addSelectedDevice(item) {
        this.$emit('addSelectedDevice', item)
      },
      removeDeviceFromList(id) {
        this.$emit('removeSelectedDevice', id);
      },
      closeSelectSearchListBox() {
        this.$emit('closeSelectSearchListBox');
      },
      activeIcon(sessionId) {
        if(sessionId.length > 0)
          return '<span class="device-list__item__icon device-list__item__icon--connect"></span>';
        else
          return '<span class="device-list__item__icon device-list__item__icon--disconnect"></span>';
      },
    },
    mounted() {
      this.selectBoxConfig.title = this.$store.state.settings.wallscreen.headerselectbox;
      
      if(this.$store.getters.getCustomerInfo().selectedCustomerId != -1)
        this.getDevices();
      
      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.getDevices();
      });
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>

<style lang="scss">

  @use "@/scss/includes/functions" as fn;
  @use "@/scss/includes/globals";
   
  .wallscreen__title {
    display: block;
    height: 35px;
    line-height: 35px;
    color: globals.$color-gray40;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: 'Open Sans SemiBold', sans-serif;
    font-size: 1.2rem;
    border-bottom: 1px solid globals.$color-gray20;
    margin-bottom: 10px;
  }
  
  .device-list-wrapper {
    height: 100%;
    border: 1px solid globals.$color-gray60;
    padding: 5px;
  }

  .device-list__item {
    display: flex;
    align-items: center;
    position: relative;
    padding: 6px 40px 6px 15px;
    border-radius: 3px;
    background-color: fn.tint(globals.$color-performance, 85%);
    color: globals.$color-performance;
    margin-bottom: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &--hidden {
      display: none;
    }
  }

  .device-list__item__icon {
    padding-right: 8px;
    &:after {
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 1.4em;
    }
    &--connect:after {
      color: globals.$color-secondary;
      content:'\F318';
    }
    &--disconnect:after {
      color: globals.$color-unavailable;
      content:'\F319';
    }
  }

  .device-list__add-button {
    button {
      right: 8px;
      left: initial;
      top: 7px;
    }
    .add-multiselect-search__list-wrapper {
      max-width: 300px;
    }
  }

  .icon-remove-device {
    position: absolute;
    width: 32px;
    height: 32px;
    padding-top: 9px;
    text-align: center;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    font-family: 'Material Design Icons';
    font-weight: bold;
    font-size: 0.8rem;
    color: globals.$color-performance;
    transition: color 250ms;
    cursor: pointer;
    &:hover {
      color: globals.$color-warning;
    }
  }

</style>