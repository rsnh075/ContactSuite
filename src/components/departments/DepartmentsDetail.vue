<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visibility}]" data-e2e="departments-detail">
    <div v-if="dataDetail != null" id="detailscreen" class="detailscreen">
      <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ detailHeader }}</span>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <TabBar
            :tabdata="tabdata"
            @switchtab="showActive"
          />
        </div>  
      </div>
      <!-- TAB CONTENT -->
      <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}" :data-partial="validationStatus">
        <div class="grid-row tabs-content-wrapper" ref="tabContentDepartments">
          <div v-show="tabdata[0].isactive" class="js-tabcontent">
            <DepartmentsGeneral
              :visibility="visibility"
              :showhelp="showHelp"
              :datadetail="dataDetail"
              :costcenters="costcenters"
              :identitylist="identitylist"
              :notetemplatelist="notetemplatelist"
              :isactive="tabdata[0].isactive"
            />
          </div>
          <div v-show="tabdata[1].isactive" class="js-tabcontent">
            <DepartmentsCloudApp
              :visibility="visibility"
              :showhelp="showHelp"
              :datadetail="dataDetail"
              :parameterlist="cloudAppParameterList"
              :isactive="tabdata[1].isactive"
            />
          </div>
        </div>
      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <div class="grid-unit--alpha">
          <span v-if="dataDetail.CanDelete">
            <a class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.departments.deletelbl }}</a>
          </span>
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.departments.cancellbl }}</a>
            <a class="button-primary js-submitbtn">{{ $store.state.settings.departments.savelbl }}</a>
          </span>
        </div>  
      </div>
    
    </div>
  </div>
</template>

<script>

  import TabBar                    from './../uielements/TabBar.vue';
  import DepartmentsGeneral        from './DepartmentsGeneral.vue';
  import DepartmentsCloudApp       from './DepartmentsCloudApp.vue';
  import { ValidateDir }           from './../../directives/validate';

  export default {
    name: 'DepartmentsDetail',
    props: {
      visibility : {
        type : Boolean,
        default : false
      },
      datadetail : {
        type : Object,
        default : null
      },
      customerid : {
        type : Number,
        default : -1
      },
      costcenters : {
        type : Array,
        default : -1
      },
      identitylist : {
        type : Array,
        default : -1
      },
      notetemplatelist : {
        type : Array,
        default : -1
      }
    },
    data: () => {
      return {
        showHelp              : false,
        dataDetail            : null,
        detailHeader          : '',
        tabSwitched           : false,
        tabList               : null,
        activeTab             : 0,
        nextTab               : 0,
        tabdata               : [{
          tablabel  : '',
          isvisable : true,
          isactive  : true,
          isvalid   : true
        },{
          tablabel  : '',
          isvisable : true,
          isactive  : false,
          isvalid   : true
        }],
        cloudAppParameterList  : [],
      }
    },
    inject: ["showLoader"],
    components: {
      TabBar,
      DepartmentsGeneral,
      DepartmentsCloudApp
    },
    directives: {
      validate : ValidateDir,
    },
    watch: {
      '$route' (to, from) {
        this.showLoader(false)
      },
      visibility: function(newStatus, oldStatus) {
        if(oldStatus !== newStatus && newStatus) {
          this.resetBeforNewData();
          this.dataDetail            = {...this.datadetail};
          this.detailHeader          = this.dataDetail.Id !== -1 ? this.$store.state.settings.departments.headeredit : this.$store.state.settings.departments.headernew;
          if(this.dataDetail.CloudAppUrl !== '' && this.visibility) {
            this.deComposeParameters();
          }
          if(this.dataDetail.CloudAppUrl.length == 0 && this.visibility) {
            this.prefillUrl();
          }
        }
      },
    },
    computed: {
      validationStatus() {
        return this.tabSwitched ? 'partial' : 'form';
      },
    },
    methods: {
      saveDetail() {
        if(this.tabSwitched) {
          this.tabSwitched                      = false;
          this.tabdata[this.activeTab].isactive = false;
          this.tabdata[this.nextTab].isactive   = true;
          this.activeTab                        = this.nextTab;
        } else {
          this.showHelp = false;
          this.$emit('save', this.dataDetail);
        }
      },
      deleteDetail() {
        this.showHelp = false;
        this.$emit('delete', this.dataDetail);
      },
      closeDetail() {
        this.showHelp = false;
        this.$emit('cancel');
      },
      showActive(clickedTabIndex) {
        if(this.activeTab != clickedTabIndex) {
          this.nextTab     = clickedTabIndex;
          this.tabSwitched = true;
          //FIRE WHEN DOM HAS UPDATED THE DATA-ATTR
          this.$nextTick(function () {
            document.querySelector('.js-submitbtn').dispatchEvent(new MouseEvent('click'));
          })
        }
      },
      //==========================================VIEW HELPER FUNCTIONS
      resetBeforNewData() {
        this.tabdata.forEach((tab, index) => {
          if(index == 0) tab.isactive = true
          else tab.isactive = false
          tab.isvalid    = true
          this.activeTab = 0;
          this.nextTab   = 0;
        })
        this.cloudAppParameterList = [{
          valuename : 'Number',
          paraname  : ''
        }, {
          valuename : 'CallId',
          paraname  : ''
        }, {
          valuename : 'Agent',
          paraname  : ''
        }, {
          valuename : 'Department',
          paraname  : ''
        }];
        this.$nextTick(() => this.tabList = this.$refs.tabContentDepartments);
      },
      setUrl(evt) {
        if(Object.prototype.toString.call(evt) === '[object Object]') {
          this.agentUrlDomain          = evt.value;
          this.configData.SendAgentUrl = evt.active;
          this.composeUrl(-1);
        } else {
          this.composeUrl(evt.target.getAttribute('data-index'));
        }
      },
      deComposeParameters() {
        if(this.dataDetail.CloudAppParameters.length > 0) {
          let _queryArray = this.dataDetail.CloudAppParameters.replace(/%/gm, '').split(/&|=/);
          _queryArray.forEach((element, index) => {
            if(index%2 === 0) {
              let _index = this.cloudAppParameterList.findIndex(item => item.valuename === _queryArray[index+1]);
              if(_index !== -1)
                this.cloudAppParameterList[_index].paraname = element
            }
          });      
        }
      },
      prefillUrl() {
        this.dataDetail.CloudAppUrl = this.$store.state.settings.departments.cloudappurlprefill;
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
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
        this.tabdata.forEach((tab, index) => tab.isvalid = _notValidTabs.indexOf(index) == -1);
      },
      hideValidation() {
        let _valmes = document.querySelectorAll('.detailscreen-wrapper--visable [data-name="validMessage"]');        
        for (const validmessage of _valmes) {
          validmessage.style.display = 'none';
        };
      },
    },
    created() {
      this.tabdata[0].tablabel = this.$store.state.settings.departments.tabbarlbl[0];
      this.tabdata[1].tablabel = this.$store.state.settings.departments.tabbarlbl[1];
    }
  }

</script>
