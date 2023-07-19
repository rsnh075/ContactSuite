<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="dynamiq-detail">
    <div id="detailscreen" class="detailscreen">
      <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
      <div class="grid-row">
        <div :class="[{'grid-unit--gamma--double' : rgTypeIsSet}, 'detailscreen-wrapper__title']">
          <span :class="['detailscreen__title', {'detailscreen__title--centered' : !rgTypeIsSet}]">{{ showTitle }}</span>
        </div>
        <div v-if="rgTypeIsSet && queueDetail.Id !== -1" class="grid-unit--gamma">
          <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">#{{ queueDetail.Id }}</span>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <Tab-bar
            v-show="rgTypeIsSet"
            :tabdata="tabdata"
            :isactive="activeTab"
            :notvalidtabs="notValidTabList"
            :rgtypeisnumbers="rgTypeIsNumbers"
            @switchtab="showActive"
          />
        </div>  
      </div>
      <!-- TAB CONTENT -->
      <form @valid="saveSettings()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}" :data-partial="validationStatus">
        <div class="grid-row tabs-content-wrapper" ref="tabContent">
          <div v-show="!rgTypeIsSet && rightToAdd && rgTypeIsUnknown" class="grid-row">
            <div class="menubuttonicon-wrapper">
              <Menu-button-icon
                :iconclass="'agent'"
                :icontitle="$store.state.settings.dynamiq.agenttypeheader"
                :iconparagraph="$store.state.settings.dynamiq.agenttypetxt"
                @clickediconbutton="clickedIconButton"
              />
              <Menu-button-icon
                :iconclass="'device'"
                :icontitle="$store.state.settings.dynamiq.devicetypeheader"
                :iconparagraph="$store.state.settings.dynamiq.devicetypetxt"
                @clickediconbutton="clickedIconButton"
              />
            </div>
          </div>
          <div v-show="activeTab == 0 && rgTypeIsSet" class="js-tabcontent">
            <Dynamiq-general
              :showhelp="showHelp"
              :queuedetail="queueDetail"
              :isreadonly="isReadonly('WachtrijAdmin')"
              :isactive="activeTab == 0"
              :routinggroupnames="routinggroupnames"
              :savedrgname="savedRGName"
              :notetemplatelist="noteTemplateList"
            />
          </div>
          <div v-show="activeTab == 1 && rgTypeIsSet" class="js-tabcontent">
            <Dynamiq-messages
              :custId="custId"
              :showhelp="showHelp"
              :queuedetail="queueDetail"
              :isreadonly="isReadonly('WachtrijAdmin','WachtrijSupervisor')"
              :isactive="activeTab == 1"
              :adslist="adsList"
            />
          </div>
          <div v-show="activeTab == 2 && rgTypeIsSet && !rgTypeIsNumbers" class="js-tabcontent">
            <Dynami-queue
              :showhelp="showHelp"
              :queuedetail="queueDetail"
              :isreadonly="isReadonly('WachtrijAdmin','WachtrijSupervisor')"
              :isactive="activeTab == 2"
              :rgrouplist="routingGroupList"
              :rightToCRUDSupportGroup="rightToCRUDSupportGroup"
            />
          </div>
          <div v-show="activeTab == 3 && rgTypeIsSet" class="js-tabcontent">
            <Dynamiq-threshold
              :showhelp="showHelp"
              :queuedetail="queueDetail"
              :isreadonly="isReadonly('WachtrijAdmin','WachtrijSupervisor')"
              :isactive="activeTab == 3"
            />
          </div>
          <div v-show="activeTab == 4 && rgTypeIsSet" class="js-tabcontent">
            <Dynamiq-advanced
              :showhelp="showHelp"
              :queuedetail="queueDetail"
              :isreadonly="isReadonly('WachtrijAdmin')"
              :isactive="activeTab == 4"
              :rgtypeisnumbers="rgTypeIsNumbers"
            />
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span v-if="queueId != -1 && rightToCreateCallGroups">
          <a class="button-primary button-primary--delete" @click="deleteSettings()">{{ $store.state.settings.dynamiq.deletelabel }}</a>
        </span>
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.dynamiq.backtolist }}</a>
          <a v-show="rgTypeIsSet" class="button-primary js-submitbtn">{{ $store.state.settings.dynamiq.savelbl }}</a>
        </span>
      </div>
    
    </div>
  </div>
</template>

<script>
  import MenuButtonIcon            from './../uielements/MenuButtonIcon.vue';
  import TabBar                    from './Tab-bar.vue';
  import DynamiqGeneral            from './Dynamiq-general.vue';
  import DynamiQueue               from './Dynami-queue.vue';
  import DynamiqThreshold          from './Dynamiq-threshold.vue';
  import DynamiqMessages           from './Dynamiq-messages.vue';
  import DynamiqAdvanced           from './Dynamiq-advanced.vue';
  import { ValidateDir }           from './../../directives/validate';
  import { IPCCCConfigurator } from '../../ipccc/js/configurator';

  const ROUTINGGROUPTYPE = {
    'None' : -1,
    'Users' : 1,
    'Numbers' : 2
  }

  export default {
    name: 'DynamiqDetail',
    props: ['visible', 'queueId', 'custId', 'rightToAdd', 'routingGroupTypeToAdd', 'rightToCreateCallGroups', 'rightToCRUDSupportGroup', 'routinggroupnames'],
    data: () => {
      return {
        tabdata                     : [],
        activeTab                   : 0,
        showHelp                    : false,
        queueDetail                 : {
          AdvertisementInterval    : -1,
          AdvertisementPromptOrder : -1,
          AdvertisementPrompts     : [{
            Id    : -1,
            Name  : ''
          }],
          Advertisements            : false,
          AvgWaitingCount           : -1,
          AvgWaitingTime            : -1,
          BlacklistBlockDays        : 0,
          BlacklistKey              : '',
          BlacklistPromptId         : -1,
          BusyWaitCount             : -1,
          BusyWaitTime              : -1,
          CallTimeout               : -1,
          DTMFForward               : true,
          ShowConversationNote      : false,
          Description               : '',
          Distribution              : 4,
          EmailAddress              : '',
          EmergencyLine             : false,
          Groupring                 : false,
          HandlingTime              : -1,
          Id                        : -1,
          InUse                     : false,
          LastAgentRouting          : false,
          LastAgentRoutingPeriod    : -1,
          LastAgentRoutingPriority  : false,
          LastAgentRoutingTimeout   : 30,
          Name                      : '',
          NormalCallTime            : -1,
          SLASeconds                : -1,
          OpenLine                  : false,
          OverFlowThreshold         : -1,
          OverFlowTimeout           : -1,
          Priority                  : 50,
          QueueLength               : -1,
          QueueTimeout              : 0,
          RoutinggroupType          : -1,
          SLASeconds                : 0,
          SupportGroups: [{
            OverflowGroupId    : -1,
            OverflowGroupTitle : '',
            OverflowOffered    : false,
            OverflowThreshold  : 0,
            OverflowTimeout    : 0,
            RoutinggroupId     : -1
          }],
          TurnIndicator             : false,
          TurnIndicatorInterval     : -1,
          TurnIndicatorType         : 0,
          UserCount                 : 0
        },
        noteTemplateList            : [],
        routingGroupList            : [],
        adsList                     : [],
        tabSwitched                 : false,
        nextTab                     : 0,
        tabList                     : null,
        notValidTabList             : [],
        savedRGName                 : '',
      }
    },
    inject: ["showLoader"],
    components: {
      TabBar,
      MenuButtonIcon,
      DynamiqGeneral,
      DynamiQueue,
      DynamiqThreshold,
      DynamiqMessages,
      DynamiqAdvanced
    },
    directives: {
      validate : ValidateDir,
    },
    watch: {
      visible() {
        if(this.visible && this.queueId == -1) {
          this.getRoutingDetail(this.queueId, 'readnew');
        } else if(this.visible && this.queueId != -1) {
          this.getRoutingDetail(this.queueId, 'readone');
        }
      },
    },
    computed: {
      showTitle() {
        return this.queueDetail.Name.length > 0 ? this.queueDetail.Name : this.rgTypeIsSet ? this.$store.state.settings.dynamiq.formtitleempty : this.$store.state.settings.dynamiq.typeheader;
      },
      validationStatus() {
        return this.tabSwitched ? 'partial' : 'form';
      },
      rgTypeIsSet() {
        return this.queueDetail.RoutinggroupType != ROUTINGGROUPTYPE.None;
      },
      rgTypeIsNumbers() {
        return this.queueDetail.RoutinggroupType == ROUTINGGROUPTYPE.Numbers;
      },
      rgTypeIsUsers() {
        return this.queueDetail.RoutinggroupType == ROUTINGGROUPTYPE.Users;
      },
      rgTypeIsUnknown() {
        return this.routingGroupTypeToAdd == -1;
      }
    },
    methods: {
      isReadonly(nameOne, nameTwo = '') {
        let _readOnly = true;
        //check readonly only for AgentRoutinggroups
        if(this.rgTypeIsUsers) {
          _readOnly = this.$store.getters.getPermission(nameOne) || this.$store.getters.getPermission(nameTwo) ? false : true;
        } else {
          //readOnly for Devises is set to false
          _readOnly = false;
        }
        return _readOnly;
      },
      getRoutingDetail(rgId, dataOp) {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.custId, 'DynamicQ', dataOp, null, rgId).then(result => {
          if(dataOp == 'readone') {
            this.queueDetail = result;
            this.savedRGName = this.queueDetail.Name;
          } else {
            this.setDefaults(result[0]);
            this.savedRGName = '';
          }
          this.getNoteTemplateList();
          this.getRoutingGroupList();
          this.getAdvertisementList();
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
        });
      },
      getNoteTemplateList() {
          IPCCCConfigurator.Request(this.custId, 'ConversationNoteTemplate', 'list', null, -1).then(result => {
          this.noteTemplateList = result;
        }).catch(error => {
          console.error('Error: ' + error);
        });
      },
      getRoutingGroupList() {
        let _rawRGroupList   = [];
          IPCCCConfigurator.Request(this.custId, 'routinggroup', 'list', null, -1).then(result => {
          _rawRGroupList     = result;
          this.routingGroupList = _rawRGroupList.filter(el => el.Id != this.queueDetail.Id);
        }).catch(error => {
          console.error('Error: ' + error);
        });
      },
      getAdvertisementList() {
          IPCCCConfigurator.Request(this.custId, 'prompts', 'readall', null, -1).then(result => {
          this.adsList = result.filter(p => p.PromptType == 3);
        }).catch(error => {
          console.error('Error: ' + error);
        });
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      backToList() {
        this.hideValidation();
        this.notValidTabList = [];
        this.$emit('closeQueue');
        this.activeTab   = 0;
        this.savedRGName = '';
      },
      showActive(evt) {
        if(this.activeTab != evt.index) {
          this.nextTab     = evt.index;
          this.tabSwitched = true;
          this.notValidTabList.splice(this.nextTab, 1);
          //FIRE WHEN DOM HAS UPDATED THE DATA-ATTR
          this.$nextTick(function () {
            document.querySelector('.js-submitbtn').dispatchEvent(new MouseEvent('click'));
          })
        }
      },
      saveSettings() {
        if(this.tabSwitched) {
          this.tabSwitched = false;
          this.activeTab   = this.nextTab;
        } else {
          this.removeUnusedAdds();
          this.setOrderOfAdds();
          this.reorderSupportgroups();
          this.$emit('saveQueue', this.queueDetail);
          this.activeTab   = 0;
          this.savedRGName = '';
        }
      },
      deleteSettings() {
        this.queueDetail.InUse = false;
        this.removeUnusedAdds();
        this.setOrderOfAdds();
        this.reorderSupportgroups();
        this.$emit('saveQueue', this.queueDetail);
        this.activeTab   = 0;
        this.savedRGName = '';
      },
      removeUnusedAdds() {
        let _unUsedAddsIdx = [];
        this.queueDetail.AdvertisementPrompts.forEach((add, index) => {
          if((add.Name == "" || add.Name.length == 0) && add.Id == -1)
            _unUsedAddsIdx.push(index);
        });
        if (_unUsedAddsIdx.length > 0) {
          _unUsedAddsIdx.forEach(addIdx => { this.queueDetail.AdvertisementPrompts.splice(addIdx, 1); });
        }
      },
      setOrderOfAdds() {
        let _promptAddsOrder = [];
        this.queueDetail.AdvertisementPrompts.forEach(add => {
          _promptAddsOrder.push(add.Id);
        })
        this.queueDetail.AdvertisementPromptOrder = _promptAddsOrder.toString();
      },
      reorderSupportgroups() {
        this.queueDetail.SupportGroups.sort((a, b) => {
          if( a.OverflowTimeout < b.OverflowTimeout ) {
            return -1;
          }
          if( a.OverflowTimeout > b.OverflowTimeout ) {
            return 1;
          }
          return 0;
        });
      },
      clickedIconButton(val) {
        switch(val) {
          case 'agent':
            this.queueDetail.RoutinggroupType = ROUTINGGROUPTYPE.Users;
            this.queueDetail.QueueTimeout     = 0;
            break;
          case 'device':
            this.queueDetail.RoutinggroupType = ROUTINGGROUPTYPE.Numbers;
            this.queueDetail.QueueTimeout     = 3600;
            break;
        }
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
          this.tabSwitched = false;
        }, 1000);

        let _tabs         = this.tabList.querySelectorAll('.js-tabcontent'),
            _notValidTabs = [];
        
        [].forEach.call(_tabs, (tab, index) => {
          let _errorFields = tab.querySelectorAll('[data-name="validMessage"]');
        
          [].forEach.call(_errorFields, errorfield => {
            if(errorfield.style.display !== 'none' && index != this.activeTab)
              _notValidTabs.push(index);
          });
        });
        
        this.notValidTabList = [..._notValidTabs];
      },
      hideValidation() {
        let _valmes = document.querySelectorAll('.detailscreen-wrapper--visable [data-name="validMessage"]');        
        for (const validmessage of _valmes) {
          validmessage.style.display = 'none';
        };
      },
      setDefaults(qdetail) {
        qdetail.InUse                   = true;
        qdetail.Distribution            = 4;
        qdetail.QueueLength             = 0;
        qdetail.OverFlowThreshold       = 0;
        qdetail.SupportGroups           = [];
        qdetail.NormalCallTime          = 0;
        qdetail.SLASeconds              = 0;
        qdetail.AvgWaitingTime          = 0;
        qdetail.AvgWaitingCount         = 0;
        qdetail.BusyWaitTime            = 0;
        qdetail.BusyWaitCount           = 0;
        qdetail.TurnIndicatorInterval   = 30;
        qdetail.AdvertisementInterval   = 20;
        qdetail.AdvertisementPrompts    = [];
        qdetail.CallTimeout             = 20;
        qdetail.HandlingTime            = 10;
        qdetail.LastAgentRoutingPeriod  = 1;
        qdetail.LastAgentRoutingTimeout = 30;
        qdetail.DTMFForward             = true;
        qdetail.ShowConversationNote    = false;
        qdetail.RoutinggroupType        = this.routingGroupTypeToAdd;
        this.queueDetail                = qdetail;
      }
    },
    mounted() {
      this.tabdata       = this.$store.state.settings.dynamiq.tablbl;
      this.tabList       = this.$refs['tabContent'];
    }
  }

</script>

<style scoped>
.menubuttonicon-wrapper {
  text-align: center;
}
</style>
