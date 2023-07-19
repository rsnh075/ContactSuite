<template>
  <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="agent-to-call-group">
    <div id="detailscreen" class="detailscreen detailscreen--fit">
      <!-- <a v-show="false" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
      <div class="grid-row grid-unit">
        <div class="detailscreen-wrapper__title">
          <div class="detailscreen__title-status-icon">
            <span class="detailscreen__title-status-init">{{ getInitials(user) }}</span>
          </div>
          <span class="detailscreen__title" v-html="fullName"></span>
          <div class="typo-tabletitle">
            {{totalSelectedQueues + " " + $store.state.settings.agenttocallgroup.countlabel}}
          </div>

          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small form-textfield--search--dashboardtop grid--push">
            <input type="text" id="filter" v-model="filterStr" :placeholder="$store.state.settings.agenttocallgroup.filtertxt" @keyup="filterList()">
          </div>
        </div>
      </div>
      <div class="grid-row">
        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.agenttocallgroup.callgrouptitlelist }}</h2>
      </div>

      <form @valid="save()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="list-wrapper--flexcolumn list-wrapper--flexcolumn--height380">
              <ol id="rg-status-list" class="list-content--flexcolumn" v-if="showList">
                <li :class="['list__item--flexcolumn list__item--flexcolumn--threecols', {'rg-temp-checked' : isTempChecked(group.Id)}]" v-for="group in routingGroupsList" :key="group.Id" :data-groupid="group.Id" :style="'background-color:' + group.bgColor">
                  <div class="form-checkbox">
                    <input type="checkbox" :value="group.Id" :id="group.Id" v-model="checkedGroups" @change="setTempRg($event, group.Id, group.Titel, group.sortId)">
                    <label :for="group.Id">{{ group.Titel }}</label>
                    <span class="rg-temp-checked__icon">&#xF995;</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </form>

      <div class="grid-row">
        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.agenttocallgroup.changestillheader }}</h2>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <span class="typo--paragraph--large">{{ $store.state.settings.agenttocallgroup.changestill }}</span>
        </div>
      </div>

      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="close()">{{ $store.state.settings.agenttocallgroup.cancellbl }}</a>
          <a :class="['button-primary js-submitbtn', {'button-primary--disabled' : !okToSave}]">{{ $store.state.settings.agenttocallgroup.savelbl }}</a>
        </span>
      </div>
    
    </div>
  </div>
</template>

<script>
  
  import { ValidateDir }                   from './../../directives/validate';
  import { dynamicSortMultipleProps }      from '../../use/sortFunctions';
  import { IPCCCConfigurator }             from './../../ipccc/js/configurator';
  import { IPCCC }                         from '../../ipccc/js/ipccc';

  export default {
    name: 'AgentToCallgroup',
    props: ['visible', 'user'],
    data: () => {
      return {
        showHelp           : false,
        userRGObj          : {},
        routingGroups      : [],
        routingGroupsList  : [],
        rawUserRGs         : [],
        tempValidRGList    : [],
        tempBlockedRGList  : [],
        permanentRGList    : [],
        checkedGroups      : [],
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
          this.getRoutingGroups();
      },
      'visible' : function(newVal, oldVal) {       
        if(newVal) {
          this.resetView();
          this.getUserRoutingGroups();
        }
      },
    },
    computed: {
      validationStatus() {
        return 'form';
      },
      hasUser() {
        return this.user != null && typeof this.user != 'undefined';
      },
      fullName() {
        return this.hasUser ? this.user.fullName : '';
      },
      totalSelectedQueues() {
        return this.checkedGroups.length;
      },
      okToSave() {
        return Object.keys(this.userRGObj).length !== 0 && this.userRGObj.Details ? this.userRGObj.Details.length > 0 : false;
      }
    },
    methods: {
      close() {
        this.resetView();
        this.$emit('close');
        this.showLoader(false);
      },
      resetView() {
        this.userRGObj          = {};
        this.rawUserRGs         = [];
        this.checkedGroups      = [];
        this.permanentRGList    = [];
        this.tempValidRGList    = [];
        this.tempBlockedRGList  = [];
        this.showList           = false;
      },
      getRoutingGroups() {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'routinggroup', 'list', 'user').then(response => {
          this.routingGroups  = [...response];
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      getUserRoutingGroups() {
        this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'staffing', 'readone', {Mode:2}, this.user.userId).then(response => {
          this.routingGroups.forEach(rg => rg.sortId = 3); //reset sortIds
          this.routingGroups.forEach(rg => rg.bgColor = ''); //reset bgColor
          response.Details.forEach(userrg => {
            this.rawUserRGs.push(userrg);
            if(userrg.ValidTill !== null || (userrg.BlockedTill == null && userrg.ValidTill == null))
              this.checkedGroups.push(userrg.RoutinggroupId);
            if(userrg.ValidTill !== null)
              this.tempValidRGList.push(userrg.RoutinggroupId);
            if(userrg.BlockedTill !== null)
              this.tempBlockedRGList.push(userrg.RoutinggroupId);
            if(userrg.BlockedTill == null && userrg.ValidTill == null)
              this.permanentRGList.push(userrg.RoutinggroupId);
          });
          this.userRGObj               = response;
          this.userRGObj.Details       = [];
          this.userRGObj.Mode          = 2;
          this.sortRoutingGroupsList();
          this.showList                = true;
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(true);
          console.error(error);
        });
      },
      save() {
        if(this.okToSave) {
          this.showLoader(true);
          this.userRGObj.Details.forEach(rg => {
            rg.UserName = this.user.fullName;
            rg.UserId   = this.user.userId;
          })
          IPCCCConfigurator.Request(this.customerId, 'staffing', 'save', this.userRGObj, this.user.userId).then(succes => {
              this.close();
            }).catch(
            error => {
              this.showLoader(false);
              console.error('Error: ' + error);
          });
        }
      },
      isTempChecked(groupId) {
        let _istempchecked = false,
        _isChecked         = this.checkedGroups.includes(groupId),
        _isPermanent       = this.permanentRGList.includes(groupId),
        _isTempBlocked     = this.tempBlockedRGList.includes(groupId),
        _isTempValid       = this.tempValidRGList.includes(groupId);
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
      setTempRg(evt, groupId, groupname, sortId) {
        // Decide if the rg has to be saved or not
        let _checked                  = evt.target.checked,
            _pushgroupForSave         = {},
            _indexInTempValidRGList   = this.tempValidRGList.findIndex(id => id == groupId),
            _indexInTempBlockedRGList = this.tempBlockedRGList.findIndex(id => id == groupId),
            _indexInPermanentUserRG   = this.permanentRGList.findIndex(id => id == groupId),
            _indexInRawUserRG         = this.rawUserRGs.findIndex(rg => rg.RoutinggroupId == groupId),
            _indexInUserRG            = this.userRGObj.Details.findIndex(rg => rg.RoutinggroupId == groupId);

        //set pushgroup props
        if(_indexInRawUserRG >= 0) {
          _pushgroupForSave                    = JSON.parse(JSON.stringify(this.rawUserRGs[_indexInRawUserRG]));
        } else {
          _pushgroupForSave.RoutinggroupId     = groupId;
          _pushgroupForSave.RoutinggroupName   = groupname;
        }

        //add prio 2 for added temp
        if(_checked && _indexInRawUserRG == -1)
            _pushgroupForSave.Priority         = 2;

        //start clean slate
        if(_indexInUserRG >= 0) {
          this.userRGObj.Details.splice(_indexInUserRG, 1);
        }

        //adding
        if(_checked && _indexInRawUserRG == -1) {
          _pushgroupForSave.ValidTill      = this.validTillDateTime;
          _pushgroupForSave.BlockedTill    = null;
          this.userRGObj.Details.push(_pushgroupForSave);
          sortId = 1;
        }

        //updating
        if(_checked && _indexInTempBlockedRGList >= 0) {
          _pushgroupForSave.ValidTill      = null;
          _pushgroupForSave.BlockedTill    = null;
          this.userRGObj.Details.push(_pushgroupForSave);
        }
        if (!_checked && _indexInPermanentUserRG >= 0) {
          _pushgroupForSave.ValidTill      = null;
          _pushgroupForSave.BlockedTill    = this.validTillDateTime;
          this.userRGObj.Details.push(_pushgroupForSave);
        }

        //deleting
        if(!_checked && _indexInTempValidRGList >= 0) {
          _pushgroupForSave.Delete         = true;
          this.userRGObj.Details.push(_pushgroupForSave);
        }

        //back to permanent unchecked
        if(!_checked && _indexInRawUserRG == -1)
          sortId = 3;

        this.updateSortedRoutingGroupsList(groupId, sortId);
      },
      //------------------------------------------------------------ HELPER FUNCTIONS
      filterList() {
        if(this.filterStr !== '') {
          this.routingGroupsList = this.routingGroups.filter(group => {
            return group.Titel.toLowerCase().indexOf(this.filterStr.toLowerCase()) !== -1
          })
        } else {
          this.routingGroupsList = [...this.routingGroups];
        }
      },
      sortRoutingGroupsList() {
        this.rawUserRGs.forEach(userrg => {
          let _indexInRoutingGroups = this.routingGroups.findIndex(rg => rg.Id == userrg.RoutinggroupId);
          if((userrg.ValidTill !== null || userrg.BlockedTill !== null) && _indexInRoutingGroups !== -1)
            this.routingGroups[_indexInRoutingGroups].sortId = 1;
          else if(userrg.ValidTill == null && userrg.BlockedTill == null && _indexInRoutingGroups !== -1)
            this.routingGroups[_indexInRoutingGroups].sortId = 2;
        });
        this.routingGroups.sort(dynamicSortMultipleProps('sortId', 'Titel'));
        this.filterList();
      },
      updateSortedRoutingGroupsList(id, sortid) {
        let _indexInRoutingGroups = this.routingGroups.findIndex(rg => rg.Id == id);        
        this.routingGroups[_indexInRoutingGroups].sortId = sortid;
        this.routingGroups[_indexInRoutingGroups].bgColor = this.setHighLight(id); //update bgColor
        this.routingGroups.sort(dynamicSortMultipleProps('sortId', 'Titel'));
        this.filterList();
      },
      setHighLight(id) {
        let _indexInUserRG = this.userRGObj.Details.findIndex(rg => rg.RoutinggroupId == id);
        return _indexInUserRG !== -1 ? '#F0F8EC' : '';
      },
      getInitials(user) {
        if(this.hasUser) {
          let _initials  = '',
              _parts     = user.fullName.split(' '),
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
      this.customerId        = IPCCC.LoginSession.Details.CustomerId;
    }
  }

</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals" as g;
@use "@/scss/includes/font" as font;
@use "@/scss/includes/functions" as fn;

.detailscreen-wrapper {
  z-index: 300;
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
