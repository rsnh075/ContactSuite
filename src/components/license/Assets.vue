 <template>
  <div data-e2e="asset">
<!-- CONFIRM DIALOG ------------------------------------------------------------------------------------------>
    <div :class="['dialog__modal', {'dialog__modal--open' : showDialogAlert}]">
      <div :class="['dialog__window', 'dialog__window--w500', {'dialog__window--open' : showDialogAlert}]" id="dialog-window">
        <div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
          <span>{{ $store.state.settings.assets.dialogheader }}</span>
        </div>
        <div class="dialog__window-body">
          <div class="grid-row">
            <p>
            {{ $store.state.settings.assets.dialogbody }}
            <span v-if="selAsset.LicenseId != ''">{{ $store.state.settings.assets.dialoglicencebody }}</span>
            <span v-if="roles.length != 0">{{ $store.state.settings.assets.dialogrolebody }}</span>
            </p>
            <div v-if="roles.length != 0">
              <p v-for="role in roles" :key="role.Id">{{ role.Name }} : {{ role.Description }}</p>
            </div>
          </div>
        </div>
        <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
          <a class="button-primary dialog__window-ok" @click="deleteAsset">{{ $store.state.settings.assets.btnconfirmlabel }}</a>
          <a class="button-primary dialog__window-cancel" @click="showConfirm">{{ $store.state.settings.assets.btncancellabel }}</a>
        </div>
      </div>
    </div>
<!-- ASSETS LIST SCREEN ------------------------------------------------------------------------------------------>
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.assets.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalAssets + " " + $store.state.settings.assets.assetcountlabel}}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="addAssetDetailCode()">{{ $store.state.settings.assets.addassetdetailcodelabel }}</button>
              <button @click="addAsset()">{{ $store.state.settings.assets.addassetlabel }}</button>
            </div>
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
              <span class="list-content__row-cell list-content__row-cell--25" @click="sortColumn('Name', $event)" data-sortorder="NONE" v-html="$store.state.settings.assets.colheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--75" v-html="$store.state.settings.assets.colheads[1]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="(item, index) in orderedList" class="list-content__row list-content__row--clickable" @click="getAsset($event)" :data-assetId="item.AssetId" :key="index">
                <span class="list-content__row-cell list-content__row-cell--25" v-html="item.Name"></span>
                <span class="list-content__row-cell list-content__row-cell--75" v-html="item.Description"></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

<!-- ADD ASSET DETAIL CODE MODAL ------------------------------------------------------------------------------------------>
    <component-modal :visible="showAddAssetDetailCodeModal">
      <add-asset-detail-code
      v-if="showAddAssetDetailCodeModal"
      :payload="addAssetDetailCodeData"
      @close="showAddAssetDetailCodeModal = false"
      />
    </component-modal>

<!-- ASSET ------------------------------------------------------------------------------------------>
    <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : screenStatus != 'list'}]">
      <div class="detailscreen" id="detailscreen">
        <a href="javascript:;" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
        <form @valid="saveAsset()" @notvalid="shakeIt()" v-validate="{'submitBtns': 'js-submitbtn'}">
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <span class="detailscreen__title">{{ selAsset.Name }}</span>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="asset-name" id="asset-name" :placeholder="$store.state.settings.assets.namelabel" v-model="selAsset.Name" data-validate="isNotEmpty" :data-message="$store.state.settings.assets.forms.messagename">
                <label for="asset-name" class="form-label form-label--hidden">{{ $store.state.settings.assets.namelabel }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.assets.helptextassetname }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="asset-description" id="asset-description" :placeholder="$store.state.settings.assets.descriptionlabel" v-model="selAsset.Description">
                <label for="asset-description" class="form-label form-label--hidden">{{ $store.state.settings.assets.descriptionlabel }}</label>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.assets.helptextassetdesc }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <div class="grid-unit--alpha grid-unit--alpha--bottomline">
            </div>
          </div>

<!-- ASSET DETAILS ------------------------------------------------------------------------------------------>
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-selectfield form-selectfield--inline-bground">
                <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.assets.addassetdetaillabel }}</label>
                <select @change="addAssetDetail($event)">
                  <option selected>{{ $store.state.settings.assets.addassetdetaillabel }}</option>
                  <option v-for="code in freeCodeList" :value="code.Code" :key="code.AssetDetailId">{{ code.Code }}</option>
                </select>
                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.assets.helptextdetailcode }}</div>
              </div>
              <input type="hidden" v-model="totalSelectedDetails" data-validate="isNotZero" :data-message="$store.state.settings.assets.forms.messageadddetail">
              <span :class="['form-errorbox-floater', {'form-errorbox-floater--top80 form-errorbox-floater--show' : (totalSelectedDetails == 0)}]">
                {{ $store.state.settings.assets.forms.messageadddetail }}
              </span>
            </div>
            <div class="grid-unit--beta">

            </div>
          </div>

          <div v-for="detail in selectedAsset" :key="detail.AssetDetailId">
            <div class="grid-row"><div class="grid-unit--alpha">
                <span class="detailscreen__title--medium">{{ detail.Name }}
                  <a href="javascript:;" class="button-inline button-inline--icon-delete" @click="deleteAssetDetail(detail.Code)"></a>
                </span>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-unit--beta">
                <div class="form-selectfield form-selectfield--inline-bground">
                  <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.assets.detailcodelabel }} {{ detail.Name }}}</label>
                  <select @change="updateAssetDetail($event, detail.Code)">
                    <option selected>{{ detail.Code }}</option>
                    <option v-for="code in freeCodeList" :value="code.Code" :key="code.AssetDetailId">{{ code.Code }}</option>
                  </select>
                  <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.assets.helptextdetailcode }}</div>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input type="text" :name="'detail-name'+detail.AssetDetailId" :id="'detail-name'+detail.AssetDetailId" :placeholder="$store.state.settings.assets.detailnamelabel" v-model="detail.Name">
                  <label :for="'detail-name'+detail.AssetDetailId" class="form-label form-label--hidden">{{ $store.state.settings.assets.detailnamelabel }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.assets.helptextdetailname }}</div>
                </div>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-unit--alpha">
                <div class="form-textfield form-textfield--bground">
                  <input type="text" :name="'detail-desc'+detail.AssetDetailId" :id="'detail-desc'+detail.AssetDetailId" :placeholder="$store.state.settings.assets.detaildesclabel" v-model="detail.Description">
                  <label :for="'detail-desc'+detail.AssetDetailId" class="form-label form-label--hidden">{{ $store.state.settings.assets.detaildesclabel }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.assets.helptextdetaildesc }}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div class="detailscreen-footer detailscreen-footer--inside">
          <span>
            <a class="button-primary button-primary--delete" @click="checkRoles">{{ $store.state.settings.assets.btndeletelabel }}</a>
          </span>
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.assets.btncancellabel }}</a>
            <a class="button-primary button-primary js-submitbtn">{{ $store.state.settings.assets.btnsavelabel }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { ValidateDir }  from './../../directives/validate';
  import ComponentModal   from '../componentmodal/ComponentModal.vue';
  import AddAssetDetailCode from './AddAssetDetailCode.vue';
  import { dynamicSort } from './../../use/sortFunctions';
  import ExportListToXLSX from '../uielements/ExportListToXLSX.vue';

  const showModalDialog = (options) => {
        boxProps.value = {
          boxType      : options.type || 'alert',
          boxShow      : options.visible || true,
          boxHeader    : options.header ?? 'Alert',
          boxMessage   : options.message || 'Alert',
          buttonlabels : {
            okelabel      : options.okelbl || 'OK',
            cancellabel   : options.cancellbl || 'Cancel'
          },
          confirmFn    : options.callback || null,
        }
      };
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'Assets',
    data: () => {
      return {
        customerId          : -1,
        screenStatus        : 'list',
        searchStr           : '',
        sortSetting         : {},
        totalAssets         : 0,
        unOrderedList       : [],
        orderedList         : [],
        newAsset            : false,
        binderVal           : -1,
        selAsset            : {},
        showHelp            : false,
        showDialogAlert     : false,
        roles               : [],
        themes              : [
          {"className" : "unknown"},
          {"className" : "unknown"}
        ],
        dummyDetail         : {},
        newDetailFlag       : false,
        hasDummyData        : false,
        assetDetailCodeList : [],
        addAssetDetailCodeData: {},
        showAddAssetDetailCodeModal: false,
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
      AddAssetDetailCode,
      ComponentModal,
      ExportListToXLSX
    },
    directives: {
      Validate: ValidateDir,
    },
    computed: {
      selectedAsset() {
        if(this.selAsset.AssetDetails)
          return this.selAsset.AssetDetails.filter(detail => detail.AssetId != this.binderVal);
        else
          return false;
      },
      freeCodeList() {
        if(this.selAsset.AssetDetails)
          return this.selAsset.AssetDetails.filter(detail => detail.AssetId == this.binderVal);
        else
          return false;
      },
      totalSelectedDetails() {
        return this.selectedAsset !== false ? this.selectedAsset.length : -1;
      }
    },
    methods: {
      addAssetDetail(evt) {
        let _selectedCode            = evt.target.value,
            _indexOfAssetDetail      = this.selAsset.AssetDetails.findIndex(detail => detail.Code == _selectedCode);

        if(_indexOfAssetDetail >= 0) {
          let _removedDetail        = this.selAsset.AssetDetails.splice(_indexOfAssetDetail, 1);
          _removedDetail[0].AssetId = this.selAsset.AssetId;
          this.selAsset.AssetDetails.unshift(_removedDetail[0]);
        }
      },
      updateAssetDetail(evt, currentDetailCode) {
        let _selectedCode          = evt.target.value,
            _indexOfSelectedDetail = this.selAsset.AssetDetails.findIndex(detail => detail.Code == _selectedCode),
            _indexOfCurrentDetail  = this.selAsset.AssetDetails.findIndex(detail => detail.Code == currentDetailCode);

        if(_indexOfSelectedDetail >= 0 && _indexOfCurrentDetail >= 0) {
          this.swapElement(this.selAsset.AssetDetails, _indexOfSelectedDetail, _indexOfCurrentDetail)
          //change the bindings - (current is selected)
          this.selAsset.AssetDetails[_indexOfCurrentDetail].AssetId  = this.selAsset.AssetId;
          this.selAsset.AssetDetails[_indexOfSelectedDetail].AssetId = this.binderVal;
        }
      },
      deleteAssetDetail(deletedDetailCode) {
        let _indexOfAssetDetail = this.selAsset.AssetDetails.findIndex(detail => detail.Code == deletedDetailCode)
        this.selAsset.AssetDetails[_indexOfAssetDetail].AssetId = this.binderVal;
      },
      showAsset() {
        this.screenStatus     = 'assetdetail';
        this.showHelp         = false;
      },
      getAsset(evt) {
        this.showLoader(true);
        let _assetId = evt.currentTarget.getAttribute('data-assetId');
        IPCCCConfigurator.Request(this.customerId, 'asset', 'readone', null, _assetId).then(response => {
          this.selAsset            = response;
          this.dummyDetail.AssetId = -1;
          this.newAsset            = false;
          this.binderVal           = -1;
          this.showAsset();
          this.showLoader(false);
        }).catch(error => {
          console.error(error);
        });
      },
      addAsset() {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'asset', 'readnew', null, null).then(response => {
          this.selAsset            = response;
          this.dummyDetail.AssetId = -2;
          this.newAsset            = true;
          this.binderVal           = -2;
          this.showAsset();
          this.showLoader(false);
        }).catch(error => {
          console.error(error);
        });
      },
      saveAsset() {
        let _dummyIndex       = null,
            _filteredDummyData  = [];

        _filteredDummyData          = this.selAsset.AssetDetails.filter(el => el.Code != this.dummyDetail.Code);
        this.selAsset.AssetDetails  = _filteredDummyData;
        //check total after elimination of dummy data

        if (this.totalSelectedDetails == 0) {
          return;
        } else {
          this.selAsset.AssetDetails.filter(el => el.AssetId != this.binderVal);
          this.selAsset.Theme = 'unknown';
          IPCCCConfigurator.Request(this.customerId, 'asset', 'save', this.selAsset, this.selAsset.AssetId).then(response => {
            this.updateAssetList(response, 'save');
          }).catch(error => {
            console.error(error);
          });
        }
      },
      getAssetdetailCodeList() {
        this.showLoader(true);
        return new Promise((resolve, reject) => {
          IPCCCConfigurator.Request(this.customerId, 'assetdetail', 'list', null, -1).then(response => {
            this.assetDetailCodeList = [];
            resolve(response)
            this.showLoader(false);
          }).catch(error => {
            this.showLoader(false);
            reject(console.error('Error: ' + error));
          });
        });
      },
      addAssetDetailCode() {
        this.getAssetdetailCodeList().then((data) => {
          this.assetDetailCodeList = [...data];
          this.addAssetDetailCodeData = {
            customerId       : this.$store.getters.getCustomerInfo().customerId,
            userId           : this.$store.state.loginSession.Details.UserId,
            assetDetailCodes : this.assetDetailCodeList.sort(dynamicSort('Code')),
            assetList        : this.unOrderedList
          }
          this.showAddAssetDetailCodeModal = true;
        });
      },
      checkRoles() {
        if (this.selAsset.LicenseId > 0) {
          IPCCCConfigurator.Request(this.customerId, 'rolecheck', 'list', null, this.selAsset.AssetId).then(response => {
            this.roles = response;
            this.showConfirm();
          }).catch(error => {
            console.error(error);
          });
        } else {
          this.deleteAsset();
        }
      },
      deleteAsset() {
        IPCCCConfigurator.Request(this.customerId, 'asset', 'delete', this.selAsset, null).then(response => {
          this.updateAssetList(response, 'delete');
        }).catch(error => {
          console.error(error);
        });
      },
      updateAssetList(assetData, action) {
        let _assetToUpdateId    = -1,
            _assetToUpdateIndex = -1,
            _newAsset           = {};

        this.unOrderedList.map((asset, index) => {
          if( (asset.AssetId == assetData.AssetId) ) {
            _assetToUpdateId    = asset.AssetId;
            asset.Description   = assetData.Description;
            asset.Name          = assetData.Name;
            _assetToUpdateIndex = index;
          }
        });

        if( (_assetToUpdateId == -1) && (action != 'delete') ) {
          _newAsset.AssetId       = assetData.AssetId;
          _newAsset.Description   = assetData.Description;
          _newAsset.Name          = assetData.Name;
          this.unOrderedList.push(_newAsset);
        }

        if( (action == 'delete') && (_assetToUpdateIndex != -1) )
          this.unOrderedList.splice(_assetToUpdateIndex, 1)

        this.orderedList  = [...this.unOrderedList];
        this.totalAssets  = this.orderedList.length;

        this.filterList();
        this.sortColumn();
        this.setHighlightedRow(_assetToUpdateId);
        this.backToList();
        this.showLoader(false);
      },
      backToList() {
        this.showDialogAlert  = false;
        this.showHelp         = false;
        this.newDetailFlag    = false;
        this.hasDummyData     = false;
        this.dummyDetail      = {
          "Code"           : this.$store.state.settings.assets.chooseoption,
          "AssetId"        : null
        };
        this.screenStatus     = 'list';
      },
      showConfirm() {
        this.showDialogAlert = !this.showDialogAlert;
      },
      updateTheme() {

      },
      //=========================================================== START DISPLAY LIST METHODS
      filterList() {
        this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
        this.totalAssets    = this.orderedList.length;
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list],
              _keys;
          return _rawList.filter(item => {
            _keys = item['Name'].toLowerCase().startsWith(str);
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
          document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
          this.sortSetting = {
            'key'   : key,
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
            this.totalAssets    = this.orderedList.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setHighlightedRow(id) {
        let _wrapper = null;
        document.querySelectorAll('[data-assetId]').forEach(el => {
          _wrapper = el.parentElement.parentElement;
          if (el.getAttribute('data-assetId') == id) {
            el.classList.add('list-content__row--mutated');
            scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
          } else
            el.classList.remove('list-content__row--mutated');
        });
        if(id == -2 && _wrapper !== null)
          scrollTo(_wrapper, 0, 200);
      },
      //=========================================================== START HELPER METHODS
      swapElement(list, indexA, indexB) {
        let _tempVar = list[indexB];
        list[indexB] = list[indexA];
        list[indexA] = _tempVar;
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      //=========================================================== END HELPER METHODS
      init() {
        IPCCCConfigurator.Request(this.customerId, 'asset', 'list', null, -1).then(response => {
          this.unOrderedList    = [...response];
          this.orderedList      = [...this.unOrderedList];
          //this.totalLicense     = this.orderedList.length;
          this.totalAssets      = this.orderedList.length;
          this.showLoader(false);
        }).catch(error => {
          console.error(error);
        });
      },
    },
    mounted() {
      this.dummyDetail    = {
        "Code"           : this.$store.state.settings.assets.chooseoption,
        "AssetId"        : null
      };
      this.customerId     = this.$store.getters.getCustomerInfo().customerId;

      if(this.customerId !== -1)
        this.init();
      else
        this.showLoader(true);


      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        if(this.customerId !== -1) {
          this.unOrderedList = this.orderedList = [];
          this.totalAssets   = 0;
          this.backToList();
        }
        this.customerId = cObj.customerId;
        this.init();
      });

    },
    beforeUnmount() {
      this.storeWatch();
    }

  }
</script>
