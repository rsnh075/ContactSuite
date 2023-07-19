<template>
  <div data-e2e="roles">
    <!-- DIALOG CONFIRM -->
    <div :class="['dialog__modal', { 'dialog__modal--open': showDialog }]" v-if="roleDetail != null">
      <div :class="['dialog__window', 'dialog__window--w500', { 'dialog__window--open': showDialog }]" id="dialog-window">
        <div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
          <span>{{ $store.state.settings.roles.deleteroleconformationheader }}</span>
        </div>
        <div class="dialog__window-body">
          <div class="grid-row">
            <div v-if="userAfectedList != ''">
              <p v-html="$store.state.settings.roles.deleterolewithusers01 + '&nbsp;' + roleDetail.Name + '&nbsp;' + $store.state.settings.roles.deleterolewithusers02 + '<br>' + userAfectedList"></p>
            </div>
            <div v-else>
              <p v-html="$store.state.settings.roles.deleterolewithnousers01 + '&nbsp;' + roleDetail.Name + '&nbsp;' + $store.state.settings.roles.deleterolewithnousers02"></p>
            </div>
          </div>
        </div>
        <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
          <a class="button-primary button-primary--important dialog__window-ok" @click="deleteRole">{{ $store.state.settings.roles.deleterolelabel }}</a>
          <a class="button-primary dialog__window-cancel" @click="hideConfirm">{{ $store.state.settings.roles.deletecancellabel }}</a>
        </div>
      </div>
    </div>

    <!-- ROLES LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.roles.searchtxt" @keyup="filterList()" />
          </div>
          <div class="typo-tabletitle">
            {{ totalRoles + " " + $store.state.settings.roles.rolecountlabel }}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="showRole($event)" :data-roleid="-1">{{ $store.state.settings.roles.addrolelabel }}</button>
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
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('Name', $event)" data-sortorder="NONE" v-html="$store.state.settings.roles.colheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--40" @click="sortColumn('Description', $event)" data-sortorder="NONE" v-html="$store.state.settings.roles.colheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--10" v-html="$store.state.settings.roles.colheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" v-html="$store.state.settings.roles.colheads[3]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="(role, _key) in orderedList" :key="_key" class="list-content__row list-content__row--clickable" @click="showRole($event)" :data-roleid="role.RoleId">
                <span class="list-content__row-cell list-content__row-cell--20" v-html="role.Name"></span>
                <span class="list-content__row-cell list-content__row-cell--40" v-html="role.Description"></span>
                <span class="list-content__row-cell list-content__row-cell--10" v-html="role.NumberOfAssignedAssetDetails"></span>
                <span class="list-content__row-cell list-content__row-cell--15 list-content__row-cell--right" v-html="rolePrice(role.Currency, role.PricePerDay, 0)"></span>
                <span class="list-content__row-cell list-content__row-cell--15 list-content__row-cell--right" v-html="rolePrice(role.Currency, 0, role.PricePerMonth)"></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!---- ROLE-DETAIL ---->
    <div :class="['detailscreen-wrapper', { 'detailscreen-wrapper--visable': screenStatus != 'list' }]" v-if="roleDetail != null">
      <div class="detailscreen detailscreen--nopadding-bottom" id="detailscreen">
        <a :class="['button-help', { 'button-help--active': showHelp }]" @click="displayHelp">?</a>
        <form @valid="saveRole()" @notvalid="shakeIt()" v-validate="{ submitBtns: 'js-submitbtn' }">
          <div class="grid-row grid--pull ruler--bottom">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="role-name" id="role-name" :placeholder="$store.state.settings.roles.detailnamelabel" v-model="roleDetail.Name" data-validate="isNotEmpty" :data-message="$store.state.settings.roles.detailnamelabel" />
                <label for="role-name" class="form-label form-label--hidden">{{ $store.state.settings.roles.detailnamelabel }}</label>
                <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.roles.helptextname }}</div>
              </div>
            </div>
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input
                  type="text"
                  name="license-code"
                  id="license-code"
                  :placeholder="$store.state.settings.roles.detaildescription"
                  v-model="roleDetail.Description"
                  data-validate="isNotEmpty"
                  :data-message="$store.state.settings.roles.detaildescription"
                />
                <label for="license-code" class="form-label form-label--hidden">{{ $store.state.settings.roles.detaildescription }}</label>
                <div :class="['typo-helptext', { 'typo-helptext--active': showHelp }]">{{ $store.state.settings.roles.helptextdescription }}</div>
              </div>
            </div>
          </div>
          <div class="grid-row grid--pull grid-row--no-padding">
            <div class="grid-unit--gamma-fixed">
              <div class="license-list-wrapper license-list-wrapper--border-right">
                <div v-for="(license, key) in roleDetail.RoleToLicenses" :key="key">
                  <span :class="license.Theme + '--treelist'">{{ license.Name }}</span>
                  <div v-for="(asset, index) in license.RoleToAssets" class="license-list__item" :key="index" :ref="'ass_' + key + '_' + index">
                    <input type="checkbox" :name="'ass_' + key + '_' + index" :id="'ass_' + key + '_' + index" v-model="asset.IsAssigned" @click="showAssetDetails($event, key, index, asset.Name)" />
                    <label :for="'ass_' + key + '_' + index" :data-e2e="asset.Name"></label>
                    <button type="button" @click="showAssetDetails($event, key, index, asset.Name)" :ref="'btn_' + key + '_' + index">{{ asset.Name }}</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid-unit--gamma-fixed-double">
              <div class="license-list-wrapper license-list-wrapper_assetdetails">
                <div class="license-list-wrapper_assetdetails-header" v-show="assetHeader != ''">{{ assetHeader }}</div>
                <div v-for="(aDet, index) in roleDetail.RoleToLicenses[licenseIndex].RoleToAssets[assetIndex].RoleToAssetDetails" :key="index" class="license-list-wrapper_assetdetail">
                  <input type="checkbox" :name="'ad_' + index" :id="'ad_' + index" v-model="aDet.IsAssigned" @click="setAssetDetail(index, aDet.IsAssigned)" />
                  <label :for="'ad_' + index">
                    <span class="license-list-wrapper_assetdetail-name">{{ aDet.Name }}</span>
                    <span class="license-list-wrapper_assetdetail-description">{{ aDet.Description }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div class="detailscreen-footer detailscreen-footer--inside">
          <span>
            <a v-if="screenStatus == 'detail-show' && roleDetail.RoleId != -1" class="button-primary button-primary--delete" @click="showConfirmDeleteRole">{{ $store.state.settings.roles.btndeletelabel }}</a>
          </span>
          <span class="grid--push">
            <a v-show="screenStatus == 'detail-show'" class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.roles.btncancellabel }}</a>
            <a v-show="screenStatus == 'detail-show'" class="button-primary button-primary js-submitbtn">{{ $store.state.settings.roles.btnsavelabel }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ValidateDir } from "./../../directives/validate";
import { scrollTo }    from './../../use/helperFunctions';
import { dynamicSort } from './../../use/sortFunctions';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import ExportListToXLSX from '../uielements/ExportListToXLSX.vue';

export default {
  name: "Roles",
  data: () => {
    return {
      customerId: -1,
      searchStr: "",
      sortSetting: {},
      screenStatus: "list",
      totalRoles: 0,
      unOrderedList: [],
      orderedList: [],
      unitList: [],
      roleDetail: null,
      showHelp: false,
      assetHeader: "",
      licenseIndex: 0,
      assetIndex: 0,
      showDialog: false,
      userAfectedList: "",
      roletolicensescount: 0,
      storeWatch: null,
      exportListBtnStyles  : {
        top: '9px',
        right: '8px',
        zIndex: 1
      },
      exportListWrapperStyles : {
        top: '9px',
        right: '8px',
      },
    };
  },
  inject: ["showLoader"],
  components: {
    ExportListToXLSX
  },
  directives: {
    Validate: ValidateDir,
  },
  methods: {
    roletolicenses() {
      let _l = 0;
      if (this.roleDetail.RoleToLicenses) _l = this.roleDetail.RoleToLicenses.length;

      this.roletolicensescount = _l;

      return _l;
    },
    rolePrice(cur, pd, pm) {
      let _price = "-",
        _cur = "";

      switch (cur) {
        case "EUR":
          _cur += "&euro;&nbsp;";
          break;
        case "XEU":
          _cur += "Invalid articlecode!";
          break;
        default:
          _cur += "&euro;&nbsp;";
          break;
      }

      if (parseFloat(pd) != 0) {
        _price = this.formatPrice(_cur, pd).replace(".", ",") + "&nbsp;" + this.unitList[2];
      }

      if (parseFloat(pm) != 0) {
        _price = this.formatPrice(_cur, pm).replace(".", ",") + "&nbsp;" + this.unitList[1];
      }

      return _price;
    },
    formatPrice(c, p) {
      let _p;
      if (parseFloat(p) != 0) {
        _p = c + (Math.round(p * 100) / 100).toString();
        _p = _p.indexOf(".") != -1 ? _p : _p + ".00";
      } else _p = "&nbsp;&nbsp;";

      return _p;
    },
    filterList() {
      this.orderedList = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
      this.totalCustomers = this.orderedList.length;
      this.sortColumn();
    },
    filterListOnString(list, str) {
      if (str != "") {
        let _rawList = [...list],
          _keys;
        return _rawList.filter((item) => {
          _keys = item["Name"].toLowerCase().startsWith(str);
          return _keys;
        });
      } else {
        return [...list];
      }
    },
    sortColumn(key, e = null) {
      let _order, _t;

      if (e != null) {
        _t = e.target;
        _order = _t.getAttribute("data-sortOrder");
        document.querySelectorAll("[data-sortorder]").forEach((a) => a.setAttribute("data-sortorder", "NONE"));
        this.sortSetting = {
          key: key,
          order: _order,
        };
        this.setHighlightedRow(-2);
      } else {
        _order = this.sortSetting.order;
        key = this.sortSetting.key;
      }

      switch (_order) {
        case "NONE":
          this.orderedList.sort(dynamicSort(key));
          if (e != null) _t.setAttribute("data-sortOrder", "ASC");
          break;
        case "ASC":
          this.orderedList.sort(dynamicSort("-" + key));
          if (e != null) _t.setAttribute("data-sortOrder", "DES");
          break;
        case "DES":
          this.orderedList = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
          this.totalCustomers = this.orderedList.length;
          if (e != null) _t.setAttribute("data-sortOrder", "NONE");
          break;
      }
    },
    showRole(evt) {
      this.showLoader(true);
      let _rId = evt.currentTarget.getAttribute("data-roleid"),
          _dataOperation = _rId == -1 ? "readnew" : "readone";

      IPCCCConfigurator.Request(
        this.$store.getters.getCustomerInfo().selectedCustomerId,
        "role",
        _dataOperation,
        null,
        _rId).then(response => {
          this.roleDetail = response;
          this.roleDetail.RoleToLicenses.sort(dynamicSort("Name"));
          this.screenStatus = "detail-show";
          this.showLoader(false);
          setTimeout(() => {
            this.$refs["btn_0_0"][0].click();
          }, 200);
        }).catch(error => {
          console.error(error);
        }
      );
    },
    setAssetDetail(index, isassigned) {
      this.roleDetail.RoleToLicenses[this.licenseIndex].RoleToAssets[this.assetIndex].RoleToAssetDetails[index].IsAssigned = !isassigned;
      this.checkAsset();
    },
    saveRole() {
      this.showLoader(true);
      IPCCCConfigurator.Request(
        this.$store.getters.getCustomerInfo().selectedCustomerId,
        "role",
        "save",
        this.roleDetail,
        this.roleDetail.RoleId)
        .then(response => {
          this.updateRoleList(response);
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        }
      );
    },
    showConfirmDeleteRole() {
      this.showLoader(true);
      IPCCCConfigurator.Request(
        this.$store.getters.getCustomerInfo().selectedCustomerId,
        "userrole",
        "list",
        null,
        this.roleDetail.RoleId)
        .then(response => {
          if (response.UserNameList.length > 10) this.userAfectedList = response.UserNameList.toString() + "... (+" + response.TotalAffectedUsers + ")";
          else this.userAfectedList = response.UserNameList.toString();
          this.showConfirm();
          this.showLoader(false);
        }).catch(error => {
          this.userAfectedList = "";
          this.showConfirm();
          console.error(error);
        }
      );
    },
    deleteRole() {
      IPCCCConfigurator.Request(
        this.$store.getters.getCustomerInfo().selectedCustomerId,
        "role",
        "delete",
        this.roleDetail,
        this.roleDetail.RoleId)
        .then(response => {
          this.hideConfirm();
          this.updateDeletedRoleList(response);
        }).catch(
        (error) => {
          this.showLoader(false);
          console.error(error);
        }
      );
    },
    showAssetDetails(evt, licenseIndex, assetIndex, aName) {
        const refName = "ass_" + licenseIndex + "_" + assetIndex;
        const _activeItem = this.$refs[refName][0];
        const _items = _activeItem.parentElement.parentElement.querySelectorAll(".license-list__item");

        _items.forEach((item) => item.classList.remove("license-list__item--active"));
        _activeItem.classList.add("license-list__item--active");

        this.assetHeader = aName;
        this.licenseIndex = licenseIndex;
        this.assetIndex = assetIndex;

        if (evt.target.type == "checkbox") {
            this.roleDetail.RoleToLicenses[licenseIndex].RoleToAssets[assetIndex].RoleToAssetDetails.forEach((detail) => (detail.IsAssigned = evt.target.checked));
        }
    },
    checkAsset() {
      let _nrOfChecked = this.roleDetail.RoleToLicenses[this.licenseIndex].RoleToAssets[this.assetIndex].RoleToAssetDetails.filter((detail) => detail.IsAssigned == true);
      if (_nrOfChecked.length == 0) this.roleDetail.RoleToLicenses[this.licenseIndex].RoleToAssets[this.assetIndex].IsAssigned = false;
      else this.roleDetail.RoleToLicenses[this.licenseIndex].RoleToAssets[this.assetIndex].IsAssigned = true;
    },
    showConfirm() {
      this.showDialog = true;
    },
    hideConfirm() {
      this.showDialog = false;
    },
    backToList() {
      this.showHelp = false;
      this.assetHeader = "";
      this.screenStatus = "list";
      this.showLoader(false);
    },
    displayHelp() {
      this.showHelp = !this.showHelp;
    },
    shakeIt() {
      let _elm = document.querySelector("#detailscreen");
      _elm.classList.add("detailscreen--shake");
      setTimeout(() => {
        _elm.classList.remove("detailscreen--shake");
      }, 1000);
    },
    updateDeletedRoleList(roleData) {
      let _roleToUpdateIndex = -1;
      this.totalRoles = 0;

      this.unOrderedList.map((role, index) => {
        if (role.RoleId == roleData.RoleId) {
          _roleToUpdateIndex = index;
        }
      });

      if (_roleToUpdateIndex != -1) this.unOrderedList.splice(_roleToUpdateIndex, 1);
      //MESSAGE?
      else this.orderedList = [...this.unOrderedList];
      this.totalUsers = this.orderedList.length;

      this.filterList();
      this.sortColumn();
      this.backToList();
      this.showLoader(false);
    },
    updateRoleList(roleData) {
      let _roleToUpdateIndex = -1;
      this.totalRoles = 0;

      this.unOrderedList.map((role, index) => {
        if (role.RoleId == roleData.RoleId) {
          _roleToUpdateIndex = index;
        }
      });

      if (_roleToUpdateIndex != -1) this.unOrderedList[_roleToUpdateIndex] = roleData;
      else this.unOrderedList.push(roleData);

      this.orderedList = [...this.unOrderedList];
      this.totalUsers = this.orderedList.length;

      this.filterList();
      this.sortColumn();
      this.backToList();
      this.showLoader(false);
    },
    setHighlightedRow(id) {
      let _wrapper = null;
      document.querySelectorAll("[data-roleid]").forEach((el) => {
        _wrapper = el.parentElement.parentElement;
        if (el.getAttribute("data-roleid") == id) {
          el.classList.add("list-content__row--mutated");
          scrollTo(_wrapper, el.offsetTop - el.offsetHeight, 300);
        } else el.classList.remove("list-content__row--mutated");
      });
      if (id == -2 && _wrapper !== null) scrollTo(_wrapper, 0, 200);
    },
    resetDisplay() {
      this.searchStr = "";
      this.sortSetting = {};
      this.screenStatus = "list";
      this.totalRoles = 0;
      this.unOrderedList = [];
      this.orderedList = [];
      this.roleDetail = null;
      (this.showHelp = false), (this.assetHeader = "");
      this.licenseIndex = 0;
      this.assetIndex = 0;
      this.showDialog = false;
      this.userAfectedList = "";
      this.roletolicensescount = 0;
    },
    getRoles(cusId) {
      IPCCCConfigurator.Request(
        cusId,
        "role",
        "list",
        null,
        -1)
        .then(response => {
          this.totalRoles = 0;
          this.unOrderedList = [...response];
          this.orderedList = [...this.unOrderedList];
          this.totalRoles = this.orderedList.length;
          this.showLoader(false);
        }).catch(error => {
          console.error(error);
          this.showLoader(false);
        }
      );
    },
  },
  mounted() {
    this.customerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
    this.unitList = this.$store.state.settings.roles.unitlist;
    this.showLoader(true);
    if (this.customerId !== -1) this.getRoles(this.customerId);

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, (cObj) => {
      this.showLoader(true);
      if (this.customerId !== -1) {
        this.resetDisplay();
      }
      this.getRoles(cObj.selectedCustomerId);
    });
  },
  beforeUnmount() {
    this.storeWatch();
  },
};
</script>
