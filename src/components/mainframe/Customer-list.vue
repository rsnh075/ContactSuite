<template>
  <div data-e2e="customer-list">
    <div class="list-customerselect close--js" @click="close($event)">
      <div class="list-customerselect__window">
        <div class="list-wrapper list-wrapper--has-close">
          <div class="list-close">
            <a class="close--js" @click="close($event)"><span></span> <span></span></a>
          </div>
          <div class="list-topbar">
            <div class="list-topbar__content">
              <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.usermanagement.searchtxt" @keyup="filterList()">
              </div>
              <div class="typo-tabletitle">
                {{ totalCustomers + " " + $store.state.settings.usermanagement.customercountlabel }}
              </div>
            </div>
          </div>
          <div class="list-content-wrapper">
            <div class="list-content--back">
              <div class="list-content--header">
                <ExportListToXLSX
                :data="orderedList"
                :customBtnStyles="exportListBtnStyles"
                :customWrapperStyles="exportListWrapperStyles"
                />
                <div class="list-content__row--header">
                  <span class="list-content__row-cell" :class="tabelColumnWidth" @click="sortColumn(headerTitles[0], $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[0]"></span>
                  <span class="list-content__row-cell" :class="tabelColumnWidth" @click="sortColumn(headerTitles[1], $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[1]"></span>
                  <span class="list-content__row-cell" :class="tabelColumnWidth" @click="sortColumn(headerTitles[2], $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[2]" v-if="!isMassxess"></span>
                  <span class="list-content__row-cell" :class="tabelColumnWidth" @click="sortColumn(headerTitles[3], $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[3]" v-if="isMassxess"></span>
                  <span class="list-content__row-cell" :class="tabelColumnWidth" @click="sortColumn(headerTitles[4], $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[4]" v-if="isMassxess"></span>
                  <!-- <span class="list-content__row-cell" :class="tabelColumnWidth" @click="sortColumn(headerTitles[5], $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.colheads[5]"></span> -->
                </div>
              </div>
              <div class="list-content">
                <ol>
                  <li v-for="customer in orderedList" class="list-content__row list-content__row--clickable" @click="setSelectedCustomerId(customer)" :data-resellerId="customer.ResellerId">
                    <span class="list-content__row-cell" :class="tabelColumnWidth" v-html="customer.Name"></span>
                    <span class="list-content__row-cell" :class="tabelColumnWidth" v-html="customer.Code"></span>
                    <span class="list-content__row-cell" :class="tabelColumnWidth" v-html="customer.ExternalId"  v-if="!isMassxess"></span>
                    <span class="list-content__row-cell" :class="tabelColumnWidth" v-html="customer.DebtorNumber" v-if="isMassxess"></span>
                    <span class="list-content__row-cell" :class="tabelColumnWidth" v-html="customer.ResellerName" v-if="isMassxess"></span>
                    <!-- <span class="list-content__row-cell" :class="tabelColumnWidth" v-html="checkDate(customer.CreateDate)"></span> -->
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { validateValue }        from './../../helpers/validationRegex';
  import { dateToLocal }          from './../../use/dateFunctions';
  import { dynamicSort }          from '../../use/sortFunctions';
  import { IPCCCConfigurator }    from './../../ipccc/js/configurator';
  import { scrollTo }             from '../../use/helperFunctions';
  import ExportListToXLSX         from '../uielements/ExportListToXLSX.vue';

  export default {
    name: 'CustomerList',
    props: ['clist'],
    data: () => {
      return {
        REQUEST_OBJECT            : null,
        selectedCustomerId        : -1,
        selectedCustomerName      : '',
        selectedCustomerUsesCasa  : false,
        searchStr                 : '',
        minSearchLength           : 7,
        totalCustomers            : 0,
        headerTitles              : ['Name', 'Code', 'ExternalId', 'DebtorNumber', 'ResellerName'],
        sortSetting               : {},
        unOrderedList             : [],
        orderedList               : [],
        customerId                : -1,
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
    components: {
      ExportListToXLSX
    },
    computed: {
      isMassxess() {
        return this.$store.getters.getCustomerInfo().selectedCustomerId === 1
      },
      tabelColumnWidth() {
        return (this.customerId == 1 || this.selectedCustomerId != -1) ? 'list-content__row-cell--25' : 'list-content__row-cell--33';
      }
    },
    methods: {
      setSelectedCustomerId(customer) {
        this.selectedCustomerId       = customer.CustomerId;
        this.selectedCustomerName     = customer.Name;
        this.selectedCustomerUsesCasa = customer.UseCasa;
        this.$emit('customerChange', this.selectedCustomerId, this.selectedCustomerName, this.selectedCustomerUsesCasa);
        this.$emit('toggleCList');
      },
      close(evt) {
        evt.stopPropagation();
        let _target       = evt.target;
        if([..._target.classList].indexOf('close--js') != -1) {
          this.$emit('toggleCList');
        }
      },

      //=========================================================== START DISPLAY LIST METHODS
      filterList() {
        let _searchStrNr = this.searchStr.replace('+', '').replace('-', '');
        if(this.searchStr.length >= this.minSearchLength && validateValue(_searchStrNr, 'isNumber')) {
          //Search by SN when minSearchLength is reached and keys are numbers, instead of searching in unOrderedList!
          let _obj = {
            Number: `%${_searchStrNr.replace('-', '')}%`,
            ResellerId: this.customerId,
            CustomerId: -1
          };
          IPCCCConfigurator.Request(this.customerId, 'searchportalnumbers', 'readall', _obj, -1)
            .then(result => {
              let _cusIds   = [],
                  _rawList  = [];

              result.forEach(_customer => {
                _cusIds.push(_customer.CustomerId);
              });

              _rawList = this.unOrderedList.filter(__customer => {
                if(_cusIds.indexOf(__customer.CustomerId) != -1) {
                  return __customer;
                }
              });

              this.orderedList = [..._rawList];
              this.totalCustomers = this.orderedList.length;
            }).catch(error => {
              console.error(error);
            });
        } else {
          this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
          this.totalCustomers = this.orderedList.length;
          this.sortColumn();
        }
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list],
              _keys;
          return _rawList.filter(item => {
            if(this.customerId == 1) {
              _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                      item['Code'].toLowerCase().indexOf(str) != -1 ||
                      item['ResellerName'].toLowerCase().indexOf(str) != -1 ||
                      String(item['DebtorNumber']).indexOf(str) != -1 ||
                      String(dateToLocal(item['CreateDate'])).indexOf(str) != -1;
            } else {
              _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                      item['Code'].toLowerCase().indexOf(str) != -1 ||
                      String(item['DebtorNumber']).indexOf(str) != -1 ||
                      String(dateToLocal(item['CreateDate'])).indexOf(str) != -1;
            }
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
            this.totalCustomers = this.orderedList.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setHighlightedRow(id) {
        let _wrapper = null;
        document.querySelectorAll('[data-customerId]').forEach(el => {
          _wrapper = el.parentElement.parentElement;
          if (el.getAttribute('data-customerId') == id) {
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
      this.customerId          = this.$store.state.loginSession.Details.CustomerId;
      this.selectedCustomerId  = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.totalCustomers      = 0;
      this.unOrderedList       = [...this.clist];
      this.orderedList         = [...this.unOrderedList];
      this.totalCustomers      = this.orderedList.length;
    }
  }

</script>

<style lang="scss" scoped>
    @use "@/scss/includes/list";
</style>