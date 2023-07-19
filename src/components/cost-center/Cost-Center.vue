<template>
  <div data-e2e="cost-center">
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings[modulename].searchtxt" @keyup="filterList()" />
          </div>
          <div class="typo-tabletitle">
            {{ totalItems + " " + $store.state.settings[modulename].countlabel }}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="addItem()">{{ $store.state.settings[modulename].addlabel }}</button>
            </div>
          </div>
        </div>
      </div>
      <ListViewer :headerprops="headerprops" :listdata="displayList" :highlightid="mutatedRow" @rowclick="openItemDetail" ref="thelist" />
      <CostCenterView :visibility="detailVisibility" :data="detailData" @cancel="closeItemDetail" @save="saveItem" @delete="deleteItem" />
    </div>
  </div>
</template>

<script>

import ListViewer from "./../uielements/ListViewer.vue";
import CostCenterView from "./CostCenterView.vue";
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import BoxProps, { ModalType } from '../../types/BoxProps';

export default {
  name: "Cost-Center",
  data() {
    return {
      selectedCustomerId: -1,
      rawList: [],
      displayList: [],
      storeWatch: null,
      searchStr: "",
      modulename: "costcenter",
      totalItems: 0,
      mutatedRow: -1,
      headerprops: [],
      detailData: null,
      detailVisibility: false,
    };
  },
  inject: ["showLoader", 'showModalDialog'],
  watch: {
    $route(to, from) {
      this.showLoader(false);
    },
  },
  components: {
    ListViewer,
    CostCenterView,
  },
  methods: {
    filterList() {
      this.displayList = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
      this.totalItems = this.displayList.length;
      this.$refs.thelist.sortColumn();
    },
    filterListOnString(list, str) {
      if (str != "") {
        let _rawList = [...list];
        return _rawList.filter((item) => {
          if (item["Name"].toLowerCase().indexOf(str) != -1) {
            return item;
          }
        });
      } else {
        return [...list];
      }
    },
    getListData(cId) {
      IPCCCConfigurator.Request(
        cId,
        "costcenter",
        "list",
        null,
        null).then(result => {
          this.rawList = [...result];
          this.filterList();
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        }
      );
    },
    openItemDetail(id) {
      this.detailData = this.displayList.find((item) => parseInt(item.Id) === parseInt(id));
      this.detailVisibility = true;
    },
    closeItemDetail() {
      this.detailVisibility = false;
      this.detailData = null;
    },
    addItem() {
      this.detailData = {
        Id: -1,
        Name: "",
      };
      this.detailVisibility = true;
    },
    updateList(item) {
      return new Promise((resolve, reject) => {
        let _index = this.rawList.findIndex((i) => i.Id === item.Id);
        if (_index !== -1) {
          this.rawList[_index] = {
            Id: item.Id,
            Name: item.Name,
          };
        } else {
          this.rawList.push({
            Id: item.Id,
            Name: item.Name,
          });
        }
        this.mutatedRow = item.Id;
        resolve();
      });
    },
    saveItem(item) {
      this.showLoader(true);
      IPCCCConfigurator.Request(
        this.selectedCustomerId,
        "costcenter",
        "save",
        item,
        null).then(result => {
          this.updateList(result).then(
            (_) => {
              this.filterList();
              this.showLoader(false);
            },
            (error) => {
              this.filterList();
              this.showLoader(false);
            }
          );
        }).catch(error => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings[this.modulename].mutationerrorheader, this.$store.state.settings[this.modulename].mutationerrorbody));
          console.error(error);
        }
      );
      this.detailVisibility = false;
    },
    deleteItem(id) {
      this.showLoader(true);
      IPCCCConfigurator.Request(
        this.selectedCustomerId,
        "costcenter",
        "delete",
        JSON.stringify(item),
        null).then
        (result => {
          let _index = this.rawList.findIndex((i) => i.Id === item.Id);
          if (_index !== -1) {
            this.rawList.splice(_index, 1);
          } else {
            console.error("Item to delete not found");
          }
          this.filterList();
          this.showLoader(false);
        }).catch
        (error => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings[this.modulename].mutationerrorheader, this.$store.state.settings[this.modulename].deleteerrorbody));
          
          console.error(error);
        }
      );
      this.detailVisibility = false;
    },
  },
  mounted() {
    this.headerprops = [
      {
        label: this.$store.state.settings[this.modulename].listheaders[0],
        width: 100,
        dataprop: "Name",
        sortprop: "Name",
      },
    ];

    this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

    if (this.selectedCustomerId !== -1) {
      this.getListData(this.selectedCustomerId);
    }

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, (cObj) => {
      this.selectedCustomerId = cObj.selectedCustomerId;
      this.getListData(this.selectedCustomerId);
    });

    this.showLoader(false);
  },
  beforeUnmount() {
    this.storeWatch();
  },
};
</script>
