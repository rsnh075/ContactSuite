<template>
  <div id="radiolistfield" :class="['dialog__modal dialog__modal--second', {'dialog__modal--open' : visible}]" data-e2e="radio-list-field">
    <div :class="['dialog__window dialog__window--w680', {'dialog__window--open' : visible}]">
      <div class="dialog__window-header">
        <span class="dialog__window-title">{{ $store.state.settings.notetemplates.radiolistfieldheader }}</span>
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
        <form @valid="saveField()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn--radiolistfield'}">
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="radiolistfieldproperty" id="radiolistfieldproperty" v-model="fieldData.fieldproperty" @keyup="setFieldLabel($event)" :placeholder="$store.state.settings.notetemplates.textfieldpropertylbl" data-validate="isNotEmpty" :data-message="$store.state.settings.notetemplates.validtextfield">
                <label for="radiolistfieldproperty" class="form-label form-label--hidden">{{ $store.state.settings.notetemplates.textfieldpropertylbl }}</label>
              </div>
            </div>
            <div class="grid-unit--beta form-textfield__form-togglefield">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="toggle_fieldrequiredlbl" :value="$store.state.settings.notetemplates.requiredlbl" readonly>
                <label for="toggle_fieldrequiredlbl" class="form-label form-label--hidden"></label>
              </div>
              <div class="form-togglefield">
                <input type="checkbox" name="toggle_radiolistfieldrequired" id="toggle_radiolistfieldrequired" v-model="fieldData.fieldrequired">
                <label for="toggle_radiolistfieldrequired"></label>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <h2 class="dialog__fieldsetheader">{{ $store.state.settings.notetemplates.headeroptions }}</h2>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="typo-tabletitle">
                {{ totalCountRadios + " " + $store.state.settings.notetemplates.countlblmaxfour }}
              </div>
              <div class="form-button__secondary form-button__secondary--add grid--push">
                <button type="button" @click="addRadio($event, 'btn')" :disabled="rawRadioList.length == 4">{{ $store.state.settings.notetemplates.addradiolbl }}</button>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="list-number-header list-number-header--comp-scrollbar">
                <!-- <span class="list-number-header__field list-number-header__field--20width" @click="sortColumn('OptionIndex', $event)" data-sortorder="NONE">{{ $store.state.settings.notetemplates.optionheaders[0] }}</span> -->
                <span class="list-number-header__field list-number-header__field--60width" @click="sortColumn('OptionValue', $event)" data-sortorder="NONE">{{ $store.state.settings.notetemplates.radioheaders[0] }}</span>
              </div>
              <VirtualListViewer class="list-number-wrapper" ref="numberlistwrapper"
                :data      = "radioList"
                rowClasses = ""
              >
                <template v-slot="{ row }" >
                  <div class="list-number-line list-number-line--nohandle" :ref="'row' + row.rawRadioListIndex">
                    <!-- <span class="list-number-line__field list-number-line__field--20width">{{ row.rawRadioListIndex }}</span> -->
                    <input type="text" v-model="row.radiovalue" @keydown="addRadio($event, 'blur')" class="list-number-line__field list-number-line__field--60width" :placeholder="$store.state.settings.notetemplates.radioheaders[0]" :disabled="!row.iseditable">
                    <span class="list-number--icon">
                      <a :class="['button__icon button__icon--edit', {'button__icon--active' : row.iseditable}]" @click="editOption(row.rawRadioListIndex)">&#xF3EB;</a>
                      <a class="button__icon button__icon--delete" @click="deleteOption(row.rawRadioListIndex)">&#xF1C0;</a>
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
        <a class="button-primary button-primary--important js-submitbtn--radiolistfield">{{ $store.state.settings.notetemplates.savebtnlbl }}</a>
      </div>
    </div>
  </div>
</template>

<script>

  /**
   *
   * RadioListField
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
  import VirtualListViewer   from './../../uielements/VirtualListViewer.vue';
  import { defineComponent }   from 'vue'

  export default defineComponent({
    name: 'RadioListField',
    props: ['visible', 'fielddata'],
    data: () => {
      return {
        fieldData          : null,
        rawRadioList       : [],
        radioList          : [],
        rowHeight          : 37,
        sortSetting        : {},
        searchStr          : '',
      }
    },
    components: {
      VirtualListViewer
    },
    directives: {
      Validate : ValidateDir
    },
    computed: {
      totalCountRadios() { return this.radioList.length; }
    },
    methods: {
      setFieldLabel(evt) {
        let _val = evt.target.value;
        this.fieldData.fieldlabel = {"nl" : _val, "en" : _val};
      },
      setFieldListOption(evt, index) {
        let _val = evt.target.value;
        this.fieldData.fieldlistradio[index] = _val;
        //todo label is probably also necessary
      },
      addRadio(evt, type) {
        let _evt = evt || window.evt,
            _key = _evt.keyCode || _evt.which;
        if((type == 'btn' || (_key == 9 && type == 'blur')) && this.rawRadioList.length < 4) {
          let _newRadio          = {
                radiovalue  : '',
                radiolabel  : '',
                iseditable  : true,
              };
          if(this.rawRadioList.length == 0) {
            this.rawRadioList            = [];
            this.radioList                = [];
            _newRadio.rawRadioListIndex = 0;
          } else {
            _newRadio.rawRadioListIndex = this.rawRadioList.length;
          }
          this.rawRadioList.push(Object.assign({}, _newRadio));
          this.filterList();
          this.$nextTick(() => {
            this.scrollToAddedOption(_newRadio.rawRadioListIndex);
            this.setFocusToAddedOption(_newRadio.rawRadioListIndex);
          });
          evt.preventDefault();
        }
      },
      editOption(rawradiolistindex) {
        this.rawRadioList.forEach(radio => {
          if(radio.rawRadioListIndex == rawradiolistindex) radio.iseditable = !radio.iseditable;
          else radio.iseditable = false;
        });
        this.filterList();
      },
      deleteOption(rawradiolistindex) {
        let _index = this.rawRadioList.findIndex(radio => radio.rawRadioListIndex == rawradiolistindex);
        this.rawRadioList.splice(_index, 1);
        this.filterList();
      },
      closeField() {
        if(this.fieldData.isnew) this.$emit('removeunsavedfield');
        this.$emit('close')
      },
      saveField() {
        //Cause label is not provided in design
        this.rawRadioList.forEach(radio => radio.radiolabel = radio.radiovalue);
        this.fieldData.fieldlistradio = this.rawRadioList;
        this.$emit('save', this.fieldData);
      },
      startOptionList() {
        this.rawRadioList      = this.fieldData.fieldlistradio.map((radio, index) => ({ ...radio, rawRadioListIndex: index, iseditable : false }));
        this.radioList         = [...this.rawRadioList];
      },
      //==========================================HELPER FUNCTIONS
      scrollToAddedOption(rawradiolistindex) {
        let _rawradiolistindex = this.radioList.findIndex(radio => radio.rawRadioListIndex == rawradiolistindex);
        this.$refs.numberlistwrapper.$el.scrollTop = _rawradiolistindex * this.rowHeight;
      },
      setFocusToAddedOption(rawradiolistindex) {
        let _reffy = 'row' + rawradiolistindex.toString();
        if(this.$refs[_reffy]) {
          this.$refs[_reffy].children[0].focus();
        } else {
          setTimeout(() => {
            this.$refs[_reffy].children[0].focus();
          }, 200);
        }
      },
      filterList() {
        this.radioList = this.filterListOnString(this.rawRadioList, this.searchStr.toLowerCase());
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
            return item.radiovalue.toLowerCase().indexOf(str) != -1;
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
            this.radioList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.radioList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.radioList = this.filterListOnString(this.rawRadioList, this.searchStr.toLowerCase());
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      shakeIt() {
        let _elm = document.querySelector("#radiolistfield");
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

  #radiolistfield .grid-row .grid-unit--beta:first-of-type {
    padding-top: .5rem;
    padding-right: .5rem;
    padding-bottom: .5rem;
  }
  #radiolistfield .grid-row .grid-unit--beta:last-of-type {
    padding-top: .5rem;
    padding-left: .5rem;
    padding-bottom: .5rem;
  }
  #radiolistfield .grid-row .grid-unit--alpha .form-textfield--search {
    margin-top: 0;
    padding-left: 0;
    max-width: 240px;
  }
  #radiolistfield .grid-row .grid-unit--alpha .grid--push {
    margin-top: 20px;
  }
  #radiolistfield .form-textfield__form-togglefield .form-togglefield {
    right: 1.5rem;
  }
  #radiolistfield .list-number-wrapper {
    overflow-y: auto;
  }
  #radiolistfield .typo-tabletitle {
    margin-left: 10px;
  }
  #radiolistfield .form-checkbox.form-checkbox--medium {
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


</style>