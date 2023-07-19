<template>
  <form data-e2e="user-to-call-group">
    <div class="grid-row">
      <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small form-textfield--search--dashboardtop">
        <input type="text" id="filter" v-model="filterStr" :placeholder="$store.state.settings.agenttocallgroup.filtertxt" @keyup="filterList()">
      </div>
      <div class="typo-tabletitle">
        {{totalSelectedQueues + " " + this.$store.state.settings.agenttocallgroup.countlabel}}
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <div class="list-wrapper--flexcolumn list-wrapper--flexcolumn--height380">
          <ol class="list-content--flexcolumn">
            <li class="list__item--flexcolumn list__item--flexcolumn--threecols" v-for="group in routingGroupsList" :key="group.Id" :data-groupid="group.Id" :style="'background-color:' + group.bgColor">
              <div class="form-checkbox">
                <input type="checkbox" :value="group.Id" :id="group.Id" v-model="checkedGroups" @change="handleChangedRGCheckbox($event, group.Id, group.Titel, group.sortId)" :disabled="screenStatus == 'detail-show'">
                <label :for="group.Id">{{ group.Titel }}</label>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </form>
</template>

<script>

  import { ValidateDir }              from './../../directives/validate';
  import { dynamicSortMultipleProps } from './../../use/sortFunctions';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'UserToCallgroup',
    props: ['screenStatus', 'customerId', 'userId', 'hasAvailability'],
    data: () => {
      return {
        showHelp           : false,
        userRGObj          : {},
        routingGroups      : [],
        routingGroupsList  : [],
        rawUserRGs         : [],
        tempValidRGList    : [],
        tempBlockedRGList  : [],
        checkedGroups      : [],
        validTillDateTime  : null,
        filterStr          : '',
        dataOp             : 'readone',
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
      'screenStatus' : function(newVal, oldVal) {
        if(this.screenStatus == 'detail-edit' && this.hasAvailability) {
          this.dataOp = 'readone';
          this.resetView();
          this.getUserRoutingGroups();
        }
      },
      'hasAvailability' : function(newVal, oldVal) {
        if(this.screenStatus == 'detail-new' && this.hasAvailability) {
          this.dataOp = 'readnew';
          this.resetView();
          this.getUserRoutingGroups();
        }
      }
    },
    computed: {
      totalSelectedQueues() {
        return this.checkedGroups.length;
      }
    },
    methods: {
      resetView() {
        this.checkedGroups    = [];
        this.rawUserRGs       = [];
      },
      getRoutingGroups() {
        IPCCCConfigurator.Request(this.customerId, 'routinggroup', 'list', 'user', -1)
            .then(response => {
          this.routingGroups  = [...response];
          this.filterList();
        }).catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
      getUserRoutingGroups() {
        //if(!preload.isActive())
        //this.showLoader(true);
        IPCCCConfigurator.Request(this.customerId, 'staffing', this.dataOp, {Mode:2}, this.userId)
            .then(response => {
          this.userRGObj          = {};
          this.rawUserRGs         = [];
          this.checkedGroups      = [];
          this.tempValidRGList    = [];
          this.tempBlockedRGList  = [];
          this.routingGroups.forEach(rg => rg.sortId = 2); //reset sortIds
          this.routingGroups.forEach(rg => rg.bgColor = ''); //reset bgColor
          response.Details.forEach(userrg => {
            this.rawUserRGs.push(userrg);
            if(userrg.BlockedTill !== null || (userrg.BlockedTill == null && userrg.ValidTill == null))
              this.checkedGroups.push(userrg.RoutinggroupId);
            if(userrg.ValidTill !== null)
              this.tempValidRGList.push(userrg.RoutinggroupId);
            if(userrg.BlockedTill !== null)
              this.tempBlockedRGList.push(userrg.RoutinggroupId);
          });
          this.userRGObj               = response;
          this.userRGObj.Details       = [];
          this.userRGObj.Mode          = 2;
          this.setUserRGObj('sortnewuserrgobj');
        }).catch(error => {
          //if(!preload.isActive())
          this.showLoader(false);
          console.error(error);
        });
      },
      setUserRGObj(sortMode, _checked, groupid, sortid) {
        this.$emit('setUserRGObj', this.userRGObj);
        if(sortMode == 'sortnewuserrgobj')
          this.sortRoutingGroupsList();
        else
          this.updateSortedRoutingGroupsList(_checked, groupid, sortid);
      },
      handleChangedRGCheckbox(evt, groupId, groupname, sortId) {
        // Decide if the rg has to be saved or not
        let _checked                  = evt.target.checked,
            _pushgroupForSave         = {},
            _indexInTempValidRGList   = this.tempValidRGList.findIndex(id => id == groupId),
            _indexInTempBlockedRGList = this.tempBlockedRGList.findIndex(id => id == groupId),
            _indexInRawUserRG         = this.rawUserRGs.findIndex(rg => rg.RoutinggroupId == groupId),
            _indexInUserRG            = this.userRGObj.Details.findIndex(rg => rg.RoutinggroupId == groupId);

        //set pushgroup props
        if(_indexInRawUserRG >= 0) {
          _pushgroupForSave                    = JSON.parse(JSON.stringify(this.rawUserRGs[_indexInRawUserRG]));
          _pushgroupForSave.BlockedTill        = null;
          _pushgroupForSave.ValidTill          = null;
        } else {
          _pushgroupForSave.RoutinggroupId     = groupId;
          _pushgroupForSave.RoutinggroupName   = groupname;
          _pushgroupForSave.BlockedTill        = null;
          _pushgroupForSave.ValidTill          = null;
        }

        //prio 1 for added permanent
        if(_checked && _indexInRawUserRG == -1)
            _pushgroupForSave.Priority         = 1;

        //start clean slate
        if(_indexInUserRG >= 0) {
          this.userRGObj.Details.splice(_indexInUserRG, 1);
        }

        //adding
        if(_checked && _indexInRawUserRG == -1) {
          _pushgroupForSave.Delete             = false;
          this.userRGObj.Details.push(_pushgroupForSave);
          sortId = 1;
        }
        //updating
        if(_checked && (_indexInTempValidRGList >= 0 || _indexInTempBlockedRGList >= 0)) {
          _pushgroupForSave.Delete             = false;
          this.userRGObj.Details.push(_pushgroupForSave);
          sortId = 1;
        }
        //deleting
        if(!_checked && _indexInRawUserRG >= 0) {
          _pushgroupForSave.Delete             = true;
          this.userRGObj.Details.push(_pushgroupForSave)
          sortId = 1;
        }

        //back to permanent unchecked
        if(!_checked && _indexInRawUserRG == -1)
          sortId = 2;

        this.setUserRGObj('sortchangedrgobj', _checked, groupId, sortId);
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
        this.showLoader(false)
      },
      sortRoutingGroupsList() {
        this.rawUserRGs.forEach(userrg => {
          let _indexInRoutingGroups = this.routingGroups.findIndex(rg => rg.Id == userrg.RoutinggroupId);
          if(((userrg.ValidTill == null && userrg.BlockedTill == null) || userrg.BlockedTill !== null) && _indexInRoutingGroups !== -1)
            this.routingGroups[_indexInRoutingGroups].sortId = 1;
        });
        this.routingGroups.sort(dynamicSortMultipleProps('sortId', 'Titel'));
        this.filterList();
      },
      updateSortedRoutingGroupsList(checked, groupid, sortid) {
        let _indexInRoutingGroups = this.routingGroups.findIndex(rg => rg.Id == groupid);        
        this.routingGroups[_indexInRoutingGroups].sortId = sortid;
        this.routingGroups[_indexInRoutingGroups].bgColor = this.setHighLight(groupid); //update bgColor
        this.routingGroups.sort(dynamicSortMultipleProps('sortId', 'Titel'));
        this.filterList();
      },
      setHighLight(id) {
        let _indexInUserRG = this.userRGObj.Details.findIndex(rg => rg.RoutinggroupId == id);
        return _indexInUserRG !== -1 ? '#F0F8EC' : '';
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
      // this.validTillDateTime = _parts[0].concat('T23:59:59.000Z'); // Use the validTillDateTime to make the changes temporary
    }
  }

</script>
