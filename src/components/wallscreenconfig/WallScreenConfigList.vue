<template>
  <div data-e2e="wall-screen-config-list">
    <!-- CONFIG SCREEN -->
    <WallScreenConfig
      :status="showDetail"
      :screendata="selectedScreenData"
      :disabledDevices="disabledDevices"
      @cancelConfig="closeConfigDetail"
      @saveConfig="saveConfig"
      @deleteConfig="deleteConfig"
    />
    <!-- LIST -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" v-model="searchStr" :placeholder="$store.state.settings.wallscreen.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{ totalConfigs }} {{ $store.state.settings.wallscreen.configstotals }}
          </div>
          <div v-if="hasConfigRights" class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="openNewConfigDetail()">{{ $store.state.settings.wallscreen.addlbl }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper" ref="listContentWrapper">
        <div class="list-content--back">
          <ExportListToXLSX
          :data="orderedList"
          :customBtnStyles="exportListBtnStyles"
          :customWrapperStyles="exportListWrapperStyles"
        />
          <div class="list-content--header">
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Name', $event)"         data-sortorder="NONE" v-html="$store.state.settings.wallscreen.headerlabels[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--60" @click="sortColumn('Description', $event)"  data-sortorder="NONE" v-html="$store.state.settings.wallscreen.headerlabels[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--10" @click="sortColumn('Devices', $event)"      data-sortorder="NONE" v-html="$store.state.settings.wallscreen.headerlabels[2]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol @click="clickedOnList($event)" ref="theList">
              <li v-for="(config, index) in orderedList" class="list-content__row list-content__row--clickable row--js" :data-id="config.Id" :data-index="index">
                <span class="list-content__row-cell list-content__row-cell--30" v-html="config.Name"></span>
                <span class="list-content__row-cell list-content__row-cell--60" v-html="config.Description"></span>
                <span class="list-content__row-cell list-content__row-cell--10" v-html="config.DeviceCount"></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WallScreenConfig       from './WallScreenConfig.vue';
import { dynamicSort }      from '../../use/sortFunctions';
import { IPCCCConfigurator } from '../../ipccc/js/configurator';
import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';

export default {
    name: "WallScreenConfigList",
     data: () => {
      return {
        selectedCustomerId     : -1,
        searchStr              : '',
        totalConfigs           : 0,
        hasConfigRights        : true,
        sortSetting            : {},
        orderedList            : [],
        unOrderedList          : [],
        showDetail             : false,
        selectedScreenData     : {},
        newScreenData          : {
          Name                 : '',
          Description          : '',
          BackgroundColor      : '',
          ImageByteStream      : '',
          Subscription         : 'routinggroupinfo',
          Devices              : [],
          Routinggroups        : [],
          DataPoints           : [],
          TotalDataPoints      : []
        },
        dataOp                 : '',
        selectedId             : -1,
        disabledDevices        : [],
        exportListBtnStyles  : {
            top: '9px',
            right: '8px',
            zIndex: 1
        },
        exportListWrapperStyles : {
            top: '9px',
            right: '8px',
        },
      }
    },
    inject: ["showLoader"],
    components: {
      WallScreenConfig
    },
    methods: {
      dataTransfer(dataOp) {
        return new Promise((resolve, reject) => {
          this.showLoader(true);
          this.dataOp = dataOp;
          IPCCCConfigurator.Request(this.selectedCustomerId, 'wallscreen', dataOp, this.selectedScreenData, this.selectedId).then(result => {
            resolve(result);
            this.showLoader(false);
          }).catch(error => {
            this.showLoader(false);
            reject(console.error('Error: ' + error));
          });
        });
      },
      filterList() {
        this.showLoader(true);
        this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
        this.totalConfigs   = this.orderedList.length;
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
              if(String(item['Name']).toLowerCase().indexOf(str) != -1 ||
                item['Description'].toLowerCase().indexOf(str) != -1) {
                return item;
              };
          });
        } else {
          return [...list];
        }
      },
      sortColumn(key, e = null) {
        let _order,
            _t;

        if(e != null) {
          _t     = e.target;
          _order = _t.getAttribute('data-sortOrder');
          document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
          this.sortSetting = {
            'key': key,
            'order' : _order
          }
        } else {
          _order = this.sortSetting.order;
          key    = this.sortSetting.key;
        }

        switch(_order) {
          case 'NONE':
            this.orderedList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.orderedList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
            this.totalConfigs   = this.orderedList.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
        this.showLoader(false);
      },
      clickedOnList(evt) {
        let _target    = evt.target.tagName == 'SPAN' ? evt.target.parentElement : evt.target,
            _trigger   = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        switch(_trigger) {
          case 'row--js':
            this.selectedId = _target.getAttribute('data-id')
            this.openConfigDetail();
            break;
        }
      },
      resetConfigDetail() {
        this.selectedScreenData = JSON.parse(JSON.stringify(this.newScreenData));
        this.setDisabledDevices(this.unOrderedList);
      },
      openNewConfigDetail() {
        this.setDisabledDevices(this.unOrderedList);
        this.selectedId         = -1;
        this.selectedScreenData = JSON.parse(JSON.stringify(this.newScreenData));
        this.showDetail         = true;
      },
      openConfigDetail() {
        this.dataTransfer('readone').then(result => {
          this.setDisabledDevices(this.unOrderedList);
          this.deleteSelectedFromDisabledDevices(result);
          this.selectedScreenData = JSON.parse(result.Configuration);
          this.showDetail         = true;
        })
      },
      closeConfigDetail() {
        this.resetConfigDetail();
        // EVENT_BUS.$emit('showSelectSearchListBox', false); // doesn't seem to be used in v2!
        this.showDetail = false;
      },
      saveConfig(screenData) {
        let _routinggroupIdsInt = [];
        _routinggroupIdsInt = screenData.Routinggroups.map(rg => rg.Id);
        let _devicesIdsStr = [];
        _devicesIdsStr = screenData.Devices.map(device => device.DeviceId);

        let _saveThis = {
          CustomerId    : this.selectedCustomerId,
          Id            : this.selectedId,
          Name          : screenData.Name,
          Description   : screenData.Description,
          Routinggroups : _routinggroupIdsInt,
          DeviceIds     : _devicesIdsStr,
          Configuration : JSON.stringify(screenData)
        }
        this.selectedScreenData = _saveThis;
        this.dataTransfer('save').then(result => {
          result.DeviceCount = result.DeviceIds.length;
          if(this.selectedId == -1) {
            this.unOrderedList.push(result);
          } else {
            let _index = this.unOrderedList.findIndex(wallscreen => wallscreen.Id == result.Id)
            this.unOrderedList[_index] = result;
          }
          this.filterList();
          this.showDetail = false;
          this.resetConfigDetail();
        });
      },
      deleteConfig(screenData) {
        let _routinggroupIdsInt = [];
        _routinggroupIdsInt = screenData.Routinggroups.map(rg => rg.Id);
        let _devicesIdsStr = [];
        _devicesIdsStr = screenData.Devices.map(device => device.DeviceId);

        let _deleteThis = {
          CustomerId    : this.selectedCustomerId,
          Id            : this.selectedId,
          Name          : screenData.Name,
          Description   : screenData.Description,
          Routinggroups : _routinggroupIdsInt,
          DeviceIds     : _devicesIdsStr,
          Configuration : JSON.stringify(screenData)
        }
        this.selectedScreenData = _deleteThis;
        this.dataTransfer('delete').then(result => {
          let _index = this.unOrderedList.findIndex(wallscreen => wallscreen.Id == result.Id);
          this.unOrderedList.splice(_index, 1);
          this.filterList();
          this.showDetail = false;
          this.resetConfigDetail();
        });
      },
      setDisabledDevices(wallscreenlist) {
        this.disabledDevices = wallscreenlist.reduce((acc, cur) => { return [...acc, ...cur.DeviceIds]}, []);
      },
      deleteSelectedFromDisabledDevices(wallscreen) {
        this.disabledDevices = this.disabledDevices.reduce((acc, cur) => {
          if(wallscreen.DeviceIds.indexOf(cur) == -1)
            acc.push(cur);
          return acc;
        }, []);
      }
    },
    mounted() {
      this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

      if(this.selectedCustomerId != -1) {
        this.dataTransfer('list').then(result => {
          this.unOrderedList = this.orderedList = result;
          this.totalConfigs  = this.orderedList.length;
        });
      }

      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        if(cObj.selectedCustomerId != -1) {
          this.showLoader(true);
          this.selectedCustomerId = cObj.selectedCustomerId;
          this.showDetail = false;
          this.dataTransfer('list').then(result => {
            this.resetConfigDetail();
            this.unOrderedList = this.orderedList = result;
            this.totalConfigs  = this.orderedList.length;
          });
        }
      });
    },
  }
</script>