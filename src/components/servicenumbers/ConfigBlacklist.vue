<template>
  <div data-e2e="service-config-blacklist">
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
          <input type="text" v-model="searchStrDetail" :placeholder="$store.state.settings.configblacklist.searchtxtdetail" @keyup="filterList()">
        </div>
        <div class="typo-tabletitle">
          {{ totalCountNumbers + " " + $store.state.settings.configblacklist.countlabel }}
        </div>
        <div class="grid--push">
          <div class="form-button__secondary form-button__secondary--add grid--push">
            <button type="button" @click="addNumber($event, 'btn')">{{ $store.state.settings.configblacklist.addnumber }}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <input type="text" id="datepickerblacklist">
        <div class="list-number-header list-number-header--comp-scrollbar">
          <span class="list-number-header__field list-number-header__field--33width" @click="sortColumn('PhoneNumber', $event)" data-sortorder="NONE">{{ $store.state.settings.configblacklist.collheads[0] }}</span>
          <span class="list-number-header__field list-number-header__field--50width" @click="sortColumn('BlockedTill', $event)" data-sortorder="NONE">{{ $store.state.settings.configblacklist.collheads[1] }}</span>
        </div>
        <VirtualListViewer v-if="isactive" class="list-number-wrapper" ref="numberlistwrapper"
          :data      = "numbers"
          rowClasses = ""
        >
          <template v-slot="{ row }" >
            <div class="list-number-line list-number-line--nohandle" :ref="'row' + row.rawNumberIndex">
              <input type="text" v-model="row.PhoneNumber" @keyup="updateRawNumbers('PhoneNumber', row.PhoneNumber, row.rawNumberIndex)" @change="emitBlackListChanges(row.rawNumberIndex)" class="list-number-line__field list-number-line__field--33width" :placeholder="$store.state.settings.configblacklist.collheads[0]" :disabled="!row.iseditable">
              <input type="text" v-model="row.blockedTillView" @click="openDatePicker($event, row.blockedTillView, row.rawNumberIndex)" @keydown="addNumber($event, 'blur')" class="list-number-line__field list-number-line__field--50width" :placeholder="$store.state.settings.configblacklist.collheads[1]" :disabled="!row.iseditable">
              <span class="list-number--icon">
                <a :class="['button__icon button__icon--edit', {'button__icon--active' : row.iseditable}]" @click="editNumber(row.rawNumberIndex)">&#xF3EB;</a>
                <a class="button__icon button__icon--delete" @click="deleteNumber(row.rawNumberIndex)">&#xF1C0;</a>
              </span>
            </div>
          </template>
        </VirtualListViewer>
      </div>
    </div>
  </div>
</template>

<script>
  /**
   *
   * Blacklist
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   *
   */

  import { ValidateDir }       from './../../directives/validate';
  import VirtualListViewer     from './../uielements/VirtualListViewer.vue';
  import {
            ISOdateTimetoDate,
            saveFormatDate,
            pikaDayToDDMMYYYY,
            parsePikaDayDateStr
          }                    from './../../use/dateFunctions';
  import { dynamicSort }       from '../../use/sortFunctions';
  import PikaDay               from 'pikaday';

  export default {
    name: 'ConfigBlacklist',
    props: {
      isactive : {
        type : Boolean,
        default : false
      },
      blacklistdata : {
        type : Array,
        default : []
      },
      selectedsnid : {
        type : Number,
        default : -1
      }
    },
    data: () => {
      return {
        searchStrDetail        : '',
        numbers                : [],
        rawNumbers             : null,
        sortSetting            : {},
        rowHeight              : 37,
        datePickerBlackList             : null,
        selectedRawNumberIndex : null,
        // pickerOpen             : false,
        // preventEmitBlackListChanges : false,
      }
    },
    components: {
      VirtualListViewer
    },
    directives: {
      Validate : ValidateDir
    },
    computed: {
      setValidation() {
        return type => {
          return this.isactive ? type : type + '_skip';
        }
      },
      totalCountNumbers() {
        return this.numbers.length;
      }
    },
    watch: {
      blacklistdata: function(newVal, oldVal) {
        this.numbers    = [...newVal];
        this.resetBlackList();
        if(this.numbers && this.numbers.length > 0) {
          this.numbers.forEach((number, index) => { number.rawNumberIndex = index; number.iseditable = false, number.isedited = false, number.blockedTillView = this.formatBlockedTill(number.BlockedTill)});
          this.rawNumbers = JSON.parse(JSON.stringify(this.numbers));
          this.searchStrDetail = '';
          this.defaultSortOrder();
        }
      }
    },
    methods: {
      resetBlackList() {
        this.rawNumbers = null;
        this.selectedRawNumberIndex = null;
        // this.preventEmitBlackListChanges = false;
      },
      addNumber(evt, type) {
        let _evt = evt || window.evt,
            _key = _evt.keyCode || _evt.which;
        if(type == 'btn' || (_key == 9 && type == 'blur')) {
          let _today              = new Date(),
              _todayPlusEightDays = _today.setDate(_today.getDate() + 8, true),
              _toDate             = new Date(_todayPlusEightDays),
              _newNumber          = {
                Id                   : -1,
                PhoneNumber          : '',
                IsRestricted         : false,
                BlockedTill          : _toDate.toISOString(),
                blockedTillView      : this.formatBlockedTill(_toDate),
                ServiceNumberId      : this.selectedsnid,
                Delete               : false,
                iseditable           : true,
                isedited             : true,
              };
          if(!this.rawNumbers) {
            this.rawNumbers           = [];
            this.numbers              = [];
            _newNumber.rawNumberIndex = 0;
          } else {
            _newNumber.rawNumberIndex = this.rawNumbers.length;
          }
          this.rawNumbers.push(Object.assign({}, _newNumber));
          this.filterList();
          this.$nextTick(() => {
            this.scrollToAddedNumber(_newNumber.rawNumberIndex);
            this.setFocusToAddedNumber(_newNumber.rawNumberIndex);
          });
          evt.preventDefault();
        }
      },
      deleteNumber(rawnumberindex) {
        this.rawNumbers[rawnumberindex].Delete = true;
        this.emitBlackListChanges(rawnumberindex);
        this.filterList();
      },
      updateRawNumbers(prop, val, rawnumberindex) {
        this.rawNumbers[rawnumberindex][prop] = val;
      },
      emitBlackListChanges(rawnumberindex) {
        this.rawNumbers[rawnumberindex].isedited = true;
        this.$emit('changedblacklistdata', this.rawNumbers);
        this.selectedRawNumberIndex = null;
      },
      //==========================================HELPER FUNCTIONS
      formatBlockedTill(val) {
        return ISOdateTimetoDate(val);
      },
      openDatePicker(evt, dateStr, rawnumberindex) {
        this.selectedRawNumberIndex = rawnumberindex;
        // this.preventEmitBlackListChanges = true;
        this.datePickerBlackList.setDate(dateStr, true);
        if(!this.datePickerBlackList.isVisible()) this.datePickerBlackList.show();
        // this.setCoordinatesDatePicker(evt); //Not working!!
      },
      setCoordinatesDatePicker(evt) {
        let _datepickerRect           = evt.target.getBoundingClientRect();
        this.datePickerBlackList.el.style.top  = _datepickerRect.top + 37 + 'px';
        this.datePickerBlackList.el.style.left = _datepickerRect.left + 'px';
      },
      updateBlockedTill(dateStr) {
        let _saveDate = saveFormatDate(dateStr);
        this.rawNumbers[this.selectedRawNumberIndex].blockedTillView = dateStr;
        this.rawNumbers[this.selectedRawNumberIndex].BlockedTill     = _saveDate;
        // if(this.preventEmitBlackListChanges) this.preventEmitBlackListChanges = true;
        // else this.emitBlackListChanges(this.selectedRawNumberIndex);
        this.emitBlackListChanges(this.selectedRawNumberIndex);
        this.filterList();
      },
      destroyDatePicker() {
        if(this.datePickerBlackList) {
          this.datePickerBlackList.destroy();
        }
      },
      scrollToAddedNumber(rawnumberindex) {
        let _dataNumberIndex = this.numbers.findIndex(number => number.rawNumberIndex == rawnumberindex);
        this.$refs.numberlistwrapper.$el.scrollTop = _dataNumberIndex * this.rowHeight;
      },
      setFocusToAddedNumber(rawnumberindex) {
        let _reffy = 'row' + rawnumberindex.toString();
        if(this.$refs[_reffy]) {
          this.$refs[_reffy].children[0].focus();
        } else {
          setTimeout(() => {
            this.$refs[_reffy].children[0].focus();
          }, 200);
        }
      },
      editNumber(rawnumberindex) {
        this.rawNumbers.forEach(number => {
          if(number.rawNumberIndex == rawnumberindex)
            number.iseditable = !number.iseditable;
          else
            number.iseditable = false;
        });
        this.filterList();
      },
      filterList() {
        this.numbers = this.filterListOnString(this.rawNumbers, this.searchStrDetail.toLowerCase());
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
            return (item.PhoneNumber.toLowerCase().indexOf(str) != -1 ||
            item.BlockedTill.toLowerCase().indexOf(str) != -1) &&
            !item.Delete;
          });
        } else {
          return [...list].filter(item => !item.Delete);
        }
      },
      defaultSortOrder() {
        this.sortSetting.order = 'NONE';
        this.sortSetting.key = 'PhoneNumber';
        this.sortColumn();
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
            this.numbers.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.numbers.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.numbers = this.filterListOnString(this.rawNumbers, this.searchStrDetail.toLowerCase());
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setDatePicker() {
        this.datePickerBlackList = new PikaDay({
          field: document.getElementById('datepickerblacklist'),
          format: 'DD-MM-YYYY',
          i18n: this.$store.state.settings.datepicker,
          parse: (dateString) => {
            parsePikaDayDateStr(dateString);
          },
          onSelect: (date) => {
            // let year = date.getFullYear()
            //   ,month = date.getMonth() + 1
            //   ,day = date.getDate()
            //   ,formattedDate = [
            //     day < 10 ? '0' + day : day
            //     ,month < 10 ? '0' + month : month
            //       ,year
            //     ].join('-')
            this.updateBlockedTill(pikaDayToDDMMYYYY(this.datePickerBlackList));
            // document.getElementById('datepickerblacklist').value = formattedDate;
            // this.updateBlockedTill(formattedDate);
          },
        });
      },
    },
    mounted() {
      this.setDatePicker();
    },
    beforeUnmount() {
      this.destroyDatePicker();
    }
  }

</script>


<style lang="scss">

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  #datepickerblacklist {
    opacity: 0;
    display: block;
    position: fixed;
    height: 0;
    padding: 0;
    margin: 0;
  }

</style>
