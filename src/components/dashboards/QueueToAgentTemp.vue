<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="queue-to-agent">
    <div id="detailscreen" class="detailscreen detailscreen--fit">
      <!-- <a v-show="false" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
      <div class="grid-row grid-unit">
        <div class="detailscreen-wrapper__title">
          <div class="detailscreen__title-status-icon">
            <span class="detailscreen__title-status-init">{{ getInitials(queue.groupName) }}</span>
          </div>
          <span class="detailscreen__title" v-html="queue.groupName"></span>
          <div class="typo-tabletitle">
            {{totalSelectedAgents + " " + this.$store.state.settings.queuetoagent.countlabel }}
          </div>

          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small form-textfield--search--dashboardtop grid--push">
            <input type="text" id="filter" v-model="filterStr" :placeholder="$store.state.settings.queuetoagent.filtertxt" @keyup="filterList()">
          </div>
        </div>
      </div>
      <div class="grid-row">
        <h2 class="detailscreen__fieldsetheader">{{ this.$store.state.settings.queuetoagent.agenttitlelist }}</h2>
      </div>

      <form @valid="save()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="list-wrapper--flexcolumn list-wrapper--flexcolumn--height380">
              <ol id="agent-status-list" class="list-content--flexcolumn" v-if="showList">
                <li :class="['list__item--flexcolumn list__item--flexcolumn--threecols', {'agent-temp-checked' : isTempChecked(agent.UserId)}]" v-for="agent in agentsList" :key="agent.UserId" :style="'background-color:' + agent.bgColor">
                  <div class="form-checkbox">
                    <input type="checkbox" :value="agent.UserId" :id="agent.UserId" v-model="checkedAgents" @change="setTempAgent($event, agent.UserId, agent.FullName, agent.sortId)">
                    <label :for="agent.UserId">{{ agent.FullName }}</label>
                    <span class="agent-temp-checked__icon">&#xF995;</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </form>

      <div class="grid-row">
        <h2 class="detailscreen__fieldsetheader">{{ this.$store.state.settings.queuetoagent.changestillheader }}</h2>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <span class="typo--paragraph--large">{{ this.$store.state.settings.queuetoagent.changestemptill }}</span>
        </div>
      </div>

      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="close()">{{ this.$store.state.settings.queuetoagent.cancellbl }}</a>
          <a :class="['button-primary js-submitbtn', {'button-primary--disabled' : !okToSave}]">{{ this.$store.state.settings.queuetoagent.savelbl }}</a>
        </span>
      </div>
    
    </div>
  </div>
</template>

<script>

  import { ValidateDir }              from './../../directives/validate';
  import { dynamicSortMultiple }      from '../../use/sortFunctions';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'QueueToAgentTemp',
    props: ['visible', 'queue'],
    data: () => {
      return {
        showHelp           : false,
        rgAgentsObj        : {},
        agents             : [],
        agentsList         : [],
        rawRgAgents        : [],
        tempValidAgentList    : [],
        tempBlockedAgentList  : [],
        permanentAgentList    : [],
        checkedAgents      : [],
        customerId         : -1,
        validTillDateTime  : null,
        filterStr          : '',
        showList           : false,
      }
    },
    inject: ['showLoader'],
    directives: {
      Validate: ValidateDir
    },
    watch: {
      'customerId' : function(newVal, oldVal) {
        if(this.customerId != -1)
          this.getAgents();
      },
      'visible' : function(newVal, oldVal) {       
        if(newVal) {
          this.resetView();
          this.getRoutingGroupAgents();
        }
      },
    },
    computed: {
      validationStatus() {
        return 'form';
      },
      hasQueue() {
        return this.queue && Object.keys(this.queue).length > 0;
      },
      fullName() {
        return this.hasQueue ? this.queue.groupName : '';
      },
      totalSelectedAgents() {
        return this.checkedAgents.length;
      },
      okToSave() {
        return Object.keys(this.rgAgentsObj).length !== 0 && this.rgAgentsObj.Details ? this.rgAgentsObj.Details.length > 0 : false;
      }
    },
    methods: {
      close() {
        this.resetView();
        this.$emit('close');
        this.showLoader(false);
      },
      resetView() {
        this.rgAgentsObj           = {};
        this.rawRgAgents           = [];
        this.checkedAgents         = [];
        this.permanentAgentList    = [];
        this.tempValidAgentList    = [];
        this.tempBlockedAgentList  = [];
        this.showList              = false;
      },
      getAgents() {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'users', 'list', null, -1).then(response => {
          this.agents  = [...response];
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      getRoutingGroupAgents() {
        // if(this.showLoader(false))
          this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'staffing', 'readone', {Mode:1}, this.queue.groupId).then(response => {
          this.agents.forEach(agent => agent.sortId = 3); //reset sortIds
          this.agents.forEach(agent => agent.bgColor = ''); //reset bgColor
          response.Details.forEach(agent => {
            this.rawRgAgents.push(agent);
            if(agent.ValidTill !== null || (agent.BlockedTill == null && agent.ValidTill == null))
              this.checkedAgents.push(agent.UserId);
            if(agent.ValidTill !== null)
              this.tempValidAgentList.push(agent.UserId);
            if(agent.BlockedTill !== null)
              this.tempBlockedAgentList.push(agent.UserId);
            if(agent.BlockedTill == null && agent.ValidTill == null)
              this.permanentAgentList.push(agent.UserId);
          });
          this.rgAgentsObj             = response;
          this.rgAgentsObj.Details     = [];
          this.rgAgentsObj.Mode        = 1;
          this.sortAgentsList();
          this.showList                = true;
          // if(this.showLoader(true))
            this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      save() {
        if(this.okToSave) {
          this.showLoader(true);
          IPCCCConfigurator.Request(this.customerId, 'staffing', 'save', this.rgAgentsObj, this.queue.groupId)
          .then(succes => {
            this.close();
          })
          .catch(error => {
              this.showLoader(false);
              console.error('Error: ' + error);
          });
        }
      },
      isTempChecked(groupId) {
        let _istempchecked = false,
        _isChecked         = this.checkedAgents.includes(groupId),
        _isPermanent       = this.permanentAgentList.includes(groupId),
        _isTempBlocked     = this.tempBlockedAgentList.includes(groupId),
        _isTempValid       = this.tempValidAgentList.includes(groupId);
        if(!_isChecked && _isPermanent)
          _istempchecked = true;
        if(_isChecked && !_isPermanent && !_isTempBlocked)
          _istempchecked = true;
        if(!_isChecked && _isTempBlocked)
          _istempchecked = true;
        if(_isChecked && _isTempValid)
          _istempchecked = true;
        return _istempchecked;
      },
      setTempAgent(evt, userid, fullname, sortId) {
        // Decide if the agent has to be saved or not
        let _checked                       = evt.target.checked,
            _pushAgentForSave              = {},
            _indexInTempValidAgentList     = this.tempValidAgentList.findIndex(id => id == userid),
            _indexInTempBlockedAgentList   = this.tempBlockedAgentList.findIndex(id => id == userid),
            _indexInPermanentAgentList     = this.permanentAgentList.findIndex(id => id == userid),
            _indexInRawRgAgents            = this.rawRgAgents.findIndex(agent => agent.UserId == userid),
            _indexInRgAgents               = this.rgAgentsObj.Details.findIndex(agent => agent.UserId == userid);

        //set pushgroup props
        if(_indexInRawRgAgents >= 0) {
          _pushAgentForSave                = JSON.parse(JSON.stringify(this.rawRgAgents[_indexInRawRgAgents]));
        } else {
          _pushAgentForSave.UserId            = userid;
          _pushAgentForSave.UserName          = fullname;
          _pushAgentForSave.RoutinggroupName  = this.queue.groupName;
          _pushAgentForSave.RoutinggroupId    = this.queue.groupId;
        }

        //add prio 2 for added temp
        if(_checked && _indexInRawRgAgents == -1)
            _pushAgentForSave.Priority     = 2;

        //start clean slate
        if(_indexInRgAgents >= 0) {
          this.rgAgentsObj.Details.splice(_indexInRgAgents, 1);
        }

        //adding
        if(_checked && _indexInRawRgAgents == -1) {
          _pushAgentForSave.ValidTill      = this.validTillDateTime;
          _pushAgentForSave.BlockedTill    = null;
          this.rgAgentsObj.Details.push(_pushAgentForSave);
          sortId = 1;
        }

        //updating
        if(_checked && _indexInTempBlockedAgentList >= 0) {
          _pushAgentForSave.ValidTill      = null;
          _pushAgentForSave.BlockedTill    = null;
          this.rgAgentsObj.Details.push(_pushAgentForSave);
        }
        if (!_checked && _indexInPermanentAgentList >= 0) {
          _pushAgentForSave.ValidTill      = null;
          _pushAgentForSave.BlockedTill    = this.validTillDateTime;
          this.rgAgentsObj.Details.push(_pushAgentForSave);
        }

        //deleting
        if(!_checked && _indexInTempValidAgentList >= 0) {
          _pushAgentForSave.Delete         = true;
          this.rgAgentsObj.Details.push(_pushAgentForSave);
        }

        //back to permanent unchecked
        if(!_checked && _indexInRawRgAgents == -1)
          sortId = 3;

        this.updateSortedAgentsList(userid, sortId);
      },
      //------------------------------------------------------------ HELPER FUNCTIONS
      filterList() {
        if(this.filterStr !== '') {
          this.agentsList = this.agents.filter(agent => {
            return agent.FullName.toLowerCase().indexOf(this.filterStr.toLowerCase()) !== -1
          })
        } else {
          this.agentsList = [...this.agents];
        }
      },
      sortAgentsList() {
        this.rawRgAgents.forEach(rgagent => {
          let _indexInAgents = this.agents.findIndex(agent => agent.UserId == rgagent.UserId);
          if((rgagent.ValidTill !== null || rgagent.BlockedTill !== null) && _indexInAgents !== -1)
            this.agents[_indexInAgents].sortId = 1;
          else if(rgagent.ValidTill == null && rgagent.BlockedTill == null && _indexInAgents !== -1)
            this.agents[_indexInAgents].sortId = 2;
        });
        this.agents.sort(dynamicSortMultiple('sortId', 'FullName'));
        this.filterList();
      },
      updateSortedAgentsList(id, sortid) {
        let _indexInAgents = this.agents.findIndex(agent => agent.UserId == id);        
        this.agents[_indexInAgents].sortId = sortid;
        this.agents[_indexInAgents].bgColor = this.setHighLight(id); //update bgColor
        this.agents.sort(dynamicSortMultiple('sortId', 'FullName'));
        this.filterList();
      },
      setHighLight(id) {
        let _indexInRgAgents = this.rgAgentsObj.Details.findIndex(rg => rg.UserId == id);
        return _indexInRgAgents !== -1 ? '#F0F8EC' : '';
      },
      getInitials(groupname) {
        if(this.hasQueue) {
          let _initials  = '',
              _parts     = groupname.split(' '),
              _l         = _parts.length;
          _initials += _parts[0].charAt(0).toUpperCase() + _parts[_l - 1].charAt(0).toUpperCase();
          return _initials;
        }
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
    },
    mounted() {
      let _today             = new Date(),
          _toiso             = _today.toISOString(),
          _parts             = _toiso.split("T");
      this.validTillDateTime = _parts[0].concat('T23:59:59.000Z');
      this.customerId        = this.$store.getters.getCustomerInfo().customerId;
    }
  }

</script>

<style lang="scss" scoped>
@use "@/scss/includes/globals" as g;
@use "@/scss/includes/font" as font;
@use "@/scss/includes/functions" as fn;

.detailscreen-wrapper {
  z-index: 5000;
}

.rg-temp-checked,
.agent-temp-checked {
  background-color: fn.tint(g.$color-orange, 92%);
  &__icon {
    position: absolute;
    right: 5px;
    top: 0px;
    line-height: 30px;
    @include font.font-icon();
    font-size: 1.2rem;
    color: g.$color-orange;
  }
}

#rg-status-list .rg-temp-checked__icon,
#agent-status-list .agent-temp-checked__icon {
  font-family: 'Material Design Icons';
  font-size: 1.2rem;
  display: none;
}

#rg-status-list .rg-temp-checked .rg-temp-checked__icon,
#agent-status-list .agent-temp-checked .agent-temp-checked__icon {
  display: block;
}
  
</style>