<template>
  <div data-e2e="template-list">
    <!-- LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.notetemplates.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{ totalDetails + " " + $store.state.settings.notetemplates.countlabel }}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="addDetail()">{{ $store.state.settings.notetemplates.adddetail }}</button>
            </div>
          </div>
        </div>
      </div>
      <ListViewer
        :headerprops="headerprops"
        :listdata="list"
        @rowclick="showDetail"
        ref="templatelist"
      />
    </div>

    <!-- TEMPLATE POPUP -->
    <TemplateDetail
      :visible="detailStatus"
      :datadetail="dataDetail"
      :selectedid="selectedId"
      @close="closeDetail"
      @save="saveDetail"
      @delete="deleteDetail"
    />

  </div>
</template>

<script>
/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 */

import ListViewer                    from './../uielements/ListViewer.vue';
import TemplateDetail                from './TemplateDetail.vue';
import { ISOdateTimetoDate }         from './../../use/dateFunctions';
import { scrollTo }                  from './../../use/helperFunctions';
import { defineComponent }           from 'vue'
import { IPCCCConfigurator } from './../../ipccc/js/configurator';

export default defineComponent({
  name: 'TemplateList',
  data() {
    return {
      selectedCustomerId : -1,
      searchStr          : '',
      sortSetting        : {},
      headerprops        : [],
      rawList            : [],
      list               : [],
      totalDetails       : null,
      detailStatus       : false,
      dataDetail         : null,
      selectedId         : -1,
      selectedTitle      : '',
      storeWatch         : null,
      selectedLang       : null,
    }
  },
  inject: ['showLoader'],
  components: {
    ListViewer,
    TemplateDetail,
  },
  methods: {
    getDataList() {
      this.showLoader(true);
      IPCCCConfigurator.Request(this.selectedCustomerId, 'ConversationNoteTemplate', 'list', null, -1).then(result => {
        this.rawList         = [...result].map(template => {
          template.Template  = this.IsJsonString(template.Template) ? JSON.parse(template.Template) : template.Template;
          template.dateStr   = this.getDateStr(template.CreateDate);
          template.fieldsStr = this.getFieldsStr(template.Template);
          return template;
        }, []);
        this.list          = [...this.rawList];
        this.totalDetails  = this.list.length;
        this.showLoader(false);
      }).catch(error => {
        console.error('Error: ' + error);
        this.showLoader(false);
      });
    },
    postProcessDetailData(data) {
      let _data = data,
          _templatedata = {};
      _templatedata     = this.IsJsonString(data.Template) ? JSON.parse(data.Template) : {'FieldMappings':[]};
      _data.Template    = _templatedata;
      _data.dateStr     = ISOdateTimetoDate(data.CreateDate);
      _data.fieldsStr   = this.getFieldsStr(_templatedata);
      return _data;
    },
    preProcessDetailData(dataOp) {
      let _data         = {},
        _templatedata   = {};
      switch(dataOp) {
        case 'save':
          _data           = this.dataDetail;
          // _data.Id        = this.dataDetail.NoteCount > 0 ? -1 : _data.Id;
          _data.Id        = this.selectedId;
          _templatedata   = JSON.stringify(this.dataDetail.Template);
          _data.Template  = _templatedata;
          break;
        case 'delete':
          _data           = this.dataDetail;
          _templatedata   = JSON.stringify(this.dataDetail.Template);
          _data.Template  = _templatedata;
          _data.Visible   = false;
          break;
        default:
          _data           = this.dataDetail;
      }
      return _data;
    },
    fnDataDetail(dataOp) {
      return new Promise((resolve, reject) => {
        this.showLoader(true);
        let _data = this.preProcessDetailData(dataOp);
        dataOp = dataOp == 'delete' ? 'save' : dataOp;
        IPCCCConfigurator.Request(this.selectedCustomerId, 'ConversationNoteTemplate', dataOp, _data, this.selectedId).then(result => {
          this.showLoader(false);
          if(Array.isArray(result))
            result = result[0];
          let _result = this.postProcessDetailData(result);
          resolve(_result);
        }).catch(error => {
          this.showLoader(false);
          reject(error);
        });
      });
    },
    showDetail(id) {
      this.showLoader(true);
      this.selectedId            = id;
      this.dataDetail            = null;
      this.fnDataDetail('readone').then(result => {
        this.dataDetail          = Object.assign({}, result);
        this.detailStatus        = true;
      }).catch(e => { console.error('Error: ', e); });
    },
    addDetail() {
      this.showLoader(true);
      this.selectedId            = -1;
      this.dataDetail            = null;
      this.fnDataDetail('readnew').then(result => {
        this.dataDetail          = Object.assign({}, result);
        this.detailStatus        = true;
      }).catch(e => { console.error('Error: ', e); });
    },
    saveDetail(data) {
      this.showLoader(true);
      this.dataDetail = data;
      this.selectedId = data.Id;
      this.fnDataDetail('save').then(result => {
        this.removeSavedFrom();
        this.updateList(result);
        this.closeDetail();
      }).catch(e => { console.error('Error: ', e); });
    },
    deleteDetail(data) { //Not yet mplemented by BE
      this.showLoader(true);
      this.dataDetail = data;
      this.selectedId = data.Id;
      this.fnDataDetail('delete').then(result => {
        let _indexToDelete = this.rawList.findIndex(detail => detail.Id === this.selectedId);
        this.rawList.splice(_indexToDelete, 1);
        this.filterList();
        this.closeDetail();
      }).catch(e => { console.error('Error: ', e); });
    },
    closeDetail() {
      this.dataDetail      = null;
      this.selectedId      = -1;
      this.detailStatus    = false;
    },
    //=========================================================== START DISPLAY LIST METHODS
    removeSavedFrom() {
      if(this.selectedId == -1) return;
      let _indexToDelete = this.rawList.findIndex(detail => detail.Id === this.selectedId);
      this.rawList.splice(_indexToDelete, 1);
    },
    updateList(data) {
      let _IndexToSave  = this.rawList.findIndex(detail => detail.Id == data.Id);
      this.totalDetails = 0;
      if(_IndexToSave == -1)
        this.rawList.push(data);
      else
        this.rawList[_IndexToSave] = data;
      this.filterList();
      setTimeout(() => {
        this.setHighlightedRow(data.Id);
      }, 500);
      this.showLoader(false);
    },
    filterList() {
      this.list         = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
      this.totalDetails = this.list.length;
    },
    filterListOnString(list, str) {
      if(str != '') {
        let _rawList = [...list],
            _keys;
        return _rawList.filter(item => {
          _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
            item['Description'].toLowerCase().indexOf(str) != -1
          return _keys;
        });
      } else {
        return [...list];
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
    getDateStr(str) {
      let _datestr = ISOdateTimetoDate(str);
      return _datestr;
    },
    getFieldsStr(arr) {
      if(arr.FieldMappings)
      return arr.FieldMappings.reduce((prevVal, currVal, index) => {
        if(currVal.metadatafield) return (index == 0) ? currVal.fieldlabel[this.selectedLang] : prevVal + ', ' + currVal.fieldlabel[this.selectedLang];
        else return (index == 0) ? currVal.fieldproperty : prevVal + ', ' + currVal.fieldproperty;
      }, '');
    },
    IsJsonString(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
    }
  },
  created() {
    this.selectedLang = this.$store.getters.getLang();
  },
  mounted() {
    this.headerprops = [
        {
          label    : this.$store.state.settings.notetemplates.listheaders[0],
          width    : 15,
          dataprop : 'Name',
          sortprop : 'Name'
        },{
          label    : this.$store.state.settings.notetemplates.listheaders[1],
          width    : 25,
          dataprop : 'Description',
          sortprop : 'Description'
        },{
          label    : this.$store.state.settings.notetemplates.listheaders[2],
          width    : 45,
          dataprop : 'fieldsStr',
          sortprop : 'fieldsStr'
        },{
          label    : this.$store.state.settings.notetemplates.listheaders[3],
          width    : 15,
          dataprop : 'dateStr',
          sortprop : 'dateStr'
        }
      ],

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
});
</script>