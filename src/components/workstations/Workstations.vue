<template>
  <div data-e2e="work-stations">
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.workstations.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{ totalWorkstations + " " + $store.state.settings.workstations.workstationcountlabel }} 
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button v-if="createNewStation" @click="addWorkstation()">{{ $store.state.settings.workstations.addworkstationlabel }}</button>
            </div>
          </div>  
        </div>  
      </div>
      <ListViewer
        :headerprops="headerprops"
        :listdata="orderedList"
        :highlightid="mutatedRow"
        @rowclick="openWorkstation"
        ref="thelist"
      />
      <WorkstatonView
        :visibility="detailVisibility"
        :data="detailData"
        :customerid="selectedCustomerId"
        @cancel="closeWorkstation"
        @save="saveWorkstation"
        @delete="deleteWorkstation"
      />
    </div>  
  </div>
</template>

<script>

  import ListViewer     from './../uielements/ListViewer.vue';
  import WorkstatonView from './WorkstatonView.vue';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import BoxProps, { ModalType } from '../../types/BoxProps';

  export default {
    name: 'Workstations',
    data() {
      return {
        selectedCustomerId   : -1,
        selectedNumberId     : -1,
        storeWatch           : null,
        workstationsList     : [],
        orderedList          : [],
        createNewStation     : true,
        totalWorkstations    : 0,
        searchStr            : '',
        headerprops          : [],
        detailVisibility         : false,
        detailData           : null,
        mutatedRow           : -1,
      }
    },
    inject: ['showLoader', 'showModalDialog'],
    watch: {
      '$route' (to, from) {
        this.showLoader(false);
      }
    },
    components: {
      ListViewer,
      WorkstatonView
    },
    methods: {
      filterList() {
        this.orderedList       = this.filterListOnString(this.workstationsList, this.searchStr.toLowerCase());
        this.totalWorkstations = this.orderedList.length;    
        this.$refs.thelist.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
              if(item['Name'].toLowerCase().indexOf(str) != -1 || 
                item['number'].toLowerCase().indexOf(str) != -1 ||
                item['user'].toLowerCase().indexOf(str) != -1 ||
                item['description'].toLowerCase().indexOf(str) != -1) {
                return item;
              };
          });
        } else {
          return [...list];
        }
      },
      getWorkstations(cId) {
        IPCCCConfigurator.Request(cId, 'werkplek', 'list', null, null).then(result => {
          this.workstationsList = result.reduce((workstations, workstation) => (
            workstations = [ ...workstations, { 
                              Id           : workstation.Id,
                              isAvailable  : workstation.GebruikerId !== -1 ? '&#xF33E' : '&nbsp;',
                              Name         : workstation.Omschrijving,
                              number       : workstation.Phone ? workstation.Phone.InternalNumber : '',
                              user         : workstation.GebruikersNaam,
                              description  : workstation.Phone ? workstation.Phone.Description : '', 
                            }]
          ), []);
          this.filterList();   
          this.showLoader(false)
        }).catch(error => {
          this.showLoader(false)
          console.error(error);
        });
      },
      openWorkstation(id) {
        let _index            = this.workstationsList.findIndex(workstation => parseInt(workstation.Id) === parseInt(id));
        this.detailData       = this.workstationsList[_index];
        this.detailVisibility = true;
      },
      closeWorkstation() {
        this.detailVisibility = false;
        this.detailData       = null;
      },
      addWorkstation() {
        this.detailData       = {
          Id          : -1,
          Name        : '',
          description : '',
          isAvailable : '&nbsp;',
          number      : '',
          user        : '-'
        };
        this.detailVisibility = true;
      },
      updateList(workstation) {
        return new Promise((resolve, reject) => {
          let _index = this.workstationsList.findIndex(ws => ws.Id === workstation.Id);
          if(_index !== -1) {
            this.workstationsList[_index] = {
              Id           : workstation.Id,
              isAvailable  : workstation.GebruikerId !== -1 ? '&#xF33E' : '&nbsp;',
              Name         : workstation.Omschrijving,
              number       : workstation.Phone ? workstation.Phone.InternalNumber : '',
              user         : workstation.GebruikersNaam,
              description  : workstation.Phone ? workstation.Phone.Description : '', 
            }
          } else {
            this.workstationsList.push({
              Id           : workstation.Id,
              isAvailable  : workstation.GebruikerId !== -1 ? '&#xF33E' : '&nbsp;',
              Name         : workstation.Omschrijving,
              number       : workstation.Phone ? workstation.Phone.InternalNumber : '',
              user         : workstation.GebruikersNaam,
              description  : workstation.Phone ? workstation.Phone.Description : '', 
            });
          }
          this.mutatedRow = workstation.Id;
          resolve();
        });
      },
      saveWorkstation(workstation) {
        this.showLoader(true);
        let _workstation = {
          Id           : workstation.Id,
          Omschrijving : workstation.Name,
          Phone : {
            InternalNumber    : workstation.number,
          }
        };

        IPCCCConfigurator.Request(this.selectedCustomerId, 'werkplek', 'save', _workstation, null).then(result => {
          this.updateList(result).then(_ => {
            this.filterList();     
            this.showLoader(false);
          }, error => {
            this.filterList();     
            this.showLoader(false);
          });
        }).catch(error => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.workstations.mutationmutationerrorheadererrorheader, this.$store.state.settings.workstations.mutationerrorbody));
          console.error(error);
        });

        this.detailVisibility = false;
      },
      deleteWorkstation(id) {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.selectedCustomerId, 'werkplek', 'delete', {Id : id}, null).then(result => {
          let _index = this.workstationsList.findIndex(ws => ws.Id === id);
          if(_index !== -1) {
            this.workstationsList.splice(_index, 1);
          } else {
            console.error('Item to delete not found');
          }
          this.filterList();     
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.workstations.mutationerrorheader, this.$store.state.settings.workstations.mutationerrorbody));
          console.error(error);
        });
        this.detailVisibility = false;
      }
    },
    mounted() {
      this.headerprops = [
        {
          label    : this.$store.state.settings.workstations.listheaders[0],
          width    : 5,
          dataprop : 'isAvailable',
          sortprop : 'isAvailable'
        },{
          label    : this.$store.state.settings.workstations.listheaders[1],
          width    : 25,
          dataprop : 'Name',
          sortprop : 'Name'
        },{
          label    : this.$store.state.settings.workstations.listheaders[2],
          width    : 15,
          dataprop : 'number',
          sortprop : 'number'
        },{
          label    : this.$store.state.settings.workstations.listheaders[3],
          width    : 20,
          dataprop : 'user',
          sortprop : 'user'
        },{
          label    : this.$store.state.settings.workstations.listheaders[4],
          width    : 35,
          dataprop : 'description',
          sortprop : 'description'
        }
      ];
      
      this.selectedCustomerId = parseInt(this.$store.getters.getCustomerInfo().selectedCustomerId);
      
      if(this.selectedCustomerId !== -1)
        this.getWorkstations(this.selectedCustomerId);

      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.selectedCustomerId = parseInt(cObj.selectedCustomerId);
        this.getWorkstations(this.selectedCustomerId);
        this.closeWorkstation();
      });

      this.showLoader(false);
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>
