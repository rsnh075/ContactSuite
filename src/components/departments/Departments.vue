<template>
  <div data-e2e="departments">
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings[modulename].searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{ totalItems + " " + $store.state.settings[modulename].countlabel }} 
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button @click="addDetail()">{{ $store.state.settings[modulename].addlabel }}</button>
            </div>
          </div>  
        </div>  
      </div>
      <ListViewer
        :headerprops="headerprops"
        :listdata="displayList"
        :highlightid="mutatedRow"
        @rowclick="openDetail"
        ref="thelist"
      />
      <DepartmentsDetail
        :visibility="detailVisibility"
        :datadetail="dataDetail"
        :costcenters="costcenterlist"
        :identitylist="identityList"
        :notetemplatelist="noteTemplateList"
        @cancel="closeDetail"
        @save="saveDetail"
        @delete="deleteDetail"
      />
    </div>  
  </div>
</template>

<script>
  import ListViewer          from './../uielements/ListViewer.vue';
  import DepartmentsDetail   from './DepartmentsDetail.vue';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import BoxProps, { ModalType } from '../../types/BoxProps';

  export default {
    name: 'Departments',
    data() {
      return {
        selectedCustomerId : -1,
        rawList            : [],
        displayList        : [],
        storeWatch         : null,
        searchStr          : '',
        modulename         : 'departments',
        totalItems         : 0,
        mutatedRow         : -1,
        headerprops        : [],
        costcenterlist     : [],
        dataDetail         : null,
        detailVisibility   : false,
        identityList       : [],
        noteTemplateList   : [],
      }
    },
    inject: ["showLoader", 'showModalDialog'],
    components: {
      ListViewer,
      DepartmentsDetail
    },
    watch: {
      '$route' (to, from) {
        this.showLoader(false);
      }
    },
    methods: {
      filterList() {
        this.displayList       = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
        this.totalItems        = this.displayList.length;
        this.$refs.thelist.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
              if(item['Title'].toLowerCase().indexOf(str) != -1 || 
                item['costCenterName'].toLowerCase().indexOf(str) != -1 ||
                item['outboundIdentityView'].toLowerCase().indexOf(str) != -1 ||
                item['Description'].toLowerCase().indexOf(str) != -1) {
                return item;
              };
          });
        } else {
          return [...list];
        }
      },
      getOutboundIdentityView(number) {
        if(number == '') return '-';
        let _obj = [...this.identityList].find(el => el.Number == number);
        if(_obj) return  _obj.Label;
        else return '-';
      },
      getCostCenterName(id) {
        let _cs = this.costcenterlist.find(cs => cs.Id == id);
        return _cs ? _cs.Name : '-';
      },
      getListData() {
        IPCCCConfigurator.Request(this.selectedCustomerId , 'department', 'list', null, null).then(result => {
          this.rawList = [...result];
          IPCCCConfigurator.Request(this.selectedCustomerId, 'outboundnumber', 'list', null, -1).then(result => {
            this.identityList = [...result].reduce((acc, item) => {
              if(item.Number.length == 0) return acc;
              if(item.Label.length == 0) item.Label = item.Number;
              acc.push(item);
              return acc;
            }, []);
            IPCCCConfigurator.Request(this.selectedCustomerId , 'costcenter', 'list', null, null).then(result => {
              this.costcenterlist      = [...result];
              this.rawList.forEach(d => {
                d.costCenterName       =  this.getCostCenterName(d.CostCenter);
                d.useOpenLineView      =  this.$store.state.settings[this.modulename].useopenlinecolumnlbl[d.UseOpenLine ? 0 : 1];
                d.outboundIdentityView =  this.getOutboundIdentityView(d.OutboundIdentity);
              });
              IPCCCConfigurator.Request(this.selectedCustomerId, 'ConversationNoteTemplate', 'list', null, -1).then(result => {
                this.noteTemplateList = result;
                this.filterList();   
                this.showLoader(false);
              }).catch(error => {
                console.error(error);
              });
            }).catch(error => {
              console.error(error);
            });
          }).catch(error => {
            console.error(error);
          });
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      openDetail(id) {
        IPCCCConfigurator.Request(this.selectedCustomerId , 'department', 'readone', null, id).then(result => {
          this.dataDetail = result;
          this.detailVisibility = true;
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      closeDetail() {
        this.detailVisibility = false;
        this.dataDetail       = null;
      },
      addDetail() {
        IPCCCConfigurator.Request(this.selectedCustomerId , 'department', 'readnew', null, -1).then(result => {
          this.dataDetail = result[0];
          this.detailVisibility = true;
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      updateList(item) {
        return new Promise((resolve, reject) => {
          let _index = this.rawList.findIndex(i => i.Id === item.Id);
          if(_index !== -1) {
            this.rawList[_index] = {
              Id               : item.Id,
              Title            : item.Title,
              Description      : item.Title, //item.Description,
              OutboundIdentity : item.OutboundIdentity,
              outboundIdentityView : this.getOutboundIdentityView(item.OutboundIdentity),
              UseOpenLine      : item.UseOpenLine,
              useOpenLineView  : this.$store.state.settings[this.modulename].useopenlinecolumnlbl[item.UseOpenLine ? 0 : 1],
              CostCenterId     : item.CostCenterId,
              CanDelete        : item.CanDelete,
              costCenterName   : this.getCostCenterName(item.CostCenterId)
            }
          } else {
            this.rawList.push({
              Id               : item.Id,
              Title            : item.Title,
              Description      : item.Title, //item.Description,
              OutboundIdentity : item.OutboundIdentity,
              outboundIdentityView : this.getOutboundIdentityView(item.OutboundIdentity),
              UseOpenLine      : item.UseOpenLine,
              useOpenLineView  : this.$store.state.settings[this.modulename].useopenlinecolumnlbl[item.UseOpenLine ? 0 : 1],
              CostCenterId     : item.CostCenterIs,
              CanDelete        : item.CanDelete,
              costCenterName   : this.getCostCenterName(item.CostCenterId)
            });
          }
          this.mutatedRow = item.Id;
          resolve();
        });
      },
      saveDetail(item) {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.selectedCustomerId, 'department', 'save', item, null).then(result => {
          this.updateList(result).then(_ => {
            this.filterList();     
            this.showLoader(false);
          }, error => {
            this.filterList();     
            this.showLoader(false);
          });
        }).catch(error => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings[this.modulename].mutationerrorheader, this.$store.state.settings[this.modulename].mutationerrorbody));
          console.error(error);
        });
        this.detailVisibility = false;
      },
      deleteDetail(item) {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.selectedCustomerId, 'department', 'delete', item, null).then(result => {
          let _index = this.rawList.findIndex(i => i.Id === item.Id);
          if(_index !== -1) {
            this.rawList.splice(_index, 1);
          } else {
            console.error('Item to delete not found');
          }
          this.filterList();
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings[this.modulename].mutationerrorheader, this.$store.state.settings[this.modulename].deleteerrorbody));
          console.error(error);
        });
        this.detailVisibility = false;
      },
    },
    mounted() {
      this.headerprops = [
        {
          label    : this.$store.state.settings[this.modulename].listheaders[0],
          width    : 20,
          dataprop : 'Title',
          sortprop : 'Title'
        }, {
          label    : this.$store.state.settings[this.modulename].listheaders[1],
          width    : 40,
          dataprop : 'Description',
          sortprop : 'Description'
        }, {
          label    : this.$store.state.settings[this.modulename].listheaders[2],
          width    : 10,
          dataprop : 'useOpenLineView',
          sortprop : 'useOpenLineView'
        }, {
          label    : this.$store.state.settings[this.modulename].listheaders[3],
          width    : 15,
          dataprop : 'costCenterName',
          sortprop : 'costCenterName'
        }, {
          label    : this.$store.state.settings[this.modulename].listheaders[4],
          width    : 15,
          dataprop : 'outboundIdentityView',
          sortprop : 'outboundIdentityView'
        }
      ];
    
      this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

      if(this.selectedCustomerId !== -1) {
        this.getListData();
      }

      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.selectedCustomerId = cObj.selectedCustomerId;
        this.getListData();
      });

      this.showLoader(false);
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>
