<template>
  <div id="selectfield" :class="['dialog__modal dialog__modal--second', {'dialog__modal--open' : visible}]" data-e2e="select-field">
    <div :class="['dialog__window dialog__window--w680', {'dialog__window--open' : visible}]">
      <div class="dialog__window-header">
        <span class="dialog__window-title">{{ $store.state.settings.notetemplates.selectfieldheader }}</span>
        <span v-if="fieldData" class="form-checkbox form-checkbox--medium">
          <input type="checkbox" id="showeassubject" v-model="fieldData.fieldissubject">
          <label for="showeassubject">{{ $store.state.settings.notetemplates.showeassubjectlbl }}</label>
        </span>
        <a class="dialog__window-close" @click="closeField()">
          <span></span>
          <span></span>
        </a>
      </div>
      <div class="dialog__window-body" v-if="fieldData">
        <form @valid="saveField()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn--selectfield'}">
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="selectFieldProperty" id="selectFieldProperty" v-model="fieldData.fieldproperty" @keyup="setFieldLabel($event)" :placeholder="$store.state.settings.notetemplates.textfieldpropertylbl" data-validate="isNotEmpty" :data-message="$store.state.settings.notetemplates.validtextfield">
                <label for="selectFieldProperty" class="form-label form-label--hidden">{{ $store.state.settings.notetemplates.textfieldpropertylbl }}</label>
              </div>
            </div>
            <div class="grid-unit--beta form-textfield__form-togglefield">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="toggle_fieldrequiredlbl" :value="$store.state.settings.notetemplates.requiredlbl" readonly>
                <label for="toggle_fieldrequiredlbl" class="form-label form-label--hidden"></label>
              </div>
              <div class="form-togglefield">
                <input type="checkbox" name="toggle_selectfieldrequired" id="toggle_selectfieldrequired" v-model="fieldData.fieldrequired">
                <label for="toggle_selectfieldrequired"></label>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <h2 class="dialog__fieldsetheader">{{ $store.state.settings.notetemplates.headeroptions }}</h2>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                <input type="text" v-model="searchStr" :placeholder="$store.state.settings.notetemplates.searchstr" @keyup="filterList()">
              </div>
              <!-- <div class="typo-tabletitle">
                {{ totalCountOptions + " " + $store.state.settings.notetemplates.countlbl }}
              </div> -->
              <div class="form-button__secondary form-button__secondary--add grid--push">
                <button type="button" class="downloadexamplecsvbtn" @click="downloadSelectFieldExampleCSV()">{{ $store.state.settings.notetemplates.downloadexamplecsvlbl }}</button>
                <input type="file" name="uploadedCsvFile" id="uploadedCsvFile" class="csvfileupload" @change="handleCsvFileUpload($event)">
                <label for="uploadedCsvFile" class="csvfileupload__btn">{{ $store.state.settings.notetemplates.openfileuploaderlbl  }}</label>
                <button type="button" @click="addOption($event, 'btn')">{{ $store.state.settings.notetemplates.addoptionlbl }}</button>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="list-number-header list-number-header--comp-scrollbar">
                <!-- <span class="list-number-header__field list-number-header__field--20width" @click="sortColumn('OptionIndex', $event)" data-sortorder="NONE">{{ $store.state.settings.notetemplates.optionheaders[0] }}</span> -->
                <span class="list-number-header__field list-number-header__field--60width" @click="sortColumn('OptionValue', $event)" data-sortorder="NONE">{{ $store.state.settings.notetemplates.optionheaders[1] }}</span>
              </div>
              <VirtualListViewer class="list-number-wrapper" ref="numberlistwrapper"
                :data      = "optionList"
                rowClasses = ""
              >
                <template v-slot="{ row }" >
                  <div class="list-number-line list-number-line--nohandle" :ref="'row' + row.rawOptionListIndex">
                    <!-- <span class="list-number-line__field list-number-line__field--20width">{{ row.rawOptionListIndex }}</span> -->
                    <input type="text" v-model="row.optionvalue" @keydown="addOption($event, 'blur')" class="list-number-line__field list-number-line__field--60width" :placeholder="$store.state.settings.notetemplates.optionheaders[1]" :disabled="!row.iseditable">
                    <span class="list-number--icon">
                      <a :class="['button__icon button__icon--edit', {'button__icon--active' : row.iseditable}]" @click="editOption(row.rawOptionListIndex)">&#xF3EB;</a>
                      <a class="button__icon button__icon--delete" @click="deleteOption(row.rawOptionListIndex)">&#xF1C0;</a>
                    </span>
                  </div>
                </template>
              </VirtualListViewer>
            </div>
          </div>
        </form>
      </div>
      <div class="grid-unit--alpha dialog__window-footer">
        <a class="button-primary dialog__window-cancel" @click="closeField()">{{ $store.state.settings.notetemplates.closebtnlbl }}</a>
        <a class="button-primary button-primary--important js-submitbtn--selectfield">{{ $store.state.settings.notetemplates.savebtnlbl }}</a>
      </div>
    </div>
  </div>
</template>

<script>

  /**
   *
   * SelectField
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   *
   */

  import { ValidateDir }       from '../../../directives/validate';
  import VirtualListViewer     from './../../uielements/VirtualListViewer.vue';
  import { dynamicSort }       from './../../../use/sortFunctions';
  import { defineComponent }   from 'vue'
  import BoxProps, { ModalType } from '../../../types/BoxProps';

  export default defineComponent({
    name: 'SelectField',
    props: ['visible', 'fielddata'],
    data: () => {
      return {
        fieldData             : null,
        rawOptionList         : [],
        optionList            : [],
        rowHeight             : 37,
        sortSetting           : {},
        searchStr             : '',
        csvFileData           : '',
        convertedCsvFileData  : [],
      }
    },
    inject: ['showLoader', 'showModalDialog'],
    components: {
      VirtualListViewer
    },
    directives: {
      Validate : ValidateDir
    },
    computed: {
      totalCountOptions() { return this.optionList.length; }
    },
    methods: {
      setFieldLabel(evt) {
        let _val = evt.target.value;
        this.fieldData.fieldlabel = {"nl" : _val, "en" : _val};
      },
      setFieldListOption(evt, index) {
        let _val = evt.target.value;
        this.fieldData.fieldlistoptions[index] = _val;
        //todo label is probably also necessary
      },
      addOption(evt, type) {
        let _evt = evt || window.evt,
            _key = _evt.keyCode || _evt.which;
        if(type == 'btn' || (_key == 9 && type == 'blur')) {
          let _newOption          = {
                optionvalue : '',
                optionlabel : '',
                iseditable  : true,
              };
          if(this.rawOptionList.length == 0) {
            this.rawOptionList            = [];
            this.optionList               = [];
            _newOption.rawOptionListIndex = 0;
          } else {
            _newOption.rawOptionListIndex = this.rawOptionList.length;
          }
          this.rawOptionList.push(Object.assign({}, _newOption));
          this.filterList();
          this.$nextTick(() => {
            this.scrollToAddedOption(_newOption.rawOptionListIndex);
            this.setFocusToAddedOption(_newOption.rawOptionListIndex);
          });
          evt.preventDefault();
        }
      },
      editOption(rawoptionlistindex) {
        this.rawOptionList.forEach(opt => {
          if(opt.rawOptionListIndex == rawoptionlistindex) opt.iseditable = !opt.iseditable;
          else opt.iseditable = false;
        });
        this.filterList();
      },
      deleteOption(rawoptionlistindex) {
        let _index = this.rawOptionList.findIndex(opt => opt.rawOptionListIndex == rawoptionlistindex);
        this.rawOptionList.splice(_index, 1);
        this.filterList();
      },
      closeField() {
        if(this.fieldData.isnew) this.$emit('removeunsavedfield');
        this.$emit('close')
      },
      saveField() {
        //Cause label is not provided in design
        this.rawOptionList.forEach(opt => opt.optionlabel = opt.optionvalue);
        this.fieldData.fieldlistoptions = this.rawOptionList;
        this.$emit('save', this.fieldData);
      },
      startOptionList() {
        this.rawOptionList      = this.fieldData.fieldlistoptions.map((opt, index) => ({ ...opt, rawOptionListIndex: index, iseditable : false }));
        this.optionList         = [...this.rawOptionList];
      },
      //==========================================HELPER FUNCTIONS
      handleCsvFileUpload(e) {
        let _files = e.target.files;
        this.showLoader(true);
        this.checkCsvFile(_files[0]);
      },
      checkCsvFile(csvFile) {
            let _fileExtension = csvFile.name.split('.').pop();
            if(_fileExtension && _fileExtension === 'csv' && FileReader) {
                let _reader = new FileReader();
                _reader.onload = evt => {
                    this.csvFileData = evt.currentTarget.result;
                    this.csvFileToJSON(this.csvFileData);
                }
                _reader.onerror = evt => {
                    this.showModalDialog(new BoxProps(ModalType.Alert, 'Error', this.$store.state.settings.notetemplates.errorMsg[0]));
                    this.showLoader(false);
                };
                _reader.onloadend = () => {
                }
                _reader.readAsText(csvFile); // not doing anything anymore, right?
            } else {
                this.showModalDialog(new BoxProps(ModalType.Alert, 'Error', this.$store.state.settings.notetemplates.errorMsg[1]));
                this.showLoader(false);
            }
      },
      csvFileToJSON(csv) {
        let _datacsv           = csv.split(';'),
            _convertedData     = _datacsv.reduce((acc, val, index) => {
                let _newOption   = {
                    optionvalue        : val,
                    optionlabel        : val,
                    iseditable         : true,
                    rawOptionListIndex : this.rawOptionList.length + index
                };
                acc.push(_newOption);
                return acc;
            }, []);
        if(_convertedData.length !== 0) {
            this.addConvertedDataToList(_convertedData);
        } else {
            this.showModalDialog(new BoxProps(ModalType.Alert, 'Error', this.$store.state.settings.notetemplates.errorMsg[2]));
            this.showLoader(false);
        }
      },
      addConvertedDataToList(list) {
        this.rawOptionList = this.rawOptionList.concat(list);
        this.filterList();
        this.showLoader(false);
      },
      downloadSelectFieldExampleCSV() {
        let _link           = document.createElement('a');
        _link.setAttribute('href', window.siteroot + 'assets/downloads/contactsuite_optionlist_example.csv');
        _link.setAttribute('download', 'contactsuite_optionlist_example.csv');
        _link.style.display = 'none';
        _link.target        = '_blank';

        document.body.appendChild(_link);
        _link.click();
      },
      scrollToAddedOption(rawoptionlistindex) {
        let _rawoptionlistindex = this.optionList.findIndex(opt => opt.rawOptionListIndex == rawoptionlistindex);
        this.$refs.numberlistwrapper.$el.scrollTop = _rawoptionlistindex * this.rowHeight;
      },
      setFocusToAddedOption(rawoptionlistindex) {
        let _reffy = 'row' + rawoptionlistindex.toString();
        if(this.$refs[_reffy]) {
          this.$refs[_reffy].children[0].focus();
        } else {
          setTimeout(() => {
            this.$refs[_reffy].children[0].focus();
          }, 200);
        }
      },
      filterList() {
        this.optionList = this.filterListOnString(this.rawOptionList, this.searchStr.toLowerCase());
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
            return item.optionvalue.toLowerCase().indexOf(str) != -1;
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
            this.optionList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.optionList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.optionList = this.filterListOnString(this.rawOptionList, this.searchStr.toLowerCase());
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      shakeIt() {
        let _elm = document.querySelector("#selectfield");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
    },
    mounted() {
      this.fieldData          = this.fielddata;
      this.startOptionList();
    }

  });
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  #selectfield .grid-row .grid-unit--beta:first-of-type {
    padding-top: .5rem;
    padding-right: .5rem;
    padding-bottom: .5rem;
  }
  #selectfield .grid-row .grid-unit--beta:last-of-type {
    padding-top: .5rem;
    padding-left: .5rem;
    padding-bottom: .5rem;
  }
  #selectfield .grid-row .grid-unit--alpha .form-textfield--search {
    margin-top: 0;
    padding-left: 0;
    max-width: 200px;
  }
  #selectfield .grid-row .grid-unit--alpha .grid--push {
    margin-top: 20px;
  }
  #selectfield .form-textfield__form-togglefield .form-togglefield {
    right: 1.5rem;
  }
  #selectfield .form-checkbox.form-checkbox--medium {
    right: 50px;
    width: initial;
    height: initial;
    margin-top: initial;
    label:before {
      color: globals.$color-white;
    }
    input[type=checkbox]:checked + label:before {
      color: globals.$color-secondary;
    }
  }

  #selectfield .csvfileupload {
    position: absolute;
    top: 35px;
    left: 0;
    bottom: 10px;
    width: 100%;
    opacity: 0;
    z-index: 10;
  }

  #selectfield .csvfileupload__btn {
    font-family: 'Open Sans Bold', sans-serif;
    font-size: .9rem;
    width: auto;
    padding: 5px 10px;
    color: globals.$color-gray80;
    background-color: transparent;
    line-height: 30px;
    display: block;
    float: left;
    &:after,
    &:before {
      position: relative;
      line-height: 30px;
    }
    &:hover {
      cursor: pointer;
      color: globals.$color-gray50;
    }
    &:after {
      content: '\F552';
      color: globals.$color-secondary;
      font-family: 'Material Design Icons';
      font-size: 1.4rem;
      padding-left: 5px;
      float: right;
    }
    &:hover:after {
      color: globals.$color-warning;
    }
  }

  #selectfield .downloadexamplecsvbtn:after {
    content: '\F1DA';
    color: globals.$color-secondary;
    font-family: 'Material Design Icons';
    font-size: 1.4rem;
    padding-left: 5px;
    float: right;
  }


</style>