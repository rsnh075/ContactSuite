<template>
  <div data-e2e="destinations-list">
    <!-- LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.extensions.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{ totalDetails + " " + $store.state.settings.extensions.countlabel }}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="addDetail()">{{ $store.state.settings.extensions.adddetail }}</button>
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
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('PhoneNumber', $event)" data-sortorder="NONE" v-html="$store.state.settings.extensions.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Title', $event)" data-sortorder="NONE" v-html="$store.state.settings.extensions.collheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('Connections', $event)" data-sortorder="NONE" v-html="$store.state.settings.extensions.collheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('CallTimeout', $event)" data-sortorder="NONE" v-html="$store.state.settings.extensions.collheads[3]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="detail in list" class="list-content__row list-content__row--clickable" @click="showDetail(detail.Id)" :data-id="detail.Id" :data-clickable="isClickable(detail.Id)">
                <span class="list-content__row-cell list-content__row-cell--20">{{ detail.PhoneNumber }}</span>
                <span class="list-content__row-cell list-content__row-cell--30">{{ detail.Title }}</span>
                <span class="list-content__row-cell list-content__row-cell--20">{{ detail.Connections }}</span>
                <span class="list-content__row-cell list-content__row-cell--30">{{ filterCallTimeoutVal(detail.CallTimeout) }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Destination POPUP -->
    <Destination
      :visible="detailStatus"
      :data="dataDetail"
      :selectedId="this.selectedId"
      @close="closeDetail"
      @save="saveDetail"
      @delete="deleteDetail"
    />

  </div>
</template>

<script>

import Destination          from './Destination.vue';
import { dynamicSort }      from '../../use/sortFunctions';
import { scrollTo }         from './../../use/helperFunctions';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import ExportListToXLSX     from '../uielements/ExportListToXLSX.vue';

export default {
  name: 'DestinationsList',
  data() {
    return {
      selectedCustomerId : -1,
      searchStr          : '',
      sortSetting        : {},
      rawList            : [],
      list               : [],
      totalDetails       : null,
      detailStatus       : false,
      dataDetail         : null,
      selectedId         : -1,
      selectedTitle      : '',
      storeWatch         : null,
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
    Destination,
    ExportListToXLSX
  },
  methods: {
    filterCallTimeoutVal: function(value) {
      if(value == -1) return 0;
      return value;
    },
    isClickable(id) {
      return Math.sign(id) != -1 ? 'clickable' : 'not-clickable';
    },
    preFilter(list) {
      return list.filter(item => item.PhoneNumber.length > 7);
    },
    getDataList() {
      IPCCCConfigurator.Request(this.selectedCustomerId, 'extensions', 'readall', null, -1)
        .then(result => {
        let _prefilterList = [];
        _prefilterList     = result;
        this.rawList       = this.preFilter(_prefilterList);
        this.list          = [...this.rawList];
        this.totalDetails  = this.list.length;
        this.showLoader(false);
        this.defaultSortOrder();
      }).catch(error => {
        console.error('Error: ' + error);
        this.showLoader(false);
      });
    },
    getDataDetail(dataOp) {
      return new Promise((resolve, reject) => {
        // let _absoluteSelectedId = Math.abs(this.selectedId);
        let _absoluteSelectedId = this.selectedId;
        IPCCCConfigurator.Request(this.selectedCustomerId, 'extensions', dataOp, this.dataDetail, _absoluteSelectedId)
            .then(result => {
          this.showLoader(false);
          if(Array.isArray(result))
            result = result[0];
          resolve(result);
        }).catch(error => {
          this.showLoader(false);
          reject(console.error('Error: ' + error));
        });
      });
    },
    showDetail(id) {
      if(Math.sign(id) != -1) {
        this.showLoader(true);
        this.selectedId      = id;
        this.dataDetail      = null;
        this.getDataDetail('readone').then(result => {
          this.dataDetail    = Object.assign({}, result);
          this.detailStatus  = true;
        });
      }
    },
    addDetail() {
      this.showLoader(true);
      this.selectedId      = -1;
      this.getDataDetail('readnew').then(result => {
        this.dataDetail    = Object.assign({}, result);
        this.dataDetail.CallTimeout = 0;
        this.detailStatus  = true;
      });
    },
    deleteDetail(data) {
      this.showLoader(true);
      this.selectedId = data.Id;
      this.dataDetail = data;
      this.getDataDetail('delete').then(result => {
        this.dataDetail    = null;
        this.detailStatus  = false;
        let _indexToDelete = this.rawList.findIndex(detail => detail.Id === data.Id);
        this.rawList.splice(_indexToDelete, 1);
        this.list          = [...this.rawList];
        this.filterList();
      });
    },
    saveDetail(data) {
      this.showLoader(true);
      this.dataDetail = data;
      this.selectedId = data.Id;
      this.getDataDetail('save').then(result => {
        this.dataDetail    = null;
        this.detailStatus  = false;
        this.updateList(result);
      });
    },
    closeDetail() {
      this.dataDetail      = null;
      this.detailStatus    = false;
    },
    //=========================================================== START DISPLAY LIST METHODS
    updateList(data) {
      let _IndexToSave = -1;
      this.totalDetails = 0;
      this.rawList.map((detail, index) => {
        if(detail.Id == data.Id) {
          _IndexToSave = index;
        }
      });
      if(_IndexToSave == -1)
        this.rawList.push(data);
      else
        this.rawList[_IndexToSave] = data;

      this.list         = [...this.rawList];
      this.totalDetails = this.list.length;

      this.filterList();
      if(this.list.findIndex(detail => detail.Id === data.Id) != -1) {
        setTimeout(() => {
          this.setHighlightedRow(data.Id);
        }, 500);
      }
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
          _keys = item['Title'].toLowerCase().indexOf(str) != -1 ||
            item['PhoneNumber'].toLowerCase().indexOf(str) != -1
          return _keys;
        });
      } else {
        return [...list];
      }
    },
    defaultSortOrder() {
      this.sortSetting.order    = 'NONE';
      this.sortSetting.key      = 'PhoneNumber';
      this.sortColumn();
    },
    sortColumn(key, e = null) {
      let _order,
          _t;
      this.setHighlightedRow(-2);

      if(e != null) {
        _t     = e.target;
        _order = _t.getAttribute('data-sortOrder');
        document.querySelectorAll('.list-content__row--header > span').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
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
  },
  mounted() {
    this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

    if(this.selectedCustomerId !== -1)
      this.getDataList();

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
      this.showLoader(true);
      this.selectedCustomerId   = cObj.selectedCustomerId;
      this.closeDetail();
      this.getDataList();
    });
  },
  beforeUnmount() {
    this.storeWatch();
  }
}
</script>