<template>
  <div data-e2e="campaign-tab-list">
    <CampaignUploadHeaders
      :showhelp="showhelp"
      :showdroparea="showDropArea"
      @newheaderlist="newHeaderList"
    />
    <div v-show="!showDropArea" class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.campaignmanager.formreferencefieldlbl }}</label>
          <select v-model="dataitem.ReferenceField">
            <option value="">{{ $store.state.settings.campaignmanager.selectcolumndefault }}</option>
            <option v-for="header in headerList" :value="header">{{ header }}</option>
          </select>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.campaignmanager.formsenderfieldlbl }}</label>
          <select v-model="dataitem.SenderField">
            <option value="">{{ $store.state.settings.campaignmanager.selectcolumndefault }}</option>
            <option v-for="header in headerList" :value="header">{{ header }}</option>
          </select>
        </div>
      </div>
    </div>
    <div v-show="!showDropArea" class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.campaignmanager.formdestinationfieldlbl }}</label>
          <select v-model="dataitem.DestinationField">
            <option value="">{{ $store.state.settings.campaignmanager.selectcolumndefault }}</option>
            <option v-for="header in headerList" :value="header">{{ header }}</option>
          </select>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-selectfield form-selectfield--inline-bground">
          <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.campaignmanager.formschedulefieldlbl }}</label>
          <select v-model="dataitem.ScheduleField">
            <option value="">{{ $store.state.settings.campaignmanager.selectcolumndefault }}</option>
            <option v-for="header in headerList" :value="header">{{ header }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-show="!showDropArea" class="grid-row">
      <!--<h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.campaignmanager.headerresults }}
         <button type="button" class="list-number-header__button--add" @click="addCode($event, 'btn')">{{ $store.state.settings.campaignmanager.addlblresult }}</button>
      </h2>
      <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.campaignmanager.helptextresult }}</div> -->
    </div>
    <div v-show="!showDropArea" class="grid-row grid-row--less-padding">
      <div class="grid-unit--gamma">
        <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small form-textfield--search-on-white">
          <input type="text" v-model="searchStrDetail" :placeholder="$store.state.settings.campaignmanager.searchtxtdetail" @keyup="filterList()">
        </div>
      </div>
      <div class="grid-unit--gamma">
        <div class="typo-tabletitle">{{ totalCountHeaders + " " + $store.state.settings.campaignmanager.totalcountlabel }}</div>
      </div>
      <div class="grid-unit--gamma">
        <div class="form-button__secondary form-button__secondary--add grid--push">
          <button type="button" @click="addFieldMapping($event, 'btn')">{{ $store.state.settings.campaignmanager.addfieldmappingbtn }}</button>
        </div>
      </div>
    </div>
    <div v-show="!showDropArea" class="grid-row">
      <div class="grid-unit--alpha">
        <div class="list-number-header list-number-header--comp-scrollbar">
          <span class="list-number-header__field list-number-header__field--25width" @click="sortColumn('FieldName', $event)" data-sortorder="NONE">{{ $store.state.settings.campaignmanager.headercollheads[0] }}</span>
          <span class="list-number-header__field list-number-header__field--25width" @click="sortColumn('Variable', $event)" data-sortorder="NONE">{{ $store.state.settings.campaignmanager.headercollheads[1] }}</span>
          <span class="list-number-header__field list-number-header__field--50width" @click="sortColumn('DisplayName', $event)" data-sortorder="NONE">{{ $store.state.settings.campaignmanager.headercollheads[2] }}</span>
        </div>
        <ul class="list-number-wrapper" ref="campaignmanagerwrapper">
          <li class="list-number-line list-number-line--nohandle" v-for="row in filteredFieldMappings" :key="row.rawFieldMappingsIndex" :ref="'row' + row.rawFieldMappingsIndex">
            <select class="list-number-line__field list-number-line__field--25width" v-model="row.FieldName" @change="updateRawFieldMappings('FieldName', row.FieldName, row.rawFieldMappingsIndex)"  :disabled="!row.iseditable">
              <option value="" selected>{{ $store.state.settings.campaignmanager.selectcolumndefault }}</option>
              <option v-for="header in headerList" :value="header">{{ header }}</option>
            </select>
            <input type="text" v-model="row.Variable" @keyup="updateRawFieldMappings('Variable', row.Variable, row.rawFieldMappingsIndex)" class="list-number-line__field list-number-line__field--25width" :placeholder="$store.state.settings.campaignmanager.headercollheads[1]" :disabled="!row.iseditable">
            <input type="text" v-model="row.DisplayName" @keyup="updateRawFieldMappings('DisplayName', row.DisplayName, row.rawFieldMappingsIndex)" @keydown="addFieldMapping($event, 'blur')" class="list-number-line__field list-number-line__field--33width" :placeholder="$store.state.settings.campaignmanager.headercollheads[2]" :disabled="!row.iseditable">
            <span class="list-number--icon">
              <a :class="['button__icon button__icon--edit', {'button__icon--active' : row.iseditable}]" @click="editFieldMapping(row.rawFieldMappingsIndex)">&#xF3EB;</a>
              <a class="button__icon button__icon--delete" @click="deleteFieldMapping(row.rawFieldMappingsIndex)">&#xF1C0;</a>
            </span>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>

  import CampaignUploadHeaders   from './CampaignUploadHeaders.vue';
  import { dynamicSort }         from '../../use/sortFunctions';

  export default {
    name: 'CampaignTabList',
    props: {
      showhelp : {
        type     : Boolean,
        default  : false
      },
      isactive : {
        type     : Boolean,
        default  : false
      },
      dataitem : {
        type     : Object,
        default  : false
      },
    },
    data: () => {
      return {
        headerList             : [],
        filteredFieldMappings  : [],
        rawFieldMappings       : [],
        searchStrDetail        : '',
        rowHeight              : 37,
        sortSetting            : {},
        totalCountHeaders      : 0,
      }
    },
    inject: ['showLoader'],
    components: {
      CampaignUploadHeaders
    },
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
      showDropArea() {
        return this.headerList.length == 0;
      }
    },
    methods: {
      startHeaderList() {
        if(this.dataitem.Id >= 0) { //push data (Fields and FieldMappings) to headerlist
          if(this.dataitem.ReferenceField.length > 0) this.headerList.push(this.dataitem.ReferenceField);
          if(this.dataitem.SenderField.length > 0) this.headerList.push(this.dataitem.SenderField);
          if(this.dataitem.DestinationField.length > 0) this.headerList.push(this.dataitem.DestinationField);
          if(this.dataitem.ScheduleField.length > 0) this.headerList.push(this.dataitem.ScheduleField);
          if(this.rawFieldMappings.length > 0) {
            this.rawFieldMappings.forEach((mapping, index) => {
              mapping.rawFieldMappingsIndex = index;
              mapping.iseditable            = false;
              if(this.headerList.includes(mapping.FieldName) == false) this.headerList.push(mapping.FieldName);
            });
          }
          this.filterList();
        }
      },
      newHeaderList(list) {
        this.resetHeaders();
        this.headerList = list;
        this.showLoader(false);
      },
      resetHeaders() {
        this.dataitem.ReferenceField = this.dataitem.SenderField = this.dataitem.DestinationField = this.dataitem.ScheduleField = '';
        this.rawFieldMappings        = [];
        this.filteredFieldMappings   = [];
        this.dataitem.FieldMappings  = [];
      },
      //===============================================================HELPER FUNCTIONS
      addFieldMapping(evt, type) {
        let _evt = evt || window.evt,
            _key = _evt.keyCode || _evt.which;
        if(type == 'btn' || (_key == 9 && type == 'blur')) {
          let _newMapping = {
            FieldName    : '',
            Variable     : '',
            DisplayName  : '',
            iseditable   : true
          };
          if(this.rawFieldMappings.length == 0) {
            this.rawFieldMappings             = [];
            this.filteredFieldMappings        = [];
            this.dataitem.FieldMappings       = [];
            _newMapping.rawFieldMappingsIndex = 0;
          } else {
            _newMapping.rawFieldMappingsIndex = this.rawFieldMappings.length;
          }
          this.rawFieldMappings.push(Object.assign({}, _newMapping));
          this.filterList();
          this.$nextTick(() => {
            this.scrollToAddedFieldMapping(_newMapping.rawFieldMappingsIndex);
          });
          evt.preventDefault();
        }
      },
      scrollToAddedFieldMapping(rawfieldmappingsindex) {
        let _dataFieldMappingsIndex = this.filteredFieldMappings.findIndex(mapping => mapping.rawFieldMappingsIndex == rawfieldmappingsindex);
        this.$refs.campaignmanagerwrapper.scrollTop = _dataFieldMappingsIndex * this.rowHeight;
      },
      editFieldMapping(rawfieldmappingsindex) {
        this.rawFieldMappings.forEach(mapping => {
          if(mapping.rawFieldMappingsIndex == rawfieldmappingsindex)
            mapping.iseditable = !mapping.iseditable;
          else
          mapping.iseditable = false;
        });
        this.filterList();
      },
      deleteFieldMapping(rawfieldmappingsindex) {
        if(rawfieldmappingsindex > -1) this.rawFieldMappings.splice(rawfieldmappingsindex, 1);
        this.filterList();
      },
      updateRawFieldMappings(prop, val, rawfieldmappingsindex) {
        this.rawFieldMappings[rawfieldmappingsindex][prop] = val;
        if(prop == 'FieldName') this.rawFieldMappings[rawfieldmappingsindex].Variable = val;
        this.filterList();
      },
      filterList() {
        this.filteredFieldMappings  = this.filterListOnString(this.rawFieldMappings, this.searchStrDetail.toLowerCase());
        this.dataitem.FieldMappings = this.rawFieldMappings //sync with changed data
        this.totalCountHeaders      = this.rawFieldMappings.length;
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
            return (item.FieldName.toLowerCase().indexOf(str) != -1 ||
            item.Variable.toLowerCase().indexOf(str) != -1 ||
            item.DisplayName.toLowerCase().indexOf(str) != -1) &&
            !item.Delete;
          });
        } else {
          return [...list].filter(item => !item.Delete);
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
            this.filteredFieldMappings.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.filteredFieldMappings.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.filteredFieldMappings = this.filterListOnString(this.rawFieldMappings, this.searchStrDetail.toLowerCase());
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
    },
    mounted() {
      this.rawFieldMappings = JSON.parse(JSON.stringify(this.dataitem.FieldMappings));
      this.startHeaderList();
    }
  }

</script>
