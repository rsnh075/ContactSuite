<template>
  <div data-e2e="campaign-manager">
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.campaignmanager.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalDetails + " " + $store.state.settings.campaignmanager.countlabel}}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="openDetail(-1)">{{ $store.state.settings.campaignmanager.addcampaign }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="list"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--5 no-sort--js"></span>
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('Name', $event)" data-sortorder="NONE" v-html="$store.state.settings.campaignmanager.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('RoutingGroup', $event)" data-sortorder="NONE" v-html="$store.state.settings.campaignmanager.collheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('AutoActivate', $event)" data-sortorder="NONE" v-html="$store.state.settings.campaignmanager.collheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('From', $event)" data-sortorder="NONE" v-html="$store.state.settings.campaignmanager.collheads[3]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('Till', $event)" data-sortorder="NONE" v-html="$store.state.settings.campaignmanager.collheads[4]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol @click="clickedOnList">
              <li v-for="campaign in list" :key="campaign.Id" class="list-content__row list-content__row--clickable" @mouseenter="hoverRow($event, campaign.Id)" :data-id="campaign.Id">
                <span class="list-content__row-cell list-content__row-cell--5">
                  <a class="button__icon button__icon-play--small toggle-campaign--js" @click="changeRunning(campaign.Running, campaign)" v-html="getRunningIcon(campaign.Running)"></a>
                </span>
                <span class="list-content__row-cell list-content__row-cell--20 edit-campaign--js">{{ campaign.Name }}</span>
                <span class="list-content__row-cell list-content__row-cell--20 edit-campaign--js">{{ campaign.RoutingGroup }}</span>
                <span class="list-content__row-cell list-content__row-cell--20 edit-campaign--js" v-html="transformToRead(campaign.AutoActivate)"></span>
                <span class="list-content__row-cell list-content__row-cell--15 edit-campaign--js" v-html="transformToDateTime(campaign.From)"></span>
                <span class="list-content__row-cell list-content__row-cell--15 edit-campaign--js" v-html="transformToDateTime(campaign.Till)"></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- CAMPAIGN DETAIL POPUP -->
    <CampaignDetail
      v-if="dataDetail"
      :visible="visible"
      :datadetail="dataDetail"
      @closedetail="resetDetail"
      @savedetail="saveDetail"
      @deletedetail="deleteDetail"
    />
  </div>
</template>

<script>

  import CampaignDetail          from './CampaignDetail.vue';
  import {
          ISOdateTimetoTime,
          ISOdateTimetoDate,
          ISOdateTimetoDateEn
         }                     from './../../use/dateFunctions';
  import { scrollTo }            from './../../use/helperFunctions';
  import { dynamicSort }      from '../../use/sortFunctions';
  import {IPCCCConfigurator} from "../../ipccc/js/configurator";
  import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';

export default {
  name: 'CampaignManager',
  data() {
    return {
      customerId              : -1,
      searchStr               : '',
      sortSetting             : {},
      rawList                 : [],
      list                    : [],
      totalDetails            : null,
      detailStatus            : 'list',
      dataDetail              : null,
      selectedDetailId        : -1,
      selectedDetail          : null,
      storeWatch              : null,
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
    CampaignDetail,
    ExportListToXLSX
  },
  computed: {
    visible() {
      return this.detailStatus != 'list';
    }
  },
  methods: {
    getDataList() {
        IPCCCConfigurator.Request(this.customerId, 'outboundmanager', 'list', null, -1).then(result => {
        this.rawList       = result;
        this.list          = [...this.rawList];
        this.totalDetails  = this.list.length;
        this.showLoader(false);
      }).catch(error => {
        this.showLoader(false);
        console.error('Error: ' + error);
      });
    },
    dataDetailFn(dataOp, id) {
      return new Promise((resolve, reject) => {
        this.showLoader(true);
          IPCCCConfigurator.Request(this.customerId, 'outboundmanager', dataOp, this.dataDetail, id).then(result => {
          resolve(result);
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error('error:', error);
          this.resetDetail();
        });
      });
    },
    openDetail(id) {
      this.dataDetailFn('getdata', id).then(result => {
        this.dataDetail = Object.assign({}, result);
        this.setDetailStatus(id == -1 ? 'new' : 'edit');
      });
    },
    deleteDetail(dataId) {
      this.dataDetailFn('delete', dataId).then(result => {
        let _indexToDelete = this.rawList.findIndex(detail => detail.Id === dataId);
        this.rawList.splice(_indexToDelete, 1);
        this.list          = [...this.rawList];
        this.dataDetail    = null;
        this.resetDetail();
        this.filterList();
      });
    },
    saveDetail(data) {
      this.dataDetail = data;
      this.dataDetailFn('save', data.Id).then(result => {
        this.updateList(result);
        this.resetDetail();
      });
    },
    changeRunning(running, campaign) {
      let _startstop = running ? 'pause' : 'start';
      this.dataDetailFn(_startstop, campaign.Id).then(result => {
        campaign.Running = !running;
        this.updateList(campaign);
      });
    },
    //=========================================================== START DISPLAY DETAIL METHODS
    resetDetail() {
      this.dataDetail = null;
      this.setDetailStatus('list');
    },
    //=========================================================== START DISPLAY LIST METHODS
    getRunningIcon(running) {
      return running ? '&#xF40A;' : '&#xF4DB;';
    },
    transformToRead(val) {
      return val ? this.$store.state.settings.campaignmanager.autoactivation[0] : this.$store.state.settings.campaignmanager.autoactivation[1]
    },
    transformToDateTime(isodatetime) {
      let _date = (this.$store.state.browserLanguage == 'nl') ? ISOdateTimetoDate(isodatetime) : ISOdateTimetoDateEn(isodatetime),
          _time = ISOdateTimetoTime(isodatetime);
      return _date + ' ' + _time;
    },
    setDetailStatus(newVal) {
      this.detailStatus = newVal;
    },
    hoverRow(evt, campaignId) {
      evt.stopPropagation();
      this.selectedDetailId = campaignId;
    },
    clickedOnList(evt) {
      let _target      = evt.target,
          _trigger     = [..._target.classList].find(cls => cls.indexOf('--js') != -1),
          _detailIndex = this.rawList.findIndex(detail => detail.Id == this.selectedDetailId),
          _detail      = this.rawList[_detailIndex];

      if(_trigger === 'toggle-campaign--js') {
        const _runningForSave = !_detail.Running
        //todo save campaign with _runningForSave
      }
      if(_trigger === 'edit-campaign--js') {
        this.openDetail(_detail.Id);
      }
    },
    updateList(data) {
      let _IndexToUpdate = -1;
      this.totalDetails = 0;
      this.rawList.map((detail, index) => {
        if(detail.Id == data.Id) {
          _IndexToUpdate = index;
        }
      });
      if(_IndexToUpdate != -1) {
        this.rawList[_IndexToUpdate] = data;
      } else {
        this.rawList.unshift(data);
      }

      this.list = [...this.rawList];
      this.filterList();

      setTimeout(() => {
        this.setHighlightedRow(data.Id);
      }, 500);
      this.showLoader(false);
    },
    filterList() {
      this.list         = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
      this.totalDetails = this.list.length;
      this.sortColumn();
    },
    filterListOnString(list, str) {
      if(str != '') {
        let _rawList = [...list],
            _keys;
        return _rawList.filter(item => {
          _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                  item['RoutingGroup'].toLowerCase().indexOf(str) != -1
          return _keys;
        });
      } else {
        return [...list];
      }
    },
    sortColumn(key, e = null) {
      let _order,
          _t;
      this.setHighlightedRow(-2);

      if(e != null) {
        _t     = e.target;
        _order = _t.getAttribute('data-sortOrder');
        document.querySelectorAll('.list-content__row--header > span').forEach( a => a.classList.contains('no-sort--js') ? a : a.setAttribute('data-sortorder', 'NONE'));
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
          this.list.sort(dynamicSort(key));
          if(e != null)
            _t.setAttribute('data-sortOrder', 'ASC');
          break;
        case 'ASC':
          this.list.sort(dynamicSort('-' + key));
          if(e != null)
            _t.setAttribute('data-sortOrder', 'DES');
          break;
        case 'DES':
          this.list = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
          this.totalDetails = this.list.length;
          if(e != null)
            _t.setAttribute('data-sortOrder', 'NONE');
          break;
      }
    },
    setHighlightedRow(id) {
      let _wrapper = null;
      document.querySelectorAll('[data-id]').forEach(el => {
        _wrapper = el.parentElement.parentElement;
        if (el.getAttribute('data-id') == id) {
          el.classList.add('list-content__row--mutated');
          scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
        } else
          el.classList.remove('list-content__row--mutated');
      });
      if(id == -2 && _wrapper !== null)
        scrollTo(_wrapper, 0, 200);
    },
    //=========================================================== START DATA FOR MODAL
    //TODO
  },
  mounted() {
    this.customerId    = this.$store.getters.getCustomerInfo().selectedCustomerId;

    if(this.customerId !== -1) {
      this.getDataList();
    }

    this.storeWatch = this.$store.watch(() => this.$store.getters.getCustomerInfo, cObj => {
      if(cObj.selectedCustomerId != -1) {
        this.customerId = cObj.selectedCustomerId;
        this.setDetailStatus('list');
        this.getDataList();
      }
    });
  },
  beforeUnmount() {
    this.storeWatch();
  }
}
</script>
