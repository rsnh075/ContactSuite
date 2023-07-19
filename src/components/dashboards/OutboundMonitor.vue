<template>
  <div data-e2e="outbound-monitor">
    <ContextMenu
      :visability  = "contextMenuVisability"
      :position    = "contextPosition"
      :itemList    = "contextMenuItems"
      @mouseisout  = "contextMenu"
    >
      <template v-slot="{ row }">
        <div class="context-item" @click="handleContextAction(row.eventtype)">
          <span v-if="row.icon !== ''" class="context-item__icon" v-html="'&#x' + row.icon"></span>
          <span :class="['context-item__label', {'context-item__label--header' : row.eventtype === 'null'}]">{{ row.label }}</span>
        </div>
      </template>
    </ContextMenu>
    <CampaignCsvUploader
      :visible="showCampaignCsvUploader"
      :campaignid="selectedCampaignId"
      :campaignname="selectedCampaignName"
      :customerid="customerId"
      @closecampaigncsvuploader="closeCampaignCsvUploader"
    />
    <!-- <div v-if="groupMetrics" class="vlist-ribbon"> -->
    <div class="vlist-ribbon">
      <div class="vlist-ribbon__group--left">
        <div class="vlist-ribbon__group">
          <div class="vlist-ribbon__item vlist-ribbon__item--select">
            <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
              <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.outboundDashboard.searchtxt" @keyup="filterList()">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="vlist-wrapper">
      <div class="vlist-header__row--bottomborder">
        <div class="vlist__row vlist-header__row">
          <span @click="sortColumn('Name', $event)"       data-sortorder="NONE" class="vlist__cell--name">{{ $store.state.settings.outboundDashboard.tableheadtxt[0] }}</span>
          <span @click="sortColumn('IsRunning', $event)"  data-sortorder="NONE" class="vlist__cell--isrunning">{{ $store.state.settings.outboundDashboard.tableheadtxt[1] }}</span>
          <span @click="sortColumn('Total', $event)"      data-sortorder="NONE" class="vlist__cell--total">{{ $store.state.settings.outboundDashboard.tableheadtxt[2] }}</span>
          <span @click="sortColumn('InProgress', $event)" data-sortorder="NONE" class="vlist__cell--inprogress">{{ $store.state.settings.outboundDashboard.tableheadtxt[3] }}</span>
          <span @click="sortColumn('Todo', $event)"       data-sortorder="NONE" class="vlist__cell--todo">{{ $store.state.settings.outboundDashboard.tableheadtxt[4] }}</span>
          <span @click="sortColumn('Finished', $event)"   data-sortorder="NONE" class="vlist__cell--finished">{{ $store.state.settings.outboundDashboard.tableheadtxt[5] }}</span>
          <span @click="sortColumn('Errors', $event)"     data-sortorder="NONE" class="vlist__cell--errors">{{ $store.state.settings.outboundDashboard.tableheadtxt[6] }}</span>
          <span @click="sortColumn('Progress', $event)"   data-sortorder="NONE" class="vlist__cell--progress">{{ $store.state.settings.outboundDashboard.tableheadtxt[7] }}</span>
        </div>
      </div>

      <VirtualListViewer class="vlist-content" id="vlistContent"
        :data       = "outboundCampaignMetrics"
        rowClasses  = "vlist-content__row vlist-content__row--clickable"
        >
        <template v-slot="{ row, startindex, index }">
          <div :class="['vlist__row', {'vlist__row--zebra' : index % 2 == 0}]" :key="row.Id + (Math.random() * 100)">
            <span class="vlist__cell--name" v-html="row.Name"></span>
            <span class="vlist__cell--isrunning"><span class="vlist__cell--statusdot" :style="{backgroundColor: getStatusColor(row.IsRunning)}"></span>{{ getStatusLbl(row.IsRunning) }}</span>
            <span class="vlist__cell--total">{{ row.Total }}</span>
            <span class="vlist__cell--inprogress">{{ row.InProgress }}</span>
            <span class="vlist__cell--todo">{{ row.Todo }}</span>
            <span class="vlist__cell--finished">{{ row.Finished }}</span>
            <span class="vlist__cell--errors">{{ row.Errors }}</span>
            <span class="vlist__cell--progress">{{ row.progress }}&nbsp;%</span>
            <div class="vlist__cell--contextmenu" @click="contextMenu($event, row.Id, row.IsRunning)">&#xF1D9;</div>
          </div>
        </template>
      </VirtualListViewer>

    </div>
    <div class="vlist-footer">
      <div class="vlist__row">
        <span class="vlist__cell--name">{{ totals.Name }}&nbsp;{{ $store.state.settings.outboundDashboard.campaigntotalslbl }}</span>
        <span class="vlist__cell--isrunning">{{ totals.IsRunning }}&nbsp;{{ $store.state.settings.outboundDashboard.activecampaigntotalslbl }}</span>
        <span class="vlist__cell--total">{{ totals.Total }}</span>
        <span class="vlist__cell--inprogress">{{ totals.InProgress }}</span>
        <span class="vlist__cell--todo">{{ totals.Todo }}</span>
        <span class="vlist__cell--finished">{{ totals.Finished }}</span>
        <span class="vlist__cell--errors">{{ totals.Errors }}</span>
        <span class="vlist__cell--progress">&nbsp;</span>
      </div>
    </div>

  </div>
</template>

<script>
  import ContextMenu        from './../v2_components/ContextMenu.vue';
  import VirtualListViewer   from './../uielements/VirtualListViewer.vue';
  import CampaignCsvUploader from './CampaignCsvUpLoader.vue';
  import { dynamicSort }     from '../../use/sortFunctions';
  import { IPCCCConfigurator } from '../../ipccc/js/configurator';
  import { IPCCCDashboard }   from './../../ipccc/js/dashboard.js';
  import BoxProps, { ModalType } from '../../types/BoxProps';

  export default {
    name: 'OutboundMonitorV2',
    data: () => {
      return {
        customerId                 : -1,
        searchStr                  : '',
        sortSetting                : {},
        contextMenuVisability      : false,
        contextPosition            : {
          x : 0,
          y : 0,
        },
        contextMenuItems           : [],

        outboundDashboardSubscribe : null,
        totals                     : [],
        rawOutboundCampaignMetrics : null,
        outboundCampaignMetrics    : [],
        showCampaignCsvUploader    : false,
        currentCampaignId          : -1,
        selectedCampaignId         : -1,
        selectedCampaignName       : ''
      }
    },
    inject: ['showLoader', 'showModalDialog'],
    components: {
      ContextMenu,
      VirtualListViewer,
      CampaignCsvUploader
    },
    directives: {
      mounted: {
        inserted: function(el, binding) {
          binding.value;
        }
      }
    },
    computed: {
    },
    methods: {
      contextMenu(evt, campaignId = -1, isrunning = false) {
        if(evt.type.toLowerCase() === 'mouseisout') {
          this.currentCampaignId         = -1
          this.contextMenuVisability     = false;
        } else {
          this.currentCampaignId         = campaignId;
          this.contextMenuItems[1].icon  = isrunning ? 'F4DB' : 'F40A';
          this.contextMenuItems[1].label = isrunning ? this.$store.state.settings.outboundDashboard.contextmenu[2] : this.$store.state.settings.outboundDashboard.contextmenu[1];
          this.contextMenuVisability     = true;
          this.contextPosition           = {
                                             x : evt.clientX,
                                             y : evt.clientY,
                                           };
        }
      },
      handleContextAction(eventType) {
        switch(eventType) {
          case 'startstop':
            this.setRunningStatus(this.currentCampaignId);
            this.contextMenuVisability = false;
            break;
          case 'upload':
            this.openCampaignCsvUploader(this.currentCampaignId);
            this.contextMenuVisability = false;
            break;
          case 'clear':
            this.clearCampaignList(this.currentCampaignId);
            this.contextMenuVisability = false;
            break;
          default:
            return false;
        }
      },
      setRunningStatus(id) {
        this.showLoader(true);
        let _indexOfCampaign = this.outboundCampaignMetrics.findIndex(camp => camp.Id == id),
            _startstop       = this.outboundCampaignMetrics[_indexOfCampaign].IsRunning ? 'pause' : 'start';

        IPCCCConfigurator.Request(this.customerId, 'outboundmanager', _startstop, null, id).then(_ => {
          this.outboundCampaignMetrics[_indexOfCampaign].IsRunning = !this.outboundCampaignMetrics[_indexOfCampaign].IsRunning;
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
          this.showLoader(false);
        });
      },
      openCampaignCsvUploader(id) {
        let _indexOfCampaign         = this.outboundCampaignMetrics.findIndex(camp => camp.Id == id);
        this.selectedCampaignId      = this.outboundCampaignMetrics[_indexOfCampaign].Id;
        this.selectedCampaignName    = this.outboundCampaignMetrics[_indexOfCampaign].Name;
        this.showCampaignCsvUploader = true;
      },
      closeCampaignCsvUploader() {
        this.selectedCampaignId      = -1;
        this.selectedCampaignName    = '';
        this.showCampaignCsvUploader = false;
      },
      clearCampaignList(id) {
          const boxProps = new BoxProps(ModalType.Confirm, this.$store.state.settings.dialog.dialogconfirmheader, this.$store.state.settings.dialog.dialogconfirmaction);
          boxProps.confirmFn = () => {this.clearCampaignListOnConfirm(id);};
          this.showModalDialog(boxProps);
      },
      clearCampaignListOnConfirm(id) {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'outboundmanager', 'clearlist', null, id).then(_ => {
          let _indexOfCampaign = this.outboundCampaignMetrics.findIndex(camp => camp.Id == id);
          this.outboundCampaignMetrics[_indexOfCampaign].Total     = 0;
          this.outboundCampaignMetrics[_indexOfCampaign].Todo      = 0;
          this.outboundCampaignMetrics[_indexOfCampaign].Finished  = 0;
          // this.toggleTools();
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
          this.showLoader(false);
        });
      },
      //----------------------------------------------------------HELPER COLUMN FUNCTIONS
      getStatusColor(isrunning) {
        return '#' + String(isrunning ? '21892F' : 'F26B36');
      },
      getStatusLbl(isrunning) {
        return isrunning ? this.$store.state.settings.outboundDashboard.statuslbl[0] : this.$store.state.settings.outboundDashboard.statuslbl[1];
      },
      getSetToStatusLbl(isrunning) {
        return isrunning ? this.$store.state.settings.outboundDashboard.lineIconLabel[0] : this.$store.state.settings.outboundDashboard.lineIconLabel[1];
      },
      calcProgress(campaign) {
        return campaign.Total !== 0 ? Math.round(campaign.Finished/(campaign.Total + campaign.Errors) * 100) : '-';
      },
      getData(result) {
        if(typeof result !== 'undefined') {
            this.rawOutboundCampaignMetrics = [...result];
            this.rawOutboundCampaignMetrics.forEach((campaign, index) => {
            this.rawOutboundCampaignMetrics[index].progress = this.calcProgress(campaign);
            });
        } else {
            this.rawOutboundCampaignMetrics = [];
            this.outboundCampaignMetrics    = [];
            this.totals                     = [];
        }
        this.filterList();
        this.sortColumn();
        this.showLoader(false);
      },
      filterList() {
        if(this.rawOutboundCampaignMetrics.length > 0) {
          this.outboundCampaignMetrics = this.filterListOnString(this.rawOutboundCampaignMetrics, this.searchStr.toLowerCase());
          this.setTotals();
        } else {
          this.outboundCampaignMetrics = [];
          this.totals                  = [];
        }
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
            return item.Name.toLowerCase().indexOf(str) != -1
          });
        } else {
          return [...list];
        }
      },
      sortColumn(key, e = null) {
        let _order,
            _t;

        if(e != null) {
          _t     = e.currentTarget;
          _order = _t.getAttribute('data-sortorder');
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
            this.outboundCampaignMetrics.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.outboundCampaignMetrics.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.outboundCampaignMetrics = this.filterListOnString(this.rawOutboundCampaignMetrics, this.searchStr.toLowerCase());
            this.setTotals();
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setTotals() {
        this.totals             = [];
        this.totals             = this.outboundCampaignMetrics.reduce((acc, campaign) => {
          return {
            Name          : acc.Name          + 1,
            IsRunning     : acc.IsRunning     + campaign.IsRunning ? 1 : 0,
            Total         : acc.Total         + campaign.Total,
            InProgress    : acc.InProgress    + campaign.InProgress,
            Todo          : acc.Todo          + campaign.Todo,
            Finished      : acc.Finished      + campaign.Finished,
            Errors        : acc.Errors        + campaign.Errors
          }
        }, {
          Name          : 0,
          IsRunning     : 0,
          Total         : 0,
          InProgress    : 0,
          Todo          : 0,
          Finished      : 0,
          Errors        : 0
        });
      },

    },
    created() {
      this.contextMenuItems = [
        {
          icon      : '',
          label     : this.$store.state.settings.outboundDashboard.contextmenu[0],
          eventtype : 'null',
          active    : true,
        }, {
          icon      : 'F40A',
          label     : this.$store.state.settings.outboundDashboard.contextmenu[1],
          eventtype : 'startstop',
          active    : true,
        }, {
          icon      : 'F552',
          label     : this.$store.state.settings.outboundDashboard.contextmenu[3],
          eventtype : 'upload',
          active    : true,
        }, {
          icon      : 'F1C0',
          label     : this.$store.state.settings.outboundDashboard.contextmenu[4],
          eventtype : 'clear',
          active    : true,
        }
      ];
    },
    mounted() {
      this.showLoader(true);
      this.customerId     = this.$store.getters.getCustomerInfo().customerId;
      if(this.customerId != -1) {
          IPCCCDashboard.Subscribe('OUTBOUNDSTATUS', this.getData);
      }
    },
    beforeUnmount() {
        IPCCCDashboard.Desubscribe('OUTBOUNDSTATUS', this.getData);
        this.totals          = [];
    }
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/functions" as fn;
  @use "@/scss/includes/globals";

  .vlist-wrapper,
  .vlist-ribbon,
  .vlist-footer {
    position: absolute;
    right: 20px;
    left: 20px;
    background-color: globals.$color-white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
  }

  .vlist-ribbon {
    display: flex;
    top: 20px;
    height: 80px;
    z-index: 200;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    background-color: fn.tint(globals.$color-black, 95%);
    .vlist-ribbon__group {
      display: flex;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      height: 100%;
      &:not(:last-child):after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        border-left: 1px solid globals.$color-gray20;
      }
      &--left,
      &--right {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
      }
      &--left {
        justify-content: flex-start;
      }
      &--right {
        justify-content: flex-start;
      }
      &--one {
        width: 80px;
        &--check {
          width: 100px;
        }
      }
      &--two {
        width: 160px;
      }
      &--three {
        width: 240px;
      }
      .vlist-ribbon__item {
        float: left;
        width: 80px;
        padding: 0 20px;
        .form-textfield--search,
        .form-multiselectfield,
        .form-selectfield {
          margin-top: -2px;
          .multiselect {
            margin-top: -8px !important;
          }
          select {
            margin-left: 0;
            margin-top: -6px;
          }
        }
      }
      .vlist-ribbon__item--button {
        min-width: 80px;
        max-width: 80px;
        div {
          color: globals.$color-performance;
          &:hover {
            color: fn.tint(globals.$color-performance, 30%);
            background-color: transparent;
          }
        }
        label {
          display: block;
          color: globals.$color-gray35;
          font-family: 'Open Sans SemiBold', sans-serif;
          font-size: .7rem;
          width: 100%;
          margin-left: -30%;
          width: calc(100% + 30px);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
        }
      }
      .vlist-ribbon__item--select {
        min-width: 300px;
        max-width: 300px;
      }
      .vlist-ribbon__item--range {
        min-width: 120px;
        max-width: 120px;
      }
    }
  }

  .multiselect__placeholder {
    opacity: 1 !important;
  }

  .vlist-ribbon__label {
    margin: -4px 0 0 0;
    padding: 0;
    font-size: .8em;
  }

  .vlist-ribbon__item--select-label {
    margin: 6px 0 0 0;
    padding: 0;
    font-size: .8em;
  }

  .vlist-wrapper {
    top: 120px;
    bottom: 75px;
    z-index: 100;
  }

  .vlist-footer {
    bottom: 20px;
    height: 50px;
    z-index: 50;
    padding-right: 18px;
    span[class^="vlist__cell"] {
      position: relative;
      display: block;
      float: left;
      padding: 0 2px;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: .9rem;
      height: 50px;
      line-height: 50px;
    }
  }

  .vlist-content {
    width: 100%;
    background-color: globals.$color-white;
    height: calc(100% - 46px);
    min-height: calc(100% - 46px);
    overflow-x: hidden;
    overflow-y: scroll;
  }


  .vlist__row {
    position: relative;
    height: 45px;
    line-height: 45px;
    width: 100%;
    span[class^="vlist__cell"] {
      position: relative;
      display: block;
      float: left;
      padding: 0 6px;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: .9rem;
    }
    &--statusalert:before {
      content: '';
      position: absolute;
      top: 0;
      right: calc(100% - 4px);
      bottom: 0;
      left: 0;
      background-color: globals.$color-warning;
      z-index: 10;
    }
  }

  .vlist-header__row {
    border-bottom: 1px solid globals.$color-gray15;
    padding-right: 18px;
  }

  .vlist-content__row {
    height: 45px;
    line-height: 45px;
    color: globals.$color-gray60;
    font-size: .9rem;
    width: 100%;
  }

  .vlist__row--zebra {
    background-color: globals.$color-gray5;
  }

  .vlist__row--clickabl[data-clickable="not-clickable"] {
    cursor: default;
  }

  .vlist__cell--pin {
    font-family: 'Material Design Icons';
    color: globals.$color-gray40;
    width: 20px;
    cursor: pointer;
    &-pinned {
      color: globals.$color-gray80 !important;
    }
  }

  .vlist__cell--icon {
    width: 45px;
    &-initials {
      position: relative;
      display: block;
      float: left;
      width: 35px;
      height: 35px;
      line-height: 35px;
      margin: 5px 0 0 3px;
      text-align: center;
      color: globals.$color-white;
      background-color: globals.$color-gray20;
      border-radius: 50%;
    }
    &-iscoached {
      position: absolute !important;
      top: -12px;
      left:-2px;
      width: 20px;
      font-family: 'Material Design Icons';
      color: globals.$color-gray60;
      z-index: 10;
    }
    &-statusdot {
      position: absolute !important;
      top: 30px;
      right: 0px;
      width: 12px;
      height: 12px;
      z-index: 20;
      border-radius: 50%;
    }
  }

  .vlist__cell--name {
    width: calc(25% - 65px);
  }

  .vlist__cell--status {
    width: 12%;
    span {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 4px;
    }
  }

  .vlist__cell--status {
    border-right: 1px solid globals.$color-gray20;
  }

  .vlist__cell--statusdot {
    margin-top: 15px;
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 4px;
  }

  .vlist-footer .vlist__cell--status,
  .vlist-header__row  .vlist__cell--status {
    border-right: none;
  }

  .vlist__cell--name {
    width: 25%;
  }

  .vlist__cell--isrunning {
    width: 15%;
  }

  .vlist__cell--isrunning {
    border-right: 1px solid globals.$color-gray20;
  }

  .vlist__cell--total {
    width: 10%;
  }

  .vlist__cell--inprogress {
    width: 10%;
  }

  .vlist__cell--todo {
    width: 10%;
  }

  .vlist__cell--finished {
    width: 10%;
  }

  .vlist__cell--errors {
    width: 10%;
  }

  .vlist__cell--progress {
    width: 10%;
  }

.vlist__cell--contextmenu {
  position: absolute;
  top: 1px;
  right: 2px;
  width: 43px;
  height: 43px;
  font-family: 'Material Design Icons';
//   font-size: 1.5rem;
  border-radius: 50%;
  text-align: center;
  color: globals.$color-gray35;
  cursor: pointer;
  &:hover {
    background-color: globals.$color-gray5;
    color: globals.$color-performance;
  }
}

  .vlist_cell--coach {
    position: absolute;
    top: 1px;
    right: 14px;
    width: 43px;
    height: 43px;
    font-family: 'Abel', sans-serif;
    font-size: .75rem;
    text-align: center;
    padding-top: 11px;
    cursor: pointer;
    color: globals.$color-purple;
    background-color: transparent;
    border-left: 1px solid globals.$color-gray15;
    z-index: 10;
    &:before {
      content: '\F2AA';
      position: absolute;
      top: -10px;
      left: 50%;
      display:block;
      transform: translateX(-50%);
      font-family: 'Material Design Icons';
      font-size: 1.5rem;
    }
    &:hover {
      color: globals.$color-white;
      background-color: globals.$color-purple;
    }
  }

  .context-item {
    height: 40px;
    line-height: 40px;
    padding: 0 30px 0 20px;
    cursor: pointer;
    &:hover {
      background-color: globals.$color-gray5;
    }
    &__icon {
      margin-right: 5px;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      color: globals.$color-gray60;
    }
    &__label {
      padding-right: 10px;
      font-size: .9em;
      color: globals.$color-gray60;
      &--header {
        font-family: 'Open Sans Bold', sans-serif;
      }
    }
  }


</style>