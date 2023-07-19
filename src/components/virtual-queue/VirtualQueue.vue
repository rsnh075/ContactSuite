<template>
  <div data-e2e="virtual-queue">
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.virtualqueue.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalConfigs + " " + $store.state.settings.virtualqueue.configcountlabel }} 
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button v-if="createNewConfig" @click="addConfig()">{{ $store.state.settings.virtualqueue.addconfiglabel }}</button>
            </div>
          </div>  
        </div>  
      </div>
      <ListViewer
        :headerprops="headerprops"
        :listdata="configList"
        @rowclick="openConfig"
      />
      <ConfigView
        :visibility="detailVisibility"
        :data="configData"
        :customerid="selectedCustomerId"
        @cancel="closeConfig"
        @save="saveConfig"
        @delete="deleteConfig"
        ref="configDetail"
      />
    </div>  
  </div>
</template>

<script>
  import ListViewer     from './../uielements/ListViewer.vue';
  import ConfigView     from './ConfigView.vue';
  import { IPCCCConfigurator } from '../../ipccc/js/configurator';

  export default {
    name: 'VirtualQueue',
    data() {
      return {
        selectedCustomerId   : -1,
        storeWatch           : null,
        unFilteredList       : [],
        configList           : [],
        createNewConfig      : true,
        totalConfigs         : 0,
        searchStr            : '',
        headerprops          : [],
        configList           : [],
        detailVisibility     : false,
        configData           : {},
        objectOrder          : {
          Name          : null,
          Id            : null,
          Description   : null,
        }
      }
    },
    inject: ['showLoader'],
    components: {
      ListViewer,
      ConfigView
    },
    watch: {
      '$route' (to, from) {
        this.showLoader(false);
      }
    },
    methods: {
      filterList() {
        this.configList    = this.filterListOnString(this.unFilteredList, this.searchStr.toLowerCase());
        this.totalConfigs  = this.configList.length;
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list];
          return _rawList.filter(item => {
              if(item['Name'].toLowerCase().indexOf(str) != -1 || 
                 String(item['Id']).toLowerCase().indexOf(str) != -1 ||
                 item['Description'].toLowerCase().indexOf(str) != -1) {
                  return item;
              };
          });
        } else {
          return [...list];
        }
      },
      getData(cId) {
        this.showLoader(true);
          IPCCCConfigurator.Request(cId, 'CallMeNowConfig', 'list', null, null).then(result => {
          this.unFilteredList = [...result].reduce((list, item) => (
            list = [...list, JSON.parse(JSON.stringify(Object.assign(this.objectOrder, item)))]
          ), []);
          this.filterList();
          this.$refs.configDetail.getPrompts();  
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      addConfig(id) {
        this.configData       = {
          Name                 : "",
          Id                   : -1,
          Description          : "",
          AgentUrl             : "https://subdomein.uwbedrijfsnaam.nl/cloudapp?TelefoonNr=%Number%&Product=%Context%&Webpagina=%Source%",
          CallThresholdSeconds : 30,
          CallTimeoutSecs      : 19,
          CustomerId           : this.selectedCustomerId,
          MaxCallAttempts      : 2,
          SMSPreCallMinutes    : 0,
          SMSTextForError      : "We hebben je helaas niet kunnen bereiken. We hopen je binnekort te spreken. Bel je ons?!\nMvg, Bedrijfsnaam",
          SMSTextForPreCall    : "Je staat in de wachtrij en bent bijna aan de beurt. Je wordt nu elk moment door ons gebeld!\nMvg, Bedrijfsnaam",
          SMSTextForQueue      : "Je staat in de wachtrij en wordt over ongeveer %tijd% door ons gebeld!\nMvg, Bedrijfsnaam",
          SendAgentUrl         : false,
          SendErrorSMS         : false,
          SendPreCallSMS       : false,
          SendQueueSMS         : false,
          WhisperPromptId      : -1,
        };
        this.detailVisibility = true;
      },
      openConfig(id) {
        let _index = this.configList.findIndex(config => parseInt(config.Id) === parseInt(id));
        if(_index !== -1) {
          this.configData       = {...this.configList[_index]};
          this.detailVisibility = true;
        }
      },
      closeConfig() {
        this.configData       = null;
        this.detailVisibility = false;
      },
      saveConfig(config) {
        this.showLoader(true);
          IPCCCConfigurator.Request(this.selectedCustomerId, 'CallMeNowConfig', 'save', config, null).then(result => {
          let _index = this.unFilteredList.findIndex(config => parseInt(config.Id) === parseInt(result.Id));
          if(_index !== -1) {
            this.unFilteredList[_index] = JSON.parse(JSON.stringify(Object.assign(this.objectOrder, result)));
          } else {
            this.unFilteredList.push(Object.assign(this.objectOrder, result));
          }        
          this.filterList();
          this.showLoader(false); 
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });

        this.detailVisibility = false;
      },
      deleteConfig(id) {
        this.showLoader(true);
          IPCCCConfigurator.Request(this.selectedCustomerId, 'CallMeNowConfig', 'delete', {Id : id}, null).then(result => {
          let _index = this.unFilteredList.findIndex(config => parseInt(config.Id) === parseInt(result.Id))
          this.unFilteredList.splice(_index, 1);
          this.filterList();
          this.showLoader(false); 
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });

        this.detailVisibility = false;
      },
    },
    mounted() {
      this.headerprops = [
        {
          label    : this.$store.state.settings.virtualqueue.listheaders[0],
          width    : 30,
          dataprop : 'Name',
          sortprop : 'Name'
        },{
          label    : this.$store.state.settings.virtualqueue.listheaders[1],
          width    : 20,
          dataprop : 'Id',
          sortprop : 'Id'
        },{
          label    : this.$store.state.settings.virtualqueue.listheaders[2],
          width    : 50,
          dataprop : 'Description',
          sortprop : 'Description'
        }
      ],

      this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
      
      if(this.selectedCustomerId !== -1)
        this.getData(this.selectedCustomerId);

      this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.selectedCustomerId = cObj.selectedCustomerId;
        this.getUsers(cObj.selectedCustomerId);
      });

      this.showLoader(false);
    },
    beforeUnmount() {
      this.storeWatch();
    }
  }
</script>
