<template>
  <div data-e2e="voip-accounts">
    <!-- CONTEXT MENU -->
    <div class="list-content__row-menu" ref="contextMenu" @mouseleave="closeContextMenu($event)" @click="clickedOnList($event)">
      <a class="button__icon">&#xF1D9;</a>
      <ol v-if="selectedDetail">
        <li class="list-content__menu-item active--js"><span v-html="activeIconStatus"></span>{{ activeLabelStatus }}</li>
        <li class="list-content__menu-item list-content__menu-item--alert delete--js"><span>&#xF1C0;</span>{{ this.$store.state.settings.voipaccounts.deleteaccountlabel }}</li>
      </ol>
    </div>

    <!-- LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="this.$store.state.settings.voipaccounts.searchtxt" @keyup="filterList()" />
          </div>
          <div class="typo-tabletitle">
            {{ totalDetails + " " + this.$store.state.settings.voipaccounts.countlabel }}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="addDetail()">{{ this.$store.state.settings.voipaccounts.adddetail }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper" ref="listContentWrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="list"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('Online', $event)" data-sortorder="NONE" v-html="this.$store.state.settings.voipaccounts.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--15" @click="sortColumn('InternalNumber', $event)" data-sortorder="NONE" v-html="this.$store.state.settings.voipaccounts.collheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Description', $event)" data-sortorder="NONE" v-html="this.$store.state.settings.voipaccounts.collheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--40" @click="sortColumn('AutoConfig', $event)" data-sortorder="NONE" v-html="this.$store.state.settings.voipaccounts.collheads[3]"></span>
            </div>
          </div>
          <VirtualListViewer class="list-content" :data="list" rowClasses="list-content__row--virtual list-content__row--clickable">
            <template v-slot="{ row, index }">
              <div :class="['list__row', { 'list__row--zebra': index % 2 == 0 }]" @click="editDetail" :data-id="row.InternalNumber">
                <span class="list-content__row-cell list-content__row-cell--15 detail--js">
                  <span v-html="activeBlockedIcon(row.Activation)"></span>
                  <span v-html="activeIcon(row.Online, row.Active)"></span>
                </span>
                <span class="list-content__row-cell list-content__row-cell--15 detail--js">{{ row.InternalNumber }}</span>
                <span class="list-content__row-cell list-content__row-cell--30 detail--js">{{ row.Description }}</span>
                <span class="list-content__row-cell list-content__row-cell--40 detail--js">{{ checkSNOM(row.AutoConfig) }}</span>
                <div class="list-content__row-cell list-content__row-cell--icons sublist--js">
                  <a class="button__icon" @mouseenter="hoverRow($event, row)">&#xF1D9;</a>
                </div>
              </div>
            </template>
          </VirtualListViewer>
        </div>
      </div>
    </div>

    <!-- VOIP ACCOUNT POPUP -->
    <voip-account
      v-if="visible"
      :detailstatus="detailStatus"
      :data="dataDetail"
      :nrlist="rawNrList"
      :rawphtypeslist="rawPhoneTypesList"
      :macid="newMacId"
      :datasettings="dataSettings"
      :identitylist="identityList"
      :departmentlist="departmentList"
      @setdetailstatus="setDetailStatus"
      @save="saveDetail"
      @delete="deleteDetail"
      @setsettings="setSettings"
      @setdepartmentid="setDepartmentId"
    />
  </div>
</template>

<script>

import VoipAccount         from "./Voip-account.vue";
import VirtualListViewer   from './../uielements/VirtualListViewer.vue';
import { dynamicSort }     from '../../use/sortFunctions';
import { scrollTo }        from './../../use/helperFunctions';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import BoxProps, { ModalType } from '../../types/BoxProps';
import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';

export default {
  name: "Voipaccounts",
  data() {
    return {
      customerId: -1,
      searchStr: "",
      sortSetting: {},
      rawList: [],
      rawNrList: [],
      list: [],
      totalDetails: null,
      detailStatus: "list",
      dataDetail: {},
      selectedInternalNumber: -1,
      selectedTitle: "",
      rawPhoneTypesList: [],
      newMacId: "",
      storeWatch: null,
      selectedDetail: null,
      currentSettings: {},
      dataSettings: {},
      identityList: [],
      departmentList: [],
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
  inject: ["showLoader", 'showModalDialog'],
  components: {
    VoipAccount,
    VirtualListViewer,
    ExportListToXLSX
  },
  computed: {
    visible() {
      return this.detailStatus != 'list';
    },
    activeLabelStatus() {
      return this.selectedDetail?.Active ? this.$store.state.settings.voipaccounts.activeaccountlabel : this.$store.state.settings.voipaccounts.inactiveaccountlabel;
    },
    activeIconStatus() {
      return this.selectedDetail?.Active ? '&#xF3F8;' : '&#xF3FB;';
    },
  },
  methods: {
    hoverRow(evt, obj) {
      evt.stopPropagation();

      this.selectedDetail = obj;
      this.$refs.contextMenu.style.top = "";
      this.$refs.contextMenu.style.left = "";

      setTimeout(() => {
        let _target = evt.target,
          _targetProps = _target.getBoundingClientRect(),
          _menuProps = this.$refs.contextMenu.getBoundingClientRect(),
          _listWrapper = this.$refs.listContentWrapper,
          _listWrapperProps = _listWrapper.getBoundingClientRect();

        if (_targetProps.top - _listWrapperProps.top + _menuProps.height > _listWrapper.scrollTop + _listWrapperProps.height) {
          this.$refs.contextMenu.style.top = _targetProps.top + _targetProps.height - _menuProps.height + "px";
          this.$refs.contextMenu.classList.add("list-content__row-menu--flip");
        } else {
          this.$refs.contextMenu.style.top = _targetProps.top + "px";
          this.$refs.contextMenu.classList.remove("list-content__row-menu--flip");
        }

        this.$refs.contextMenu.style.left = _targetProps.left - _menuProps.width + "px";
      });
    },
    closeContextMenu(evt) {
      evt.stopPropagation();
      this.$refs.contextMenu.style.left = "";
      this.$refs.contextMenu.style.top = "";
      this.$refs.contextMenu.classList.remove("list-content__row-menu--flip");
    },
    getDataList() {
      IPCCCConfigurator.Request(
        this.customerId,
        "voipaccount",
        "list",
        null,
        -1).then(result => {
          this.rawList = result;
          this.rawNrList = this.rawList.map((detail) => detail.InternalNumber);
          this.list = [...this.rawList];
          this.totalDetails = this.list.length;
          this.extendRawNrList();
        }).catch(error => {
          this.showLoader(false);
          console.error("Error: " + error);
        }
      );
    },
    extendRawNrList() {
      IPCCCConfigurator.Request(
        this.customerId,
        "isn",
        "list",
        null,
        -1).then(result => {
          const isnList = result.map((isn) => isn.Number);
          this.rawNrList.push(...isnList);
          this.defaultSortOrder();
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error("Error: " + error);
        }
      );
    },
    saveDataInList(detail, detailIndex) {
      IPCCCConfigurator.Request(
        this.customerId,
        "voipaccount",
        "save",
        detail,
        -1).then(response => {
          this.showLoader(false);
        }).catch(error => {
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.dialog.dialogalertheader, error));
          console.error(error);
          this.showLoader(false);
        }
      );
    },
    dataDetailFn(dataOp) {
      return new Promise((resolve, reject) => {
        this.showLoader(true);
        IPCCCConfigurator.Request(
          this.customerId,
          "voipaccount",
          dataOp,
          this.dataDetail,
          this.selectedInternalNumber)
          .then(result => {
            let _data = result;
            if (Array.isArray(_data)) _data = result[0];
            resolve(_data);
            this.showLoader(false);
          }).catch(error => {
            reject(error);
            this.showLoader(false);
          }
        );
      });
    },
    openDetail(id) {
      this.selectedInternalNumber = id;
      this.dataDetail = null;
      this.dataDetailFn("readone")
        .then((result) => {
          this.newMacId = Math.round(Math.random() * 1000000);
          this.dataDetail = Object.assign({}, result);
          this.dataDetail.MACAddress = this.makeMacView(this.dataDetail.MACAddress);
          this.dataDetail.AuthCode = this.makeAuthCodeView(this.dataDetail.AuthCode);
          this.setDetailStatus("edit");
          this.dataSettingsFn("readone", result.InternalNumber, {}).then((data) => {
            this.dataSettings = Object.assign({}, data);
          });
        })
        .catch((error) => {
          console.error("error:", error);
          //when error return to list
          this.setDetailStatus("list");
        });
    },
    editDetail(evt) {
      let _target = evt.target,
        _trigger = [..._target.classList].find((cls) => cls.indexOf("--js") != -1),
        _id = _target.parentElement.getAttribute("data-id")
          ? _target.parentElement.getAttribute("data-id")
          : _target.parentElement.parentElement.getAttribute("data-id")
          ? _target.parentElement.parentElement.getAttribute("data-id")
          : _target.parentElement.parentElement.parentElement.getAttribute("data-id");

      evt.preventDefault();
      evt.stopPropagation();

      if (_trigger === "detail--js") this.openDetail(_id);
    },
    addDetail(intnumber = "") {
      this.selectedInternalNumber = -1;
      this.dataDetailFn("readnew")
        .then((result) => {
          this.newMacId = Math.round(Math.random() * 1000000);
          this.dataDetail = Object.assign({}, result);
          this.dataDetail.InternalNumber = intnumber;
          this.setDetailStatus("new");
          this.resetSettings();
        })
        .catch((error) => {
          console.error("error:", error);
          this.setDetailStatus("list");
        });
    },
    deleteDetail(data) {
      data.Activation = parseInt(data.Activation);
      data.MACAddress = this.removeMacView(data.MACAddress);
      data.AuthCode = this.removeAuthCodeView(data.AuthCode);
      this.dataDetail = data;
      this.selectedInternalNumber = data.InternalNumber;
      this.dataDetailFn("delete")
        .then((result) => {
          this.dataDetail = null;
          let _indexToDelete = this.rawList.findIndex((detail) => detail.InternalNumber === data.InternalNumber);
          this.rawList.splice(_indexToDelete, 1);
          //refresh the rawNrList to ensure validation on intnr is correct.
          this.rawNrList = this.rawList.map((detail) => detail.InternalNumber);
          this.filterList();
          this.setDetailStatus("list");
        })
        .catch((error) => {
          console.error("error:", error);
          //when error return to list
          this.setDetailStatus("list");
        });
    },
    saveDetail(data, nextAction = "show") {
      data.Activation = parseInt(data.Activation);
      data.Active = data.Activation == 3 ? true : false;
      data.MACAddress = this.removeMacView(data.MACAddress);
      data.AuthCode = this.removeAuthCodeView(data.AuthCode);
      this.dataDetail = data;
      this.selectedInternalNumber = data.InternalNumber;
      this.dataDetailFn("save")
        .then(result => {
          this.dataSettingsFn("save", result.InternalNumber, this.currentSettings)
            .then(data => {
              this.resetSettings();
              this.updateList(result);
              if (nextAction == "next") {
                this.setDetailStatus("list");
                this.$nextTick(() => {
                  if (this.rawNrList.indexOf((parseInt(result.InternalNumber) + 1).toString()) == -1) {
                    this.addDetail(parseInt(result.InternalNumber) + 1);
                  } else {
                    this.addDetail();
                  }
                });
              } else if (nextAction == "list") {
                //
              } else {
                this.setDetailStatus("list");
              }
            })
            .catch((error) => {
              console.error("error:", error);
              this.setDetailStatus("list");
            });
        })
        .catch((error) => {
          console.error("error:", error);
          this.setDetailStatus("list");
        });
    },
    dataSettingsFn(dataOp, internalNr, settings) {
      return new Promise((resolve, reject) => {
        if(!this.showLoader) this.showLoader(true);
        settings.CustomerId = this.customerId;
        settings.VoIPAccountNumber = internalNr;
        IPCCCConfigurator.Request(
          this.customerId,
          "PBXsettings",
          dataOp,
          settings,
          internalNr)
          .then(result => {
            let _data = result;
            if (Array.isArray(_data)) _data = result[0];
            resolve(_data);
            this.showLoader(false);
          }).catch(error => {
            reject(error);
            this.showLoader(false);
          }
        );
      });
    },
    setSettings(settingsobj) {
      this.currentSettings = { ...settingsobj };
    },
    resetSettings() {
      this.currentSettings = this.dataSettings = {};
    },
    setDepartmentId(dId) {
      this.dataDetail.DepartmentId = dId;
    },
    //=========================================================== START DISPLAY DETAIL METHODS
    checkSNOM(val) {
      return val == "SNOM" ? "" : val;
    },
    makeMacView(address) {
      if (address.length > 0) {
        let _macParts = address.match(/.{2}/g);
        return _macParts.join(":");
      } else {
        return address;
      }
    },
    removeMacView(address) {
      if (address.length > 0) {
        let _macParts = address.split(":").join("");
        return _macParts;
      } else {
        return address;
      }
    },
    makeAuthCodeView(code) {
      if (code.length > 0) {
        let _codeParts = code.match(/.{5}/g);
        return _codeParts.join("-");
      } else {
        return code;
      }
    },
    removeAuthCodeView(code) {
      if (code.length > 0) {
        let _codeParts = code.split("-").join("");
        return _codeParts;
      } else {
        return code;
      }
    },
    //=========================================================== START DISPLAY LIST METHODS
    activeIcon(onlineStatus, activeStatus) {
      if (onlineStatus && activeStatus) return `<span class="list-item__icon list-item__icon--connect list-item__icon--left26 detail--js" title="${this.$store.state.settings.voipaccounts.iconregisteredhelptxt[0]}"></span>`;
      else return `<span class="list-item__icon list-item__icon--disconnect list-item__icon--left26 detail--js" title="${this.$store.state.settings.voipaccounts.iconregisteredhelptxt[1]}"></span>`;
    },
    activeBlockedIcon(status) {
      switch (status) {
        case 1:
          return `<span class="list-item__icon list-item__icon--cancel detail--js" title="${this.$store.state.settings.voipaccounts.iconactivatedhelptxt[0]}"></span>`;
          break;
        case 2:
          return `<span class="list-item__icon list-item__icon--block detail--js" title="${this.$store.state.settings.voipaccounts.iconactivatedhelptxt[1]}"></span>`;
          break;
        case 3:
          return "";
          break;
      }
    },
    setDetailStatus(newVal) {
      this.detailStatus = newVal;
    },
    clickedOnList(evt) {
      let _target = evt.target,
        _trigger = [..._target.classList].find((cls) => cls.indexOf("--js") != -1),
        _detailINr = this.selectedDetail.InternalNumber,
        _detailIndex = this.rawList.findIndex((detail) => detail.InternalNumber == _detailINr),
        _detail = this.rawList[_detailIndex];

      if (_trigger === "active--js") {
        _detail.Active = !_detail.Active;
        _detail.Active ? (_detail.Activation = 3) : (_detail.Activation = 1);
        this.showLoader(true);
        this.saveDataInList(_detail, _detailIndex);
      }
      if (_trigger === "delete--js") {
        this.deleteDetail(_detail);
      }
    },
    updateList(data) {
      let _IndexToUpdate = -1;
      this.totalDetails = 0;
      this.rawList.map((detail, index) => {
        if (detail.InternalNumber == data.InternalNumber) {
          _IndexToUpdate = index;
        }
      });
      if (_IndexToUpdate != -1) {
        this.rawList[_IndexToUpdate] = data;
      } else {
        this.rawList.unshift(data);
        this.rawNrList = this.rawList.map((detail) => detail.InternalNumber);
      }

      this.list = [...this.rawList];
      this.filterList();

      setTimeout(() => {
        this.setHighlightedRow(data.InternalNumber);
      }, 500);
      this.showLoader(false);
    },
    filterList() {
      this.list = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
      this.totalDetails = this.list.length;
      this.sortColumn();
    },
    filterListOnString(list, str) {
      if (str != "") {
        let _rawList = [...list],
          _keys;
        return _rawList.filter((item) => {
          _keys = item["InternalNumber"].toLowerCase().indexOf(str) != -1 ||
          item["Description"].toLowerCase().indexOf(str) != -1 ||
          item["UserId"].toString().indexOf(str) != -1 ||
          item["MACAddress"].toLowerCase().indexOf(str) != -1;
          return _keys;
        });
      } else {
        return [...list];
      }
    },
    defaultSortOrder() {
      this.sortSetting.order = "NONE";
      this.sortSetting.key = "InternalNumber";
      this.sortColumn();
    },
    sortColumn(key, e = null) {
      let _order, _t;
      this.setHighlightedRow(-2);

      if (e != null) {
        _t = e.target;
        _order = _t.getAttribute("data-sortOrder");
        document.querySelectorAll(".list-content__row--header > span").forEach((a) => a.setAttribute("data-sortorder", "NONE"));
        this.sortSetting = {
          key: key,
          order: _order,
        };
      } else {
        _order = this.sortSetting.order;
        key = this.sortSetting.key;
      }

      switch (_order) {
        case "NONE":
          this.list.sort(dynamicSort(key));
          if (e != null) _t.setAttribute("data-sortOrder", "ASC");
          break;
        case "ASC":
          this.list.sort(dynamicSort("-" + key));
          if (e != null) _t.setAttribute("data-sortOrder", "DES");
          break;
        case "DES":
          this.list = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
          this.totalDetails = this.list.length;
          if (e != null) _t.setAttribute("data-sortOrder", "NONE");
          break;
      }
    },
    setHighlightedRow(id) {
      let _wrapper = null;
      document.querySelectorAll("[data-id]").forEach((el) => {
        _wrapper = el.parentElement.parentElement;
        if (el.getAttribute("data-id") == id) {
          el.classList.add("list-content__row--mutated");
          scrollTo(_wrapper, el.offsetTop - el.offsetHeight, 300);
        } else el.classList.remove("list-content__row--mutated");
      });
      if (id == -2 && _wrapper !== null) scrollTo(_wrapper, 0, 200);
    },
    getIdentityList() {
      IPCCCConfigurator.Request(
        this.customerId,
        "outboundnumber",
        "list",
        null,
        -1).then(result => {
          this.identityList = [...result].reduce((acc, item) => {
            if (item.Number.length == 0) return acc;
            if (item.Label.length == 0) item.Label = item.Number;
            acc.push(item);
            return acc;
          }, []);
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error("Error: " + error);
        }
      );
    },
    getDepartmentList() {
        IPCCCConfigurator.Request(
        this.customerId,
        "department",
        "readall",
        null,
        -1)
        .then(result => {
          this.departmentList = [...result];
          this.showLoader(false);
        })
        .catch(error => {
          this.showLoader(false);
          console.error("Error: " + error);
        }
      );
    },
    //=========================================================== START DATA FOR MODAL
    getPhoneTypeList() {
      IPCCCConfigurator.Request(
        this.customerId,
        "phonetype",
        "readall",
        null,
        -1)
        .then(result => {
          let _rawPhoneTypesList = result.sort(dynamicSort("Brand"));
          this.rawPhoneTypesList = [];
          try {
            _rawPhoneTypesList.forEach((phonetype, index) => {
              if (index - 1 == -1 || _rawPhoneTypesList[index - 1].Brand != phonetype.Brand) {
                this.rawPhoneTypesList.push({ Type: phonetype.Brand, Header: phonetype.Brand });
                this.rawPhoneTypesList.push(phonetype);
              } else {
                this.rawPhoneTypesList.push(phonetype);
              }
            });
          } catch (err) {
            console.error(error);
          }
          this.showLoader(false);
        })
        .catch(error => {
          this.showLoader(false);
          console.error("Error: " + error);
        }
      );
    },
  },
  mounted() {
    this.customerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

    if (this.customerId !== -1) {
      this.getDataList();
      this.getPhoneTypeList();
      this.getIdentityList();
      this.getDepartmentList();
    }

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, (cObj) => {
      if (cObj.selectedCustomerId != -1) {
        this.customerId = cObj.selectedCustomerId;
        this.setDetailStatus("list");
        this.getDataList();
        this.getPhoneTypeList();
        this.getIdentityList();
        this.getDepartmentList();
      }
    });
  },
  beforeUnmount() {
    this.storeWatch();
  },
};
</script>