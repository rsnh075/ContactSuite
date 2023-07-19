<template>
  <div data-e2e="routing-group">
  <!-- CONFIRM DIALOG ------------------------------------------------------------------------------------------>
    <div :class="['dialog__modal', {'dialog__modal--open' : showDialogAlert}]">
      <div :class="['dialog__window', 'dialog__window--w500', {'dialog__window--open' : showDialogAlert}]" id="dialog-window">
        <div class="dialog__window-header dialog__window-header--important dialog__window-header--transparent">
          <span>{{ $store.state.settings.routinggroups.alertchangesheader }}</span>
        </div>
        <div class="dialog__window-body">
          <div class="grid-row">
            <p>{{ $store.state.settings.routinggroups.alertchangesbody }}</p>
          </div>
        </div>
        <div class="grid-unit--alpha dialog__window-footer dialog__window-footer--confirm">
          <a class="button-primary button-primary--important dialog__window-save" @click="dialogSave">{{ $store.state.settings.routinggroups.alertchangesbtnsave }}</a>
          <a class="button-primary dialog__window-dontsave" @click="dialogDontSave">{{ $store.state.settings.routinggroups.alertchangesbtndontsave }}</a>
          <!--<a class="button-primary dialog__window-cancel" @click="closeOnCancel">{{ $store.state.settings.routinggroups.alertchangesbtncancel }}</a>-->
        </div>
      </div>
    </div>
<!-- ROUTINGGROUP DETAIL ------------------------------------------------------------------------------------------>
    <div class="detailscreen-wrapper detailscreen-wrapper--visable detailscreen-wrapper--hasnolistview">
      <div id="detailscreen" class="detailscreen">
        <div class="grid-row">
          <h2 class="detailscreen__fieldsetheader detailscreen__fieldsetheader--margin-bottom">{{ this.$store.state.settings.routinggroups.callgrouptitle }}</h2>
        </div>
        <div class="grid-row">
          <!-- CENTER -->
          <div class="grid-unit--beta">
            <div class="typo-input-label">{{ $store.state.settings.routinggroups.callgrouplabel }}</div>
            <SelectSearchFlyOut
              :options="routingGroups"
              :selectedvalue="selectedRGId"
              :defaultlabel="$store.state.settings.routinggroups.defaultselectedRG"
              labelproperty="Titel"
              valueproperty="Id"
              iconproperty="Icon"
              iconsize="1.2em"
              @changed="routingGroupSelected"
            />
          </div>
          <div class="grid-unit--beta">
            <span class="typo--paragraph--large">{{ $store.state.settings.routinggroups.callgrouptxt }}</span>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit--beta">
            <h2 class="detailscreen__fieldsetheader detailscreen__fieldsetheader--nomargin">{{ this.$store.state.settings.routinggroups.availabletitle }}</h2>
          </div>
          <div class="grid-unit--beta">
            <h2 class="detailscreen__fieldsetheader detailscreen__fieldsetheader--nomargin">{{ this.$store.state.settings.routinggroups.staffingtitle }}</h2>
          </div>
        </div>
        <div class="grid-row" v-if="rgType === 'users'">
          <div class="grid-unit--beta">
            <div class="form-selectfield form-selectfield--no-margin">
              <label for="departmentlabel" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.routinggroups.departmentlabel }}</label>
              <select id="departmentlabel" name="departmentlabel" v-model="selectedDepartmentId" @change="splitRawUserList">
                <option value="all" selected>{{ $store.state.settings.routinggroups.defaultselectdepartment }}</option>
                <option v-for="department in departments" :key="department.Id" :value="department.Id">{{ department.Title }}</option>
              </select>
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="tabs-wrapper tabs-wrapper--popup tabs-wrapper--routinggroup">
              <a v-for="(tablbl, index) in tabdata"
                :key="index"
                @click="switchTab(index)"
                :class="['tabs__tab', { 'tabs__tab--active' : activeTab == index }]">
                {{ tablbl }}
              </a>
            </div>
          </div>
        </div>
        <div class="grid-row">
          <!-- LEFT -->
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--search form-textfield--search-on-white">
              <input type="text" v-model="searchUserStr" :placeholder="$store.state.settings.routinggroups.searchtxt" @keyup="splitRawUserList">
            </div>
            <ul class="list-routinggroup-wrapper list-routinggroup-wrapper--max-height">
              <div class="list-routinggroup-line list-routinggroup-line--head">
                <span class="list-routinggroup__col list-routinggroup__col--50" v-html="(rgType == 'users') ? $store.state.settings.routinggroups.headname : $store.state.settings.routinggroups.headnameext"></span>
                <span class="list-routinggroup__col list-routinggroup__col--50" v-html="(rgType == 'users') ? $store.state.settings.routinggroups.headdepartment : $store.state.settings.routinggroups.headname"></span>
              </div>
              <li v-for="member in memberList" class="list-routinggroup-line" :key="member.UserId">
                <a v-if="rgType === 'users'" href="javascript:;" @click="switchStatus('add', member.UserId)">
                  <span class="list-routinggroup__col list-routinggroup__col--50">{{ member.FullName }}</span>
                  <span class="list-routinggroup__col list-routinggroup__col--50">{{ member.Department.Title }}</span>
                </a>
                <a v-else href="javascript:;" @click="switchStatus('add', member.Id)">
                  <span class="list-routinggroup__col list-routinggroup__col--50">{{ member.PhoneNumber }}</span>
                  <span class="list-routinggroup__col list-routinggroup__col--50">{{ member.Title }}</span>
                </a>

              </li>
            </ul>
          </div>
          <!-- RIGHT -->
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--search form-textfield--search-on-white">
              <input type="text" v-model="searchRGStr" :placeholder="$store.state.settings.routinggroups.searchtxt" @keyup="splitRawUserList">
            </div>
            <ul class="list-routinggroup-wrapper list-routinggroup-wrapper--max-height">
              <div :class="['list-message', {'list-message--shifted-top' : rgType === 'users'}]" v-if="selectedRGId == null"><span>{{ $store.state.settings.routinggroups.defaultselectedRG }}</span></div>
              <div :class="['list-message', {'list-message--shifted-top' : rgType === 'users'}]" v-if="rawRGList.length == 0 && selectedRGId != null"><span>{{ $store.state.settings.routinggroups.defaultRGAgent }}</span></div>
              <div class="list-routinggroup-line list-routinggroup-line--head">
                <span  v-if="!superVisorMode" class="list-routinggroup__col list-routinggroup__col--10" v-html="$store.state.settings.routinggroups.headprio"></span>
                <span class="list-routinggroup__col list-routinggroup__col--50" v-html="(rgType == 'users') ? $store.state.settings.routinggroups.headname : $store.state.settings.routinggroups.headnameext"></span>
                <span class="list-routinggroup__col list-routinggroup__col--40" v-html="(rgType == 'users') ? $store.state.settings.routinggroups.headdepartment : $store.state.settings.routinggroups.headname"></span>
              </div>
              <li v-for="(member, index) in routingGroupList" :class="['list-routinggroup-line', 'list-routinggroup-line--delete', {'list-routinggroup-line--prio' : !superVisorMode}]" :style="setHighLight(member.UserId)" :key="member.UserId">
                <div v-if="rgType === 'users'">
                  <div v-if="!superVisorMode" class="form-textfield form-textfield--small__col--10">
                    <input type="number" :id="'priority_' + index" v-model="member.Priority" @keyup="changePriority($event, member.UserId)" @keydown="filterInput" :key="index">
                  </div>
                  <a href="javascript:;" @click="switchStatus('remove', member.UserId)">
                    <span class="list-routinggroup__col list-routinggroup__col--50">{{ member.FullName }}</span>
                    <span class="list-routinggroup__col list-routinggroup__col--40">{{ member.DepartmentName }}</span>
                  </a>
                </div>
                <div v-else>
                  <div class="form-textfield form-textfield--small__col--10">
                    <input type="number" :id="'priority_' + index" v-model="member.Priority" @keyup="changePriority($event, member.Id)" @keydown="filterInput" :key="index">
                  </div>
                  <a href="javascript:;" @click="switchStatus('remove', member.Id)">
                    <span class="list-routinggroup__col list-routinggroup__col--50">{{ member.PhoneNumber }}</span>
                    <span class="list-routinggroup__col list-routinggroup__col--40">{{ member.Title }}</span>
                  </a>
                </div>

              </li>
            </ul>
          </div>
        </div>
        <div class="detailscreen-footer detailscreen-footer--inside">
          <a :class="['button-primary', 'grid--push', {'button-primary--dimmed-gray' : !rgIsEditted}]" @click="saveRGList">{{ $store.state.settings.routinggroups.saverglabel }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SelectSearchFlyOut      from './../uielements/SelectSearchFlyOut.vue';
import { dynamicSort }         from '../../use/sortFunctions';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';


export default {
	name: 'routinggroup',
	data: () => {
		return {
			selectedCustomerId   : -1,
			departments          : [],
			rawMemberList        : [],
			memberList           : [],
			searchUserStr        : '',
			selectedDepartmentId : 'all',
			routingGroups        : [],
			rawRGList            : [],
			routingGroupList     : [],
			routingGroupUserIds  : [],
			searchRGStr          : '',
			selectedRGId         : null,
			lastSelectedRGId     : null,
			rawRGId              : '-1',
			rgIsEditted          : false,
			showDialogAlert      : false,
			storeWatch           : null,
			routinggroupType     : {
				1 : 'users',
				2 : 'extensions'
			},
			rgType               : '',
			tabdata              : [],
			activeTab            : 0,
			superVisorMode       : false,
			isAdded              : [],
			isDeleted            : [],
			rawStaffingUsers     : [],
		}
	},
	inject: ['showLoader'],
	components: {
		SelectSearchFlyOut
	},
  	methods: {
		setHighLight(id) {
			return this.isAdded && this.isAdded.indexOf(id) !== -1 ? 'background-color: #F0F8EC' : '';
		},
		hasAgentsRights() {
			return this.$store.getters.getPermission('BeheerGroepen');
		},
		hasDevicesRights() {
			return this.$store.getters.getPermission('BestemmingenToestellen');
		},
		filterInput(evt) {
			if(evt.which == 8 || evt.which == 46 || (evt.which >= 48 && evt.which <= 57) || (evt.which >= 96 && evt.which <= 105)) {
				//do nothing
			} else {
				evt.preventDefault();
			}
		},
		dialogSave() {
			this.routingGroupList = [];
			this.memberList       = [];
			this.saveRGList();
		},
		dialogDontSave() {
			this.routingGroupList = [];
			this.memberList       = [];
			this.getRoutingGroup();
		},
		setRoutingGroupType(rgId) {
			this.rgType        = this.routinggroupType[this.routingGroups.find(rg => rg.Id === parseInt(rgId)).RoutinggroupType];
			return {
				dataOperation : this.rgType,
				dataType      : this.rgType === 'users' ? 'list' : 'readall'
			}
		},
		routingGroupSelected(newVal) {
			if(!this.rgIsEditted)
				this.resetTabs();
			this.lastSelectedRGId = this.selectedRGId;
			if(newVal != 'null' && newVal != null && newVal != this.selectedRGId) {
				this.selectedRGId  = newVal;

				if(this.rgIsEditted) {
				this.showDialogAlert = true;
				} else {
				this.showLoader(true);
				let _data = this.setRoutingGroupType(newVal);

				this.memberList    = [];
				this.getMembers(this.selectedCustomerId, _data.dataOperation, _data.dataType).then(response => {
					this.getRoutingGroup();
				}, error => {
					console.error(error);
					this.showLoader(false);
				});
				}
			} else if(newVal != this.selectedRGId) {
				this.selectedRGId     = null;
				this.routingGroupList = [];
				this.memberList       = [];
			}
		},
		splitRawUserList() {
		//SPLIT THE USERS DEPENDING ON THE SELECTED ROUTINGGROUP
			let _memberList = [],
				_RGList     = [],
				_memberId   = this.rgType === 'users' ? 'UserId' : 'Id';

			this.rawMemberList.forEach(_item => {
				if(this.routingGroupUserIds.indexOf(_item[_memberId]) == '-1') {
				_memberList.push(_item);
				} else {
				_item = this.getMissingProps(_item);
				_RGList.push(_item);
				}
			});

			this.memberList       = [..._memberList];
			this.routingGroupList = [..._RGList];
			this.rawRGList        = [..._RGList];

			this.filterUserList(() => {
				this.searchUserList(() => {
				this.searchRGList();
				});
			});
		},
		filterUserList(ready){
			//FILTER THE USERS BY DEPARTMENT
			if(this.selectedDepartmentId != 'all') {
				this.memberList = this.memberList.filter(_user => _user.Department.Id == this.selectedDepartmentId);
			}
			if(typeof ready === 'function')
				return ready();
			},
		searchUserList(ready) {
			//FILTER ON SEARCHUSERSTR
			if(this.searchUserStr != '') {
				this.memberList = this.filterListOnString(this.memberList, this.searchUserStr.toLowerCase());
			}
			this.memberList.sort(dynamicSort('FullName'));
			if(typeof ready === 'function')
				return ready();
			},
		searchRGList() {
		//FILTER ON SEARCHRGSTR
			if(this.searchRGStr != '') {
				this.routingGroupList = this.filterListOnString(this.routingGroupList, this.searchRGStr.toLowerCase());
			}
			this.routingGroupList.sort(dynamicSort('Priority'));
		},
		checkIfDialog() {
			if(this.rgIsEditted) {
				this.showDialogAlert = true;
			} else {
				this.getRoutingGroup();
			}
		},
		closeOnCancel() {
			this.showDialogAlert = false;
			this.selectedRGId    = this.lastSelectedRGId;
		},
		getRoutingGroup(saveType = 'users') {
			this.showDialogAlert      = false;
			this.rgIsEditted          = false;
			this.rawRGList            = [];
			this.routingGroupList     = [];
			this.routingGroupUserIds  = [];
			this.isAdded              = [];
			this.isDeleted            = [];
			this.rawStaffingUsers     = [];

			let _rgType               = this.rgType;
			this.rgType               = this.routinggroupType[this.routingGroups.find(rg => rg.Id === parseInt(this.selectedRGId)).RoutinggroupType];
			let _id                   = this.rgType === 'users' ? 'UserId' : 'Id',
				_dataItem             = this.rgType === 'users' ? this.superVisorMode ? 'routinggroupsupervisor' : 'staffing' : 'routinggroupextension',
				_dataOperation        = _dataItem === 'staffing' ? 'readone' : 'readall',
				_dataValue            = _dataItem == 'staffing' ? {Mode:1} : null,
				_refreshMembers       = _rgType !== this.rgType;


			if(this.selectedRGId == 'none') {
				this.rawRGId = '-1'
				this.splitRawUserList();
			} else {
				IPCCCConfigurator.Request(this.selectedCustomerId, _dataItem, _dataOperation, _dataValue, this.selectedRGId).then(response => {
				if(_dataItem === 'staffing') {
					this.rawStaffingUsers    = JSON.parse(JSON.stringify(response.Details));
					this.rawRGList           = [...response.Details.filter(user => user.ValidTill === null)];
				} else {
					this.rawRGList           = [...response];
				}

				if(this.rgType === 'users')
					this.rawRGList.sort(dynamicSort('FullName'));
				else
					this.rawRGList.sort(dynamicSort('Number'));

				this.routingGroupUserIds = this.rawRGList.map(member => member[_id]);
				this.rawRGId             = this.selectedRGId;

				if(_refreshMembers || (saveType == 'extensions')) {
					let _data        = this.setRoutingGroupType(this.selectedRGId);
					this.memberList  = [];
					this.getMembers(this.selectedCustomerId, _data.dataOperation, _data.dataType).then(response => {
					this.splitRawUserList();
					this.showLoader(false);
					}, error => {
					console.error(error);
					this.showLoader(false);
					});
				} else {
					this.splitRawUserList();
					this.showLoader(false);
				}

				}).catch(error => {
				console.error(error);
				});
			}
		},
		filterListOnString(list, str) {
			if(str != '') {
				let _srcProps = (this.rgType === 'users') ? ['FullName', 'DepartmentName'] : ['PhoneNumber', 'Title'],
					_rawList  = [...list];
				return _rawList.filter(item => {
					if((item[_srcProps[0]].toLowerCase().indexOf(str.toLowerCase()) != -1) ||
						(item[_srcProps[1]].toLowerCase().indexOf(str.toLowerCase()) != -1)) {
					return item;
					};
				});
			} else {
				return [...list];
			}
		},
		changePriority(event, id) {
			this.rgIsEditted = true;
			let _val         = event.target.value,
				_memberId    = this.rgType === 'users' ? 'UserId' : 'Id';

			this.rawMemberList.forEach(item => { if(item[_memberId] == id) item.Priority = _val > 0 ? _val : '' });
		},
		getMissingProps(item) {
			let _memberId    = this.rgType === 'users' ? 'UserId' : 'Id',
				_itemRG      = this.rawRGList.find(obj => obj[_memberId] == item[_memberId]);

			if(typeof _itemRG !== 'undefined') {
				item.Priority               = _itemRG.Priority;
				item.ContactPersonAddressId = _itemRG.ContactPersonAddressId;
				item.TelephoneNumber        = _itemRG.TelephoneNumber;
			} else {
				item.Priority               = '1';
				item.ContactPersonAddressId = '0';
				item.TelephoneNumber        = '';
			}
			return item;
		},
		switchStatus(type, id) {
			if(this.selectedRGId == 'none')
				return;

			this.rgIsEditted = true;

			if(type == 'add') {
				this.routingGroupUserIds.push(id);
				this.isAdded.push(id);
			} else {
				this.isAdded.splice(this.routingGroupUserIds.indexOf(id), 1);
				this.routingGroupUserIds.splice(this.routingGroupUserIds.indexOf(id), 1);
			}
			this.splitRawUserList();
		},
		saveRGList() {
			if(this.rgIsEditted) {
				this.showLoader(true);
				let _dataItem        = this.rgType === 'users' ? this.superVisorMode ? 'routinggroupsupervisor' : 'staffing' : 'routinggroupextension',
					_rawRGList       = _dataItem === 'staffing' ? {} : [];
				this.showDialogAlert = false;
				this.rgIsEditted     = false;

				if(_dataItem === 'staffing') {
					let _usersForSave = [];
					let _rawRGId          = parseInt(this.rawRGId),
						_routinggroupName = this.routingGroups.filter(rg => rg.Id == _rawRGId)[0].Titel;
					_usersForSave         = [...this.rawRGList];
					this.rawStaffingUsers.forEach(_user => {
						let _indexInDetails = _usersForSave.findIndex(__user => __user.UserId == _user.UserId),
							_prioIsChanged  = _indexInDetails >= 0 ? _user.Priority !== _usersForSave[_indexInDetails].Priority : false;
						//blockedtill date or permanent users in staffing, delete from Details
						if(_indexInDetails >= 0 && (_user.BlockedTill !== null || (_user.BlockedTill == null && _user.ValidTill == null))) {
						_user.Priority = _usersForSave[_indexInDetails].Priority;
						_usersForSave.splice(_indexInDetails, 1);
						if(_prioIsChanged)
							_usersForSave.push(_user);
						}
						//deleted staffing users, push from staffing into Details
						if(_indexInDetails == -1 && (_user.BlockedTill !== null || (_user.BlockedTill == null && _user.ValidTill == null))) {
						_user.Delete = true;
						_usersForSave.push(_user);
						}
					});
					//stel saveobj samen
					_rawRGList.Mode       = 1;
					_rawRGList.Details    = _usersForSave.map(___user => {
						___user.RoutinggroupName  = _routinggroupName;
						___user.RoutinggroupId    = this.rawRGId;
						___user.Delete = !___user.Delete ? false : ___user.Delete;
						___user.UserName = !___user.FullName ? ___user.UserName : ___user.FullName;
						//alleen de properties mee sturen die nodig zijn
						let { RoutinggroupName, RoutinggroupId, UserId, UserName, BlockedTill, ValidTill, Delete, Priority } = ___user;
						return { RoutinggroupName, RoutinggroupId, UserId, UserName, BlockedTill, ValidTill, Delete, Priority };
					});
					if(_rawRGList.Details && _rawRGList.Details.length == 0) {
						this.getRoutingGroup(this.rgType);
						return;
					}
				} else {
					_rawRGList = [...this.rawRGList];
				}
				IPCCCConfigurator.Request(this.$store.getters.getCustomerInfo().selectedCustomerId, _dataItem, 'save', _rawRGList, this.rawRGId)
				.then(result => {
					this.getRoutingGroup(this.rgType);
				}).catch(error => {
					this.showLoader(false);
					console.error(error);
				});
			}
		},
		resetDisplay() {
			this.showDialogAlert      = false;
			this.rgIsEditted          = false;
			this.rawRGList            = [];
			this.routingGroupList     = [];
			this.routingGroupUserIds  = [];
			this.rawStaffingUsers     = [];
			this.rawMemberList        = [];
			this.memberList           = [];
			this.selectedRGId         = 'none';
			this.searchUserStr        = '';
			this.searchRGStr          = '';
			this.rawRGId              = '-1';
			this.departments          = [];
			this.selectedDepartmentId = 'all';
			this.routingGroups        = [];
			this.lastSelectedRGId     = null;
			this.rgType               = '';
			this.activeTab            = 0;
			this.superVisorMode       = false;
			this.isAdded              = [];
			this.isDeleted            = [];
			this.init(this.selectedCustomerId);
		},
		getDepartments(cusId) {
			return new Promise((resolve, reject) => {
				IPCCCConfigurator.Request(cusId, 'department', 'readall', null, -1)
				.then(response => {
					resolve(response);
				}).catch(error => {
					reject(error);
				});
			});
		},
		getRoutingGroupList(cusId) {
			return new Promise((resolve, reject) => {
				IPCCCConfigurator.Request(cusId, 'routinggroup', 'list', null, -1)
				.then(response => {
					let _response;
					if(this.hasAgentsRights() && !this.hasDevicesRights()) {
						_response = response.filter(rg => rg.RoutinggroupType == 1);
					}
					if(this.hasDevicesRights() && !this.hasAgentsRights()) {
						_response = response.filter(rg => rg.RoutinggroupType == 2);
					}
					if(this.hasDevicesRights() && this.hasAgentsRights()) {
						_response = response;
					}
					if(!this.hasDevicesRights() && !this.hasAgentsRights()) {
						_response = [];
					}
					resolve(_response);
				}).catch(error => {
					reject(error);
				});
			});
		},
		getMembers(cusId, dataoperation, datatype) {
			return new Promise((resolve, reject) => {
				IPCCCConfigurator.Request(cusId, dataoperation, datatype, null, -1)
				.then(response => {
					this.rawMemberList        = [...response];
					if(dataoperation === 'users') {
						this.rawMemberList.forEach(member => member.DepartmentName = member.Department.Title);
						this.rawMemberList.sort(dynamicSort('FullName'));
					}
					this.memberList = [...this.rawMemberList];
					this.showLoader(false);
					resolve(response);
				}).catch(error => {
					reject(error);
				});
			});
		},
		switchTab(index) {
			if(this.rgIsEditted) {
				this.showDialogAlert = true;
			} else {
				this.activeTab = index;
				this.superVisorMode = index == 1 ? true : false;
				this.memberList    = [];
				this.showLoader(true);
				this.getMembers(this.selectedCustomerId, 'users', 'list').then(response => {
				this.getRoutingGroup();
				}, error => {
				console.error(error);
				this.showLoader(false);
				});
			}
		},
		resetTabs() {
			this.superVisorMode   = false;
			this.activeTab        = 0;
		},
		init(cusId) {
			this.showLoader(true);
			this.getDepartments(cusId).then(response => {
				this.departments      = [...response];
				this.getRoutingGroupList(cusId).then(res => {
					this.routingGroups  = [...res];
					this.showLoader(false);
				}, error => {
					console.error(error);
					this.showLoader(false);
				});
			}, error => {
				console.error(error);
				this.showLoader(false);
			});
		},
	},
	mounted() {
		this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
		this.tabdata			= [this.$store.state.settings.routinggroups.staffingtabs[0], this.$store.state.settings.routinggroups.staffingtabs[1]];

		if(this.selectedCustomerId !== -1) {
			this.init(this.selectedCustomerId);
		}

		this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
			if(cObj.selectedCustomerId !== -1) {
				this.showLoader(true);
				this.selectedCustomerId = cObj.selectedCustomerId;
				this.resetDisplay();
			}
		});
	},
	beforeUnmount() {
		this.storeWatch();
	}
}
</script>

<style lang="scss">
  .tabs-wrapper--routinggroup {
    margin-top: 18px;
  }
</style>
