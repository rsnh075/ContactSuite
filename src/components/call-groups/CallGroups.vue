<template>
  <div data-e2e="CallGroups">
    <!-- Q LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.dynamiq.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalQueues + " " + $store.state.settings.dynamiq.countlabel}}
          </div>
          <div class="grid--push" v-if="rightToCreateCallGroups">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="addQueue()">{{ $store.state.settings.dynamiq.addqueue }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="queueList"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--5" @click="sortColumn('RoutinggroupType', $event)" data-sortorder="NONE"></span>
              <span class="list-content__row-cell list-content__row-cell--35" @click="sortColumn('Name', $event)" data-sortorder="NONE" v-html="$store.state.settings.dynamiq.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('UserCount', $event)" data-sortorder="NONE" v-html="$store.state.settings.dynamiq.collheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('QueueLength', $event)" data-sortorder="NONE" v-html="$store.state.settings.dynamiq.collheads[3]"></span>
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('Distribution', $event)" data-sortorder="NONE" v-html="$store.state.settings.dynamiq.collheads[4]"></span>
              <span class="list-content__row-cell list-content__row-cell--10" @click="sortColumn('Priority', $event)" data-sortorder="NONE" v-html="$store.state.settings.dynamiq.collheads[5]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="queue in queueList" :key="queue.Id" :class="['list-content__row list-content__row', {'list-content__row list-content__row--clickable' : rightToOpenThisType(queue.RoutinggroupType)}]" @click="rightToView(queue.RoutinggroupType, queue.Id, queue.Name)">
                <span class="list-content__row-cell list-content__row-cell--5 list-content__row-cell--font-icon">{{ queue.RoutinggroupType == 1 ? '&#xF2CE;' : '&#xF61C;' }}</span>
                <span class="list-content__row-cell list-content__row-cell--35">{{ queue.Name }}</span>
                <span class="list-content__row-cell list-content__row-cell--15">{{ queue.UserCount }}</span>
                <span class="list-content__row-cell list-content__row-cell--15">{{ ifMinOne(queue.QueueLength) }}</span>
                <span class="list-content__row-cell list-content__row-cell--20" v-html="translateDistribution(queue.Distribution, $store.state.settings.dynamiq.distributionread, queue.Groupring)"></span>
                <span class="list-content__row-cell list-content__row-cell--10">{{ queue.Priority }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>


    <!-- Q DETAIL POPUP -->
    <dynamiq-detail :visible="detailStatus"
      :queueId="selectedQueueId"
      :custId="selectedCustomerId"
      :rightToAdd="rightToAddToCallGroups"
      :routingGroupTypeToAdd="routingGroupTypeToAdd"
      :rightToCreateCallGroups="rightToCreateCallGroups"
      :rightToCRUDSupportGroup="rightToCRUDSupportGroup"
      :routinggroupnames="routingGroupNames"
      @closeQueue="closeQueue"
      @saveQueue="saveQueue"
    />

    <!-- PROMPT POPUP -->
    <Prompt-loader />
  </div>
</template>

<script>
  import DynamiqDetail      from './Dynamiq-detail.vue';
  import PromptLoader       from '../dialogs/Promptloader.vue';
  import { scrollTo }        from '../../use/helperFunctions';
  import { dynamicSort }      from '../../use/sortFunctions';
  import { IPCCCConfigurator } from '../../ipccc/js/configurator';
  import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';

  const ROUTINGGROUPTYPE = {
    'None' : -1,
    'Users' : 1,
    'Numbers' : 2
  }

  const ROUTINGGROUPTYPETOADD = {
    'Unknown' : -1, //Due to rights for both Devices and Agents
    'AddUsers' : 1,
    'AddNumbers' : 2
  }

  export default {
    name: 'CallGroups',
    data() {
      return {
        selectedCustomerId     : -1,
        totalQueues            : 0,
        searchStr              : '',
        sortSetting            : {},
        rawList                : [],
        queueList              : [],
        detailStatus           : false,
        selectedQueueId        : -1,
        routingGroupTypeToAdd  : -2,
        storeWatch             : null,
        routingGroupNames      : [],
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
    inject: ['showLoader'],
    components: {
      PromptLoader,
      DynamiqDetail,
      ExportListToXLSX
    },
    computed: {
      rightToAddAgents() {
        return this.$store.getters.getPermission('WachtrijAdmin') || this.roleSupervisor;
      },
      rightToAddDevices() {
        return this.$store.getters.getPermission('BestemmingenToestellen');
      },
      roleSupervisor() {
        return this.$store.getters.getPermission('WachtrijSupervisor');
      },
      rightToAddToCallGroups() {
        return this.rightToAddAgents || this.rightToAddDevices;
      },
      rightToCreateCallGroups() {
        return this.$store.getters.getPermission('BestemmingenToestellen') || this.$store.getters.getPermission('WachtrijAdmin');
      },
      rightToCRUDSupportGroup() {
        return this.$store.getters.getPermission('BestemmingenToestellen') || this.$store.getters.getPermission('WachtrijAdmin') || this.$store.getters.getPermission('WachtrijSupervisor')
      },
    },
    methods: {
      translateDistribution(val, langTxt, grpRing) {
        if(grpRing) return langTxt[0];
        else if(val == 0) return langTxt[1];
        else if(val == 1) return langTxt[2];
        else if(val == 4) return langTxt[3];
        else return langTxt[1];
      },
      ifMinOne(val) {
        return (val == -1) ? 0 : val;
      },
      getRoutingGroups() {
          IPCCCConfigurator.Request(this.selectedCustomerId, 'DynamicQ', 'readall', null, -1).then(result => {
          this.rawList           = result;
          this.routingGroupNames = this.rawList.map(rg => rg.Name);
          this.queueList         = this.rawList;
          this.totalQueues       = this.queueList.length;
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
        });
      },
      addQueue() {
        this.selectedQueueId     = -1;
        this.detailStatus        = true;
      },
      showQueue(id, name) {
        this.setHighlightedRow(-2);
        this.selectedQueueId     = id;
        this.detailStatus        = true;
      },
      closeQueue() {
        this.selectedQueueId     = -1;
        this.detailStatus        = false;
      },
      saveQueue(queueDetail) {
        this.showLoader(true);
        let _id   = queueDetail.Id,
            _data = queueDetail;
          IPCCCConfigurator.Request(this.selectedCustomerId, 'DynamicQ', 'save', _data, _id).then(result => {
            this.updateQueueList(result);
          }).catch(error => {
            console.error('Error: ' + error);
            this.showLoader(false);
          }
        );
      },
      rightToView(rgType, id, name) {
        if(this.rightToOpenThisType(rgType))
          return this.showQueue(id, name);
      },
      rightToOpenThisType(rgType) {
        return (rgType == ROUTINGGROUPTYPE.Users && this.rightToAddAgents) ? true : (rgType == ROUTINGGROUPTYPE.Numbers && this.rightToAddDevices) ? true : false;
      },
      updateQueueList(savedData) {
        let _saveddata = {
          Distribution : savedData.Distribution,
          Id           : savedData.Id,
          InUse        : savedData.InUse,
          Name         : savedData.Name,
          Priority     : savedData.Priority,
          QueueLength  : savedData.QueueLength,
          UserCount    : savedData.UserCount,
          Groupring    : savedData.Groupring,
          RoutinggroupType : savedData.RoutinggroupType
        }

        let _qdetailToChangeIndex = -1;
        this.totalQueues          = 0;
        this.rawList.map((qdetail, index) => {
          if(qdetail.Id == savedData.Id) {
            _qdetailToChangeIndex = index;
          }
        });
        if(_qdetailToChangeIndex != -1 && savedData.InUse) {
          this.rawList[_qdetailToChangeIndex] = _saveddata;
        } else if (_qdetailToChangeIndex != -1 && !savedData.InUse) {
          this.rawList.splice(_qdetailToChangeIndex, 1);
        } else {
          this.rawList.push(_saveddata);
          _qdetailToChangeIndex = this.rawList.findIndex(rg => rg.Id == _saveddata.Id);
        }
        this.routingGroupNames = this.rawList.map(rg => rg.Name);

        this.filterList();
        this.closeQueue();

        if(_qdetailToChangeIndex != -1)
          setTimeout(() => {
            this.setHighlightedRow(savedData.Id);
          }, 500);

        this.showLoader(false);
      },
      setRoutingGroupTypeToAdd() {
        if(this.rightToAddToCallGroups) {
          if(this.rightToAddAgents && this.rightToAddDevices)
            this.routingGroupTypeToAdd = ROUTINGGROUPTYPETOADD.Unknown;
          else if(this.rightToAddAgents)
            this.routingGroupTypeToAdd = ROUTINGGROUPTYPETOADD.AddUsers;
          else if(this.rightToAddDevices)
            this.routingGroupTypeToAdd = ROUTINGGROUPTYPETOADD.AddNumbers;
        }
      },
      //=========================================================== START DISPLAY LIST METHODS
      filterList() {
        this.setHighlightedRow(-2)
        this.queueList    = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
        this.totalQueues  = this.queueList.length;
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list],
              _keys;
          return _rawList.filter(item => {
            _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                    item['Priority'].toString().indexOf(str) != -1
            return _keys;
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
          document.querySelectorAll('.list-content__row--header > span').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
          this.sortSetting = {
            'key': key,
            'order' : _order
          }
          this.setHighlightedRow(-2);
        } else {
          _order = this.sortSetting.order;
          key    = this.sortSetting.key;
        }

        switch(_order) {
          case 'NONE':
            this.queueList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.queueList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.queueList = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
            this.totalQueues = this.queueList.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setHighlightedRow(id) {
        let _wrapper = null;
        document.querySelectorAll('[data-queueId]').forEach(el => {
          _wrapper = el.parentElement.parentElement;
          if (el.getAttribute('data-queueId') == id) {
            el.classList.add('list-content__row--mutated');
            scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
          } else
            el.classList.remove('list-content__row--mutated');
        });
        if(id == -2 && _wrapper !== null)
          scrollTo(_wrapper, 0, 200);
      },
    },
    mounted() {
      this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.setRoutingGroupTypeToAdd();

      if(this.selectedCustomerId != -1)
        this.getRoutingGroups();

      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        if(cObj.selectedCustomerId != -1) {
          this.showLoader(true);
          this.selectedCustomerId = cObj.selectedCustomerId;
          this.getRoutingGroups();
        }
      });
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>
