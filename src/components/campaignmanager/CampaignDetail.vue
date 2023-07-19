<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="campaign-detail">
    <div id="detailscreen" class="detailscreen">
      <a v-if="hasHelp" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
      <CampaignType
        v-show="!typeIsSet"
        @settype="setDetailType"
        @cancel="backToList"
      />
      <div v-show="typeIsSet" class="grid-row">
        <div class="detailscreen-wrapper__title">
          <span class="detailscreen__title__icon" v-html="showTypeIcon"></span>
          <span class="detailscreen__title">{{ showTitle }}</span>
        </div>
      </div>
      <div v-show="typeIsSet" class="grid-row">
        <div class="grid-unit--alpha">
          <Tab-bar
            :tabdata="tabData"
            :isactive="activeTab"
            :notvalidtabs="notValidTabList"
            @switchtab="showActive"
          />
        </div>
      </div>
      <!-- TAB CONTENT -->
      <form v-if="typeIsSet" @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}" :data-partial="validationStatus">
        <div class="grid-row tabs-content-wrapper" id="tabContent">
          <div v-show="activeTab == 0" class="js-tabcontent">
            <CampaignTabGeneral
              :showhelp="showHelp"
              :dataitem="dataItem"
              :workprocesses="dataWorkProcesses"
              :routinggroups="dataRoutingGroups"
              :openinghours="dataOpeningHours"
              :isactive="activeTab == 0"
            />
          </div>
          <div v-show="activeTab == 1" class="js-tabcontent">
            <CampaignTabList
              :showhelp="showHelp"
              :dataitem="dataItem"
              :isactive="activeTab == 1"
            />
          </div>
          <div v-show="activeTab == 2" class="js-tabcontent">
            <CampaignAdvanced
            :showhelp="showHelp"
            :dataitem="dataItem"
            :outboundnumbers="dataOutboundNumbers"
            :voicemailprofiles="dataVoicemailProfiles"
            :departments="dataDepartments"
            :isactive="activeTab == 2"
            />
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div v-if="typeIsSet" class="detailscreen-footer detailscreen-footer--inside">
        <span v-if="dataItem.Id != -1">
          <a class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.campaignmanager.deletelabel }}</a>
        </span>
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.campaignmanager.cancellabel }}</a>
          <a class="button-primary js-submitbtn">{{ $store.state.settings.campaignmanager.savelabel }}</a>
        </span>
      </div>

    </div>
  </div>
</template>

<script>

  import TabBar                    from './Tab-bar.vue';
  import CampaignType              from './CampaignType.vue';
  import CampaignTabGeneral        from './CampaignTabGeneral.vue';
  import CampaignTabList           from './CampaignTabList.vue';
  import CampaignAdvanced          from './CampaignTabAdvanced.vue';
  import { ValidateDir }           from './../../directives/validate';

  export default {
    name: 'CampaignDetail',
    props: {
      visible : {
        type     : Boolean,
        default  : false
      },
      datadetail : {
        type     : Object,
        default  : null,
      }
    },
    data: () => {
      return {
        activeTab                   : 0,
        showHelp                    : false,
        tabData                     : [],
        notValidTabList             : [],
        nextTab                     : 0,
        tabSwitched                 : false,
        dataItem                    : null,
        dataWorkProcesses           : null,
        dataRoutingGroups           : null,
        dataOpeningHours            : null,
        dataOutboundNumbers         : null,
        dataVoicemailProfiles       : null,
        dataDepartments             : null,
      }
    },
    components: {
      CampaignType,
      TabBar,
      CampaignTabGeneral,
      CampaignTabList,
      CampaignAdvanced
    },
    directives: {
      validate : ValidateDir,
    },
    computed: {
      typeIsSet() {
        return this.dataItem && this.dataItem.CommunicationType !== -1;
      },
      showTitle() {
        return (this.dataItem && this.dataItem.Name.length > 0) ? this.dataItem.Name : this.$store.state.settings.campaignmanager.formtitleempty;
      },
      showTypeIcon() {
        return this.typeIsSet ? this.dataItem.CommunicationType == 1 ? '&#xF3F2;' : '&#xF9A7;' : '';
      },
      validationStatus() {
        return this.tabSwitched ? 'partial' : 'form';
      },
      hasHelp() {
        return (this.activeTab == 0 || this.activeTab == 2) && this.typeIsSet;
      },
    },
    methods: {
      displayHelp() {
        this.showHelp = !this.showHelp;
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
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
          this.tabSwitched = false;
        }, 1000);

        let _tabs         = document.getElementById('tabContent').querySelectorAll('.js-tabcontent'),
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
      //=========================================================== START DEFAULT VALUES
      setDefaultValues() {
        this.dataItem.AgentAvailability    = 30;
        this.dataItem.SuccessRate          = 25;
        this.dataItem.MaxSimultaneousCalls = 10;
        this.dataItem.AutoActivate         = true;
        this.dataItem.RecordCall           = true; //only for Type = 1 else false
      },
      //=========================================================== START COMPONENT METHODS
      setDetailType(type) {
        this.dataItem.CommunicationType = type;
        //TODO
      },
      saveDetail() {
        if(this.tabSwitched) {
          this.tabSwitched = false;
          this.activeTab   = this.nextTab;
        } else {
          if(this.dataItem.CommunicationType == 5) this.dataItem.RecordCall = false;
          if(this.dataItem.ListItemRemovalDelay == 0) this.dataItem.ListItemRemovalDelay = -1;
          this.$emit('savedetail', this.dataItem);
        }
      },
      deleteDetail() {
        // if(this.tabSwitched) {
        //   this.tabSwitched = false;
        //   this.activeTab   = this.nextTab;
        // } else {
        //   if(this.dataItem.CommunicationType == 5) this.dataItem.RecordCall = false;
        //   if(this.dataItem.ListItemRemovalDelay == 0) this.dataItem.ListItemRemovalDelay = -1;
          this.$emit('deletedetail', this.dataItem.Id);
        // }
      },
      backToList() {
        this.hideValidation();
        this.notValidTabList = [];
        this.$emit('closedetail');
        this.activeTab = 0;
      },
      hideValidation() {
        let _valmes = document.querySelectorAll('.detailscreen-wrapper--visable [data-name="validMessage"]');
        for (const validmessage of _valmes) {
          validmessage.style.display = 'none';
        };
      },
      reduceOutboundNumbers(list) {
        return list.reduce((acc, item) => {
          if(item.Number.length == 0) return acc;
          if(item.Label.length == 0) item.Label = item.Number;
          acc.push(item);
          return acc;
        }, []);
      }
    },
    mounted() {
      this.tabData               = this.$store.state.settings.campaignmanager.tablbl;
      this.dataItem              = JSON.parse(JSON.stringify(this.datadetail.Item));
      this.dataWorkProcesses     = JSON.parse(JSON.stringify(this.datadetail.WorkProcesses));
      this.dataRoutingGroups     = JSON.parse(JSON.stringify(this.datadetail.RoutingGroups));
      this.dataOpeningHours      = JSON.parse(JSON.stringify(this.datadetail.OpeningHoursProfiles));
      this.dataOutboundNumbers   = JSON.parse(JSON.stringify(this.reduceOutboundNumbers(this.datadetail.OutboundNumbers)));
      this.dataVoicemailProfiles = JSON.parse(JSON.stringify(this.datadetail.VoicemailProfiles));
      this.dataDepartments       = JSON.parse(JSON.stringify(this.datadetail.Departments));
      if(this.dataItem.Id === -1)
        this.setDefaultValues();
    }
  }

</script>
