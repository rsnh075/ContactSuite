
<template>
  <div data-e2e="user-management">
    <BlockContentModal
      :status  = "showDontChange"
      :content = $store.state.settings.dontchange.bodycontent
    />

    <!-- DIALOG CONFIRM -->
    <Confirm-Box
      :status="showDialog"
      :header="$store.state.settings.usermanagement.deleteuserconformationheader"
      :bodyContent="'<p>' + $store.state.settings.usermanagement.deleteuserconformationtext01 + '<strong>' + getFullName + '</strong>' +  $store.state.settings.usermanagement.deleteuserconformationtext02 + '<p>'"
      :acceptLabel="$store.state.settings.usermanagement.deletecustomerlabel"
      :cancelLabel="$store.state.settings.usermanagement.cancellabel"
      @accepted="deleteUser"
      @canceled="hideConfirm"
    />

    <!-- CONTEXT MENU -->
    <div class="list-content__row-menu" ref="contextMenu" @mouseleave="closeContextMenu($event)" @click="clickedOnList($event)">
      <a class="button__icon">&#xF1D9;</a>
      <ol v-if="selectedUser">
        <li v-if="hasCoachAgenten" class="list-content__menu-item coaching--js"><span>&#xF474;</span>{{ coachingLabel(selectedUser.Coached) }}</li>
        <li v-if="hasBeheerGebruikers && hasActivation(selectedUser.ActivationDate)" class="list-content__menu-item send-activation--js"><span>&#xF772;</span>{{ $store.state.settings.usermanagement.sublist[2] }}</li>
        <li v-if="hasBeheerGebruikers && selectedUser.LastLoginDate !== null" class="list-content__menu-item change-password--js"><span>&#xF772;</span>{{ $store.state.settings.usermanagement.sublist[3] }}</li>
        <li v-if="hasBeheerGebruikers && selectedUser.BlockedTill !== null" class="list-content__menu-item unblock--js"><span>&#xF772;</span>{{ $store.state.settings.usermanagement.sublist[4] }}</li>
      </ol>
    </div>

    <!-- USER LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.usermanagement.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalUsers + " " + $store.state.settings.usermanagement.usercountlabel}}
          </div>
          <div class="grid--push" v-if="hasBeheerGebruikers">
            <div class="form-button__secondary form-button__secondary--pushedright-dropdown form-button__secondary--add grid--push">
                <div class="dropdown-container">
                    <button type="button" @click="addUser()">{{ $store.state.settings.usermanagement.adduserlabel }}</button>
                    <button type="button" @click="addBulkUser()">{{ $store.state.settings.usermanagement.addbulkuserlabel }}</button>
                    <button type="button" @click="addBulkContact()">{{ $store.state.settings.usermanagement.addbulkcontactlabel }}</button>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper" ref="listContentWrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="orderedList"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--5 list-content__row-cell--font-icon" @click="sortColumn('Coached', $event)" data-sortorder="NONE"></span>
              <span class="list-content__row-cell list-content__row-cell--25" @click="sortColumn('FullName', $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.ucolheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--25" @click="sortColumn('EmailAddress', $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.ucolheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--20" @click="sortColumn('roleName', $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.ucolheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--25" @click="sortColumn('departmentName', $event)" data-sortorder="NONE" v-html="$store.state.settings.usermanagement.ucolheads[3]"></span>
            </div>
          </div>
          <div class="list-content">
            <ol>
              <li v-for="user in orderedList" :key="'userId_' + user.UserId" :class="['list-content__row', 'list-content__row--hover-action', {'list-content__row--clickable' : hasBeheerGebruikers}]" @click="showUser($event)" :data-clickable="isClickable" :data-customerId="user.CustomerId" :data-userId="user.UserId" :data-departmentId="user.Department.Id">
                <span class="list-content__row-cell list-content__row-cell--5 list-content__row-cell--font-icon">{{ user.Coached ? '&#xF474;' : '&nbsp;'}}</span>
                <span class="list-content__row-cell list-content__row-cell--25" v-html="user.FullName"></span>
                <span class="list-content__row-cell list-content__row-cell--25" v-html="user.EmailAddress"></span>
                <span class="list-content__row-cell list-content__row-cell--20" v-html="user.roleName"></span>
                <span class="list-content__row-cell list-content__row-cell--25" v-html="user.departmentName"></span>
                <div class="list-content__row-cell list-content__row-cell--icons sublist--js">
                  <a v-if="menuHasItems(user)" class="button__icon" @mouseenter="hoverRow($event, user)">&#xF1D9;</a>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- USER DETAIL SCREEN -->
    <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : screenStatus != 'list'}]">
      <div class="detailscreen" id="detailscreen">
        <a v-if="screenStatus != 'detail-show'" :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
        <!-- <a v-if="screenStatus == 'detail-show'" class="button__icon button__icon--top-right-corner" @click="editUser($event)">&#xF3EB;</a> -->
        <div class="grid-row">
          <div v-if="screenStatus != 'list'" class="grid-unit--gamma--double">
            <span v-if="getFullName.length > 1" class="detailscreen__title">{{ getFullName }}</span>
            <span v-else class="detailscreen__title">{{ $store.state.settings.usermanagement.newuserfullnamelabel }}</span>
          </div>
          <div v-if="screenStatus != 'list'" class="grid-unit--gamma">
            <span class="detailscreen__title detailscreen__title--right detailscreen__title--small">#{{ detailUser.UserId }}</span>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <Tab-bar
              :tabdata="tabdata"
              :isactive="activeTab"
              :notvalidtabs="notValidTabList"
              :hasAvailability="hasAvailability"
              @switchtab="showActive"
            />
          </div>
        </div>
        <form @valid="saveUser()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}" :data-partial="validationStatus" ref="tabContent">
          <div v-show="activeTab == 0" class="js-tabcontent">
            <div class="grid-row">
              <!-- <div v-if="screenStatus == 'detail-show'" class="grid-unit--alpha">
                <span class="detailscreen__title">{{ detailUser.FullName }}</span>
              </div>   -->
              <div v-show="screenStatus != 'detail-show'" class="grid-unit--gamma">
                <div class="form-textfield form-textfield--bground">
                  <input type="text" name="user-firstname" id="user-firstname" :placeholder="$store.state.settings.usermanagement.formfirstnamelabel" v-model="detailUser.FirstName" :data-validate="setValidation('isNotEmpty', 0)" :data-message="$store.state.settings.forms.messagefirstname">
                  <label for="user-firstname" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formfirstnamelabel }}</label>
                </div>
              </div>
              <div v-show="screenStatus != 'detail-show'" class="grid-unit--gamma">
                <div class="form-textfield form-textfield--bground">
                  <input type="text" name="user-infix" id="user-infix" :placeholder="$store.state.settings.usermanagement.forminfixlabel" v-model="detailUser.InFix">
                  <label for="user-infix" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.forminfixlabel }}</label>
                </div>
              </div>
              <div v-show="screenStatus != 'detail-show'" class="grid-unit--gamma">
                <div class="form-textfield form-textfield--bground">
                  <input type="text" name="user-lastname" id="user-lastname" :placeholder="$store.state.settings.usermanagement.formlastnamelabel" v-model="detailUser.LastName" :data-validate="setValidation('isNotEmpty', 0)" :data-message="$store.state.settings.forms.messagelastname">
                  <label for="user-lastname" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formlastnamelabel }}</label>
                </div>
              </div>
            </div>
            <!-- <div class="grid-row">
              <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.usermanagement.setlabelgeneral }}</h2>
            </div> -->
            <div class="grid-row">
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input :readonly="screenStatus == 'detail-show'" type="text" name="user-email" id="user-email" :placeholder="$store.state.settings.usermanagement.formemaillabel" v-model="detailUser.EmailAddress" :data-validate="setValidation('isEmail', 0)" :data-message="$store.state.settings.forms.messageemail">
                  <label for="user-email" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formemaillabel }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextemail }}</div>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div v-show="screenStatus != 'detail-show'" class="form-textfield form-textfield--bground">
                  <input :readonly="screenStatus == 'detail-show'" type="text" name="user-email2" id="user-email2" ref="useremail2" :placeholder="$store.state.settings.usermanagement.formemail2label" :data-validate="setValidation(isEditModus('custom_isEqualWith'), 0)" :data-message="$store.state.settings.forms.messageemail">
                  <label for="user-email2" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formemail2label }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextemail2 }}</div>
                </div>
                <!-- <div v-show="screenStatus != 'detail-show'" class="form-textfield form-textfield--bground">
                  <input readonly type="text" name="user-ID" id="user-ID" v-model="detailUser.UserId">
                  <label for="user-ID" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formuseridlabel }}</label>
                </div> -->
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input :readonly="screenStatus == 'detail-show'" type="text" name="user-username" id="user-username" v-model="detailUser.LoginName" :placeholder="$store.state.settings.usermanagement.formusernamelabel" :data-validate="setValidation('isNotEmpty', 0)" :data-message="$store.state.settings.forms.messageusername">
                  <label for="user-username" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formusernamelabel }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextusername }}</div>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div v-show="screenStatus != 'list'" :class="['form-selectfield', 'form-selectfield--inline-bground', {'form-selectfield--disabled' : screenStatus == 'detail-show'}]">
                  <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.usermanagement.formdepartmentlabel }}</label>
                  <select :disabled="screenStatus == 'detail-show'" v-model="detailUser.Department.Id" @change="updateDepartment" :data-validate="setValidation('isNotMinusOne', 0)" :data-message="$store.state.settings.usermanagement.formmessageuserdepartment">
                    <option value="-1" selected>{{ $store.state.settings.usermanagement.selectdepartmentlabel }}</option>
                    <option v-for="department in departments" :key="'departmentId_' + department.Id" :value="department.Id">{{ department.Title }}</option>
                  </select>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextdepartment }}</div>
                </div>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-unit--beta">
                <div v-show="screenStatus != 'list'" :class="['form-selectfield', 'form-selectfield--inline-bground', {'form-selectfield--disabled' : screenStatus == 'detail-show'}]">
                  <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.usermanagement.formrolelabel }}</label>
                  <select :disabled="screenStatus == 'detail-show'" v-model="detailUser.Role.RoleId" @change="updateRole" :data-validate="setValidation('isNotMinusOne', 0)" :data-message="$store.state.settings.usermanagement.formmessageselectrole">
                    <option value="-1" selected>{{ $store.state.settings.usermanagement.selectrolelabel }}</option>
                    <option v-if="roles.length > 0" v-for="role in roles" :key="'roleId_' + role.RoleId" :value="role.RoleId">{{ role.Name }}</option>
                  </select>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextrole }}</div>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input :readonly="screenStatus == 'detail-show'" type="text" name="user-empid" id="user-empid" :placeholder="$store.state.settings.usermanagement.formemloyeeidlabel" v-model="detailUser.ExternalId">
                  <label for="user-empid" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formemloyeeidlabel }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextemloyeeid }}</div>
                </div>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-unit--beta">
                <div v-show="screenStatus == 'detail-new' || detailUser.ActivationDate != null" class="form-textfield form-textfield--bground form-textfield--normal-form">
                  <input v-if="detailUser.ActivationDate != null || screenStatus == 'detail-new'" :readonly="screenStatus == 'detail-show'" type="text" id="datepickerActivationDate" v-model="detailUser.ActivationDate" :placeholder="$store.state.settings.usermanagement.formstartdatelabel" :data-validate="setValidation('isNotEmpty', 0)" :data-message="$store.state.settings.forms.messagestartdate" autocomplete="off">
                  <label class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.formstartdatelabel }}</label>
                  <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextstartdate }}</div>
                </div>
              </div>
              <div class="grid-unit--beta typo--paragraph typo--attention" v-show="screenStatus == 'detail-new' || detailUser.ActivationDate != null">
                {{ $store.state.settings.usermanagement.formpasswordemail[0] }}{{ checkActivationDate }}{{ $store.state.settings.usermanagement.formpasswordemail[2] }}
              </div>
            </div>
            <div class="grid-row" v-if="screenStatus != 'detail-new'">
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input readonly type="text" name="pwchangedate" id="pwchangedate" :value="formatDateTime(detailUser.PasswordChangeDate, $store.state.browserLanguage)" :placeholder="$store.state.settings.usermanagement.pwchangedateplaceholder">
                  <label for="pwchangedate" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.pwchangedatelabel }}</label>
                </div>
              </div>
              <div class="grid-unit--beta">
                <div class="form-textfield form-textfield--bground">
                  <input readonly type="text" name="blockedtilldate" id="blockedtilldate" :value="formatDateTime(detailUser.BlockedTillDate, $store.state.browserLanguage)" :placeholder="$store.state.settings.usermanagement.blockedtilldateplaceholder">
                  <label for="blockedtilldate" class="form-label form-label--hidden">{{ $store.state.settings.usermanagement.blockedtilldatelabel }}</label>
                </div>
              </div>
            </div>
          </div>
          <!-- AVAILABILITY -->
          <div v-show="activeTab == 1" class="js-tabcontent">
            <div v-show="hasAvailability">
                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <label class="form-label form-label--list-inline">{{ $store.state.settings.usermanagement.labelopennumberentrylogin }}</label>
                        <div class="form-radio-small form-radio-small--inline">
                            <input :disabled="screenStatus == 'detail-show'" type="radio" id="availabileon_one" v-model="dummyAvailability" value="toestel" @click="updateAvailability">
                            <label for="availabileon_one">{{ $store.state.settings.usermanagement.labelopennumberentryloginoff }}</label>
                        </div>
                        <div class="form-radio-small form-radio-small--inline">
                            <input :disabled="screenStatus == 'detail-show'" type="radio" id="availabileon_two" v-model="dummyAvailability" value="vrijekeus" @click="updateAvailability">
                            <label for="availabileon_two">{{ $store.state.settings.usermanagement.labelopennumberentryloginon }}</label>
                        </div>
                        <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">
                            {{ $store.state.settings.usermanagement.helptextavailability }}
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <label class="form-label form-label--list-inline">{{ $store.state.settings.usermanagement.formopenlinelabel }}</label>
                        <div :class="['form-radio-small', 'form-radio-small--inline', {'form-radio-small--disabled' : screenStatus == 'detail-show'}]">
                            <input type="radio" id="openlineradio_3" value="3" v-model="detailUser.UseOpenLine">
                            <label for="openlineradio_3">{{ $store.state.settings.usermanagement.formopenlineradiolabel[0] }}</label>
                        </div>
                        <div :class="['form-radio-small', 'form-radio-small--inline', {'form-radio-small--disabled' : screenStatus == 'detail-show'}]">
                            <input type="radio" id="openlineradio_2" value="2" v-model="detailUser.UseOpenLine">
                            <label for="openlineradio_2">{{ $store.state.settings.usermanagement.formopenlineradiolabel[1] }}</label>
                        </div>
                        <div :class="['form-radio-small', 'form-radio-small--inline', {'form-radio-small--disabled' : screenStatus == 'detail-show'}]">
                            <input type="radio" id="openlineradio_1" value="1" v-model="detailUser.UseOpenLine">
                            <label for="openlineradio_1">{{ $store.state.settings.usermanagement.formopenlineradiolabel[2] }}</label>
                        </div>
                        <div :class="['typo-helptext', 'typo-helptext--w100', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextopenline }}</div>
                    </div>
                </div>
                <div class="grid-row">
                    <div v-show="screenStatus != 'detail-show'" :class="['form-button__secondary', 'form-button__secondary--add', 'form-button__secondary--lowered', 'grid--push', {'form-button__secondary--disabled' : (screenStatus == 'detail-show')}]">
                        <input type="hidden" v-model="validateUserPhones" :data-validate="setValidation('isNotMinusOne', 1)" :data-message="$store.state.settings.usermanagement.formmessageuserphones">
                        <button type="button" @click="addDestination('voipnr')">{{ $store.state.settings.usermanagement.adddevice }}</button>
                        <button type="button" @click="addDestination('extnr')">{{ $store.state.settings.usermanagement.addextdevice }}</button>
                    </div>
                    <div :class="['grid-unit--alpha', 'typo-helptext', 'typo-helptext--w100', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextdestination }}</div>

                    <div class="grid-unit--alpha">
                        <ul :class="['list-number-wrapper', {'list-number-wrapper--h370' : screenStatus == 'detail-show'}, {'list-number-wrapper--h330' : screenStatus != 'detail-show'}]" v-sorter="sortoptions" @sortend="reorderNumbers($event.detail.oldIndex, $event.detail.newIndex)">
                            <li v-for="(phone, index) in userPhones" :key="'phoneId_' + phone.uniqueId" :data-prio="'prio-' + phone.Priority" class="list-number-line">
                                <span sorterhandle class="scriptmodule__icon draghandle">&#xF1DD;</span>
                                <input type="text" :name="['u-shortdialcode_' + index]" class="list-number-line__field list-number-label" v-model="phone.ShortDialCode" :data-index="index" :disabled="phone.disabled">
                                <input type="text" v-if="phone.TypeOfPhone == 'extnr'" :name="['u-address_' + index]" class="list-number-line__field list-number-line__field--w200 list-number-number" v-model="phone.Address" :data-index="index" :disabled="phone.disabled" @keydown.stop="checkPhoneNumber($event, 'Address', index)" :placeholder="$store.state.settings.usermanagement.placeholderextnumber">
                                <select v-else v-model="phone.Address" @change="setDisabledAvailablePhones()" :name="['u-address_' + index]" :disabled="phone.disabled" :data-index="index" class="list-number-line__field list-number-line__field--w200 list-number-number">
                                    <option value="">{{ $store.state.settings.usermanagement.placeholdernumber }}</option>
                                    <option v-for="availablePhone in availablePhones" :key="'phoneAddress_' + availablePhone.Address + getUniqueId" :value="availablePhone.Address" :disabled="availablePhone.phoneDisabled">{{ availablePhone.Address }}</option>
                                </select>
                                <div :class="['list-number-line__field', {'list-number-line__field--disabled' : phone.disabled}, 'form-checkbox']">
                                    <input type="checkbox" :id="['prive_' + index]" v-model="phone.IsPrivate" :data-index="index" class="list-number-checkbox" :disabled="phone.disabled">
                                    <label :for="['prive_' + index]">{{ $store.state.settings.usermanagement.formprivelabel }}</label>
                                </div>
                                <span class="list-number--icon">
                                    <a :class="['button__icon', 'button__icon--edit', {'button__icon--active' : !phone.disabled}, {'button__icon--disabled' : (screenStatus == 'detail-show')}]" @click="setDestinationEditable($event, index)" :data-index="index">&#xF3EB;</a>
                                    <a :class="['button__icon', 'button__icon--delete', {'button__icon--disabled' : (screenStatus == 'detail-show')}]" @click="deleteDestination($event, phone)" :data-index="index">&#xF1C0;</a>
                                </span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
          </div>
        </form>
        <!-- AGENT TO CALLGROUP -->
        <div v-show="activeTab == 2" class="js-tabcontent">
          <div :class="['grid-unit--alpha', 'typo-helptext', 'typo-helptext--w100', {'typo-helptext--active' : (showHelp && screenStatus != 'detail-show')}]">{{ $store.state.settings.usermanagement.helptextchangestillpermanent }}</div>
          <User-to-callgroup v-show="screenStatus != 'list' && hasAvailability"
            :screenStatus="screenStatus"
            :customerId="selectedCustomerId"
            :userId="detailUser.UserId"
            :hasAvailability="hasAvailability"
            @setUserRGObj="setUserRGObj"
          />
        </div>
        <div class="detailscreen-footer detailscreen-footer--inside">
          <span>
            <a v-if="screenStatus == 'detail-edit'" class="button-primary button-primary--delete" @click="showConfirm">{{ $store.state.settings.usermanagement.deleteuserlabel }}</a>
          </span>
          <span class="grid--push">
            <a v-if="screenStatus == 'detail-edit'" class="button-primary button-primary--gray" @click="cancelEdit">{{ $store.state.settings.usermanagement.cancellabel }}</a>
            <a v-else class="button-primary button-primary--gray" @click="backToList">{{ $store.state.settings.usermanagement.backlabeluser }}</a>
            <a v-show="screenStatus == 'detail-edit' || screenStatus == 'detail-new'" class="button-primary button-primary js-submitbtn">{{ $store.state.settings.usermanagement.saveuserlabel }}</a>
          </span>
        </div>
      </div>
    </div>
    <BulkLoader
      :visibility="$store.state.bulkloader.visibility"
      :header="$store.state.bulkloader.header"
      :message="$store.state.bulkloader.message"
      :currentcount="$store.state.bulkloader.currentcount"
      :maxcount="$store.state.bulkloader.maxcount"
    />
    <BulkUploader
      :visibility="bulkloadervisibility"
      :headers="bulkheaders"
      :bulkisuser="bulkIsUser"
      @oncancel="bulkloadervisibility = false"
      @onsave="saveBulkUpload"
      ref="bulkuploader"
    />
  </div>
</template>

<script>

const USERACTIONS = {
    'None' : 0,
    'SendActivationLink' : 1,
    'ChangePassword' : 2,
    'Unblock' : 3,
    'SetCoached' : 4
};

import {
        deepCopy,
        scrollTo,
        getUniqueId
    }                     from '../../use/helperFunctions';
import PikaDay            from 'pikaday';
import * as Mask          from './../../use/mask';
import ConfirmBox         from './../dialogs/Confirm-box.vue';
import BlockContentModal  from './../dialogs/Block-content-modal.vue';
import { ValidateDir }    from './../../directives/validate';
import { sortable }        from './../../directives/sortable';
import { IPCCCConfigurator } from './../../ipccc/js/configurator';
import BoxProps, { ModalType } from '../../types/BoxProps';

import UserToCallgroup    from './UserToCallgroup.vue';
import TabBar             from './Tab-bar.vue';
import BulkLoader         from './BulkLoader.vue';
import BulkUploader       from './BulkUploader.vue';
import ExportListToXLSX  from '../uielements/ExportListToXLSX.vue';
import {
        convertISOToDateTime,
        ISOdateTimetoDate,
        saveFormatDate,
        pikaDayToDDMMYYYY
        }                   from './../../use/dateFunctions';
import { dynamicSort }     from './../../use/sortFunctions';
import { defineComponent } from '@vue/runtime-core';

export default defineComponent({
    name: 'UserManagement',
    data() {
        return {
            selectedCustomerId   : -1,
            searchStr            : '',
            sortSetting          : {},
            totalUsers           : 0,
            unOrderedList        : [],
            orderedList          : [],
            screenStatus         : 'list',
            detailUser: {
            Role: {
                RoleId             : -1,
                AccessibilityRole  : false
            },
            Department: {
                Id                 : -1
            }
            },
            userPhones           : [],
            showHelp             : false,
            departments          : [],
            roles                : [],
            newStartDate         : '',
            showDialog           : false,
            datePickerActivationDate : null,
            dummyAvailability    : "toestel",
            storeWatch           : null,
            storeWatchTwo        : null,
            selectedUser         : null,
            userRGObj            : {},
            availablePhones      : [],
            minPhoneNumberLength : 9,
            tabdata              : [],
            activeTab            : 0,
            tabSwitched          : false,
            nextTab              : 0,
            tabList              : null,
            notValidTabList      : [],

            bulkloadervisibility : false,
            bulkIsUser           : true,
            doImport : true,
            bulkUsersFailed      : [],
            sortoptions          : {isSortable: true},
            exportListBtnStyles  : {
                                        top: '9px',
                                        right: '8px',
                                        zIndex: 1
                                    },
            exportListWrapperStyles : {
                                        top: '9px',
                                        right: '8px',
                                    },
        }
    },
    inject: ['showLoader', 'showModalDialog'],
    directives: {
        Validate: ValidateDir,
        Sorter: sortable
    },
    components: {
        TabBar,
        BlockContentModal,
        'Confirm-Box'       : ConfirmBox,
        'User-to-callgroup' : UserToCallgroup,
        BulkUploader,
        BulkLoader,
        ExportListToXLSX
    },
    computed: {
        isEditModus() {
            return type => {
            return this.screenStatus == 'detail-show' ? 'isAll' : type;
            }
        },
        getFullName() {
            return this.composeFullName(this.detailUser.FirstName, this.detailUser.InFix, this.detailUser.LastName);
        },
        validationStatus() {
            return this.tabSwitched ? 'partial' : 'form';
        },
        setValidation() {
            return (type, tabId) => {
            return this.activeTab == tabId ? type : type + '_skip';
            }
        },
        hasAvailability() {
            return (this.detailUser.Role.AccessibilityRole == true) ? true : false;
        },
        hasBeheerGebruikers() {
            return this.$store.getters.getPermission('BeheerGebruikers');
        },
        hasCoachAgenten() {
            return this.$store.getters.getPermission('CoachAgenten');
        },
        isClickable() {
            return this.$store.getters.getPermission('BeheerGebruikers') ? 'clickable' : 'not-clickable';
        },
        showDontChange() {
            return this.$store.getters.getCustomerInfo().selectedCustomerUsesCasa == false;
        },
        validateUserPhones() {
            let _hasNoPhoneWithoutPrivate  = true,
                _hasNoEmptyPhoneNumber     = true;
            if(this.userPhones.length > 0 && this.userPhones.filter(el => el.IsPrivate == false).length == 0) {
            _hasNoPhoneWithoutPrivate = false;
            }
            if(this.userPhones.length > 0 && (this.userPhones.filter(el => el.Address == '').length > 0)) {
            _hasNoEmptyPhoneNumber = false;
            }
            if(this.userPhones.length > 0 && (this.userPhones.filter(el => el.TypeOfPhone == 'extnr' && el.Address.length <= 8).length > 0)) {
            _hasNoEmptyPhoneNumber = false;
            }
            return ((_hasNoPhoneWithoutPrivate && _hasNoEmptyPhoneNumber) || (this.dummyAvailability != "toestel" && _hasNoEmptyPhoneNumber)) ? 1 : -1;
        },
        checkActivationDate() {
            return (this.detailUser.ActivationDate) ? this.detailUser.ActivationDate : this.$store.state.settings.usermanagement.formpasswordemail[1];
        },
        isSortable() {
            return this.userPhones.findIndex(el => !el.disabled) == -1 && this.screenStatus == 'detail-edit';
        },
        okToSaveRGs() {
            return this.userRGObj && this.userRGObj.Details ? this.userRGObj.Details.length > 0 : false;
        },
        bulkheaders() {
            return this.bulkIsUser ?
            [   //User
            'Voornaam',
            'Tussenvoegsel',
            'Achternaam',
            'Bedrijfsnaam',
            'Afdeling',
            'LoginID',
            'EmployeeId',
            'Emailadres',
            'VastNummer',
            'VOIPnummer',
            'MobielNummer',
            'VOIPbeschrijving',
            'Supervisor(Ja/Nee)',
            'StartDatum',
            'Callgroups',
            'Rol',
            'WebRTC'
            ] :
            [   //Contact
            'Id',
            'Voornaam',
            'Tussenvoegsel',
            'Achternaam',
            'Bedrijfsnaam',
            'ContactAfdeling',
            'EmailadresLabel',
            'Emailadres',
            'VastNummer',
            'MobielNummer',
            'Adres',
            'Huisnummer',
            'HuisnummerToevoeging',
            'Postcode',
            'Woonplaats',
            'Land',
            'Notitie',
            ]
        }
    },
    watch: {
        isSortable: function(newVal, oldVal) {
            this.sortoptions.isSortable = newVal;
        }
    },
    methods: {
        hoverRow(evt, obj) {
            evt.stopPropagation();

            this.selectedUser                     = obj;
            this.$refs.contextMenu.style.top      = '';
            this.$refs.contextMenu.style.left     = '';

            setTimeout(() => {
                let _target           = evt.target,
                    _targetProps      = _target.getBoundingClientRect(),
                    _menuProps        = this.$refs.contextMenu.getBoundingClientRect(),
                    _listWrapper      = this.$refs.listContentWrapper,
                    _listWrapperProps = _listWrapper.getBoundingClientRect();;

                if(((_targetProps.top - _listWrapperProps.top) + _menuProps.height) > (_listWrapper.scrollTop + _listWrapperProps.height)) {
                    this.$refs.contextMenu.style.top      = (_targetProps.top + _targetProps.height - _menuProps.height) + 'px';
                    this.$refs.contextMenu.classList.add('list-content__row-menu--flip');
                } else {
                    this.$refs.contextMenu.style.top      = _targetProps.top + 'px';
                    this.$refs.contextMenu.classList.remove('list-content__row-menu--flip');
                }

                this.$refs.contextMenu.style.left     = (_targetProps.left - _menuProps.width) + 'px';
            });
        },
        closeContextMenu(evt) {
            evt.stopPropagation();
            this.$refs.contextMenu.style.left     = '';
            this.$refs.contextMenu.style.top      = '';
            this.$refs.contextMenu.classList.remove('list-content__row-menu--flip');
        },
        formatDateTime: function (datetime, _Language) {
            let _datetime = null;
            if(datetime) {
                _datetime = convertISOToDateTime(datetime, _Language);
            }
            return _datetime;
        },
        getUserById(customerId, userId) {
            return IPCCCConfigurator.Request(customerId, 'users', 'readone', null, userId);
        },
        getRoles(userId) {
            return IPCCCConfigurator.Request(this.selectedCustomerId, 'role', 'list', null, userId);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        saveBulk(data) {
            // console.log('saveBulk data:', data);
            let _count     = 0,
                _currentId = -1,
                _nrOfUsers = data.length,
                _isTest    = true;

            this.$store.commit('SET_BULKIMPORT', true);

            const saveUserByData = user => {
                this.$store.commit('SET_BULKLOADER_STATUS', {
                    visibility   : true,
                    header       : _isTest ? this.$store.state.settings.usermanagement.preflight : this.$store.state.settings.usermanagement.import,
                    message      : `${this.bulkIsUser ? 'user' : 'contact'} ${_count + 1} of ${_nrOfUsers} is ${_isTest ? 'validated' : 'saved'}`,
                    currentcount : _count + 1,
                    maxcount     : _nrOfUsers
                });

                const checkAfdelingIsValid = afdeling => {
                    return !isNaN(parseInt(afdeling));
                };

                if (this.bulkIsUser && !checkAfdelingIsValid(user.Afdeling)) {
                    user.Afdeling = -1;
                }

                let _userToSend = {
                    "Test" : _isTest,
                    "Data" : deepCopy(user)
                }
                // console.log('Save bulk user/contact:', _userToSend);
                return IPCCCConfigurator.Request(this.selectedCustomerId, 'bulkusers', 'save', _userToSend, -1);
            };

            const addUserToListAndRemove = (nwuser) => {
                let _nwuser = {};
                if (nwuser.Created) {
                    _nwuser = nwuser.Created;
                }
                this.$refs.bulkuploader.updateList(_currentId);
                nwuser.Created.departmentName   = nwuser.Created.Department.Title;
                nwuser.Created.roleName         = nwuser.Created.Role.Name;
                this.orderedList.unshift(nwuser.Created);
                this.unOrderedList.push(nwuser.Created);
                delete data[_count];
            }

            const doNextUser = () => {
                saveUserByData(data[_count])
                .then(nwuser => {
                    // console.log('saved user/contact', nwuser);
                    if (!_isTest) {
                        if (this.bulkIsUser) {
                            //ADD TO LIST AND REMOVE
                            addUserToListAndRemove(nwuser);
                        } else {
                            //todo show uploaded
                            this.$refs.bulkuploader.updateList(_currentId);
                            delete data[_count];
                        }
                    } else {
                        if (nwuser.Faults !== null && nwuser.Faults.length > 0) {
                            this.bulkUsersFailed = this.bulkUsersFailed.concat(nwuser.Faults);
                            data[_count].errorType = nwuser.Result;
                            data[_count].errors = nwuser.Faults;
                        }
                    }
                    _count++;
                    if (_count < _nrOfUsers && this.doImport) {
                        _currentId = data[_count].Id;
                        doNextUser(data[_count]);
                        return data;
                    } else {
                        if (_isTest) {
                            if (this.bulkUsersFailed.length === 0) { //ALL IS VALID GO AND SAVE ALL
                                _isTest    = false,
                                _count     = 0,
                                _currentId = data[_count].Id;
                                doNextUser(data[_count]);
                            } else { //SOME ARE NOT VALID RETURN TO THE UPLOADLIST
                                setTimeout(() => {
                                    this.$store.commit('SET_BULKLOADER_STATUS', {
                                        visibility   : false,
                                        header       : '',
                                        message      : '',
                                        currentcount : 0,
                                        maxcount     : 0
                                    });

                                }, 3000);
                                // console.log('markErrors', data);
                                this.$refs.bulkuploader.markErrors(data);
                            }
                        } else {
                            setTimeout(() => {
                                this.$store.commit('SET_BULKLOADER_STATUS', {
                                    visibility   : false,
                                    header       : '',
                                    message      : '',
                                    currentcount : 0,
                                    maxcount     : 0
                                });
                                this.$refs.bulkuploader.isFinished();
                            }, 4000)
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    data[_count].errorType = error.Result;
                    data[_count].errors    = error.Faults;
                    _count++;
                    if (_count < _nrOfUsers && this.doImport) {
                        _currentId = data[_count].Id;
                        doNextUser(data[_count]);
                        return data;
                    } else {
                        setTimeout(() => {
                            this.$store.commit('SET_BULKLOADER_STATUS', {
                                visibility   : false,
                                header       : '',
                                message      : '',
                                currentcount : 0,
                                maxcount     : 0
                            });
                        }, 3000);
                        this.$refs.bulkuploader.isFinished();
                        // console.log('markErrors');
                        this.$refs.bulkuploader.markErrors(data);
                    }
                });
            }

            if(data.length > 0) {
                _currentId = data[_count].Id;
                //delete data[_count].Id;
                doNextUser(data[_count]);
            }
        },
        addBulkContact() {
            this.$refs.bulkuploader.clearData();
            this.bulkIsUser = false;
            this.bulkloadervisibility  = true;
        },
        addBulkUser() {
            this.$refs.bulkuploader.clearData();
            this.bulkIsUser = true;
            this.bulkloadervisibility  = true;
        },
        saveBulkUpload(data) {
            this.bulkUsersFailed      = [];
            this.saveBulk(data);
        },
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        addUser() {
            this.showLoader(true);
            this.resetDisplay();
            //GET EMPTY USER OBJECT
            IPCCCConfigurator.Request(this.selectedCustomerId, 'users', 'readnew', null, -1)
            .then(response => {
                this.detailUser = response[0];
                // this.detailUser.DepartmentId   = -1;
                this.getRoles(this.detailUser.UserId).then(succes => {
                    this.roles = [...succes];
                    this.getAvailablePhones()
                    .then(success => {
                        this.availablePhones = [...success];
                        this.setDisabledAvailablePhones();
                        //set defaults
                        this.dummyAvailability         = 'toestel';
                        this.detailUser.LoginWithWorkplace = false;
                        this.detailUser.AskForPhonenumber  = false;
                        this.detailUser.UseOpenLine        = 3;

                        this.screenStatus              = 'detail-new';
                        this.showLoader(false);
                        this.$nextTick(() => {
                            this.setDatePicker();
                        })
                    }, error => {
                    console.error(error);
                    });
                }, error => {
                    console.error(error);
                });
            })
            .catch(error => {
                console.error(error);
            });
        },
        showUser(evt) {
            if(!this.hasBeheerGebruikers)
            return;
            this.showLoader(true);
            this.resetDisplay();
            let _custId         = evt.currentTarget.getAttribute('data-customerId'),
                _usrId          = evt.currentTarget.getAttribute('data-userId');
            this.getUserById(_custId, _usrId)
            .then(succes => {
                this.detailUser   = JSON.parse(JSON.stringify(succes));
                // this.detailUser   = {...succes,
                //                      DepartmentId: succes.Department.Id
                //                     };
                this.$refs.useremail2.value = this.detailUser.EmailAddress;
                this.userPhones   = [...succes.UserPhones];
                this.userPhones.forEach((phone, index) => {
                    this.userPhones[index].disabled = true;
                    if(phone.Address.length > this.minPhoneNumberLength) { //Better to be determined by Back End
                    this.userPhones[index].TypeOfPhone = 'extnr';
                    } else {
                    this.userPhones[index].TypeOfPhone = 'voipnr';
                    }
                    this.userPhones[index].uniqueId = getUniqueId();
                });
                this.userPhones.sort(dynamicSort('Priority'));
                this.getRoles(this.detailUser.UserId)
                .then(succes => {
                    this.roles = [...succes];
                    if(this.detailUser.ActivationDate != null)
                        this.detailUser.ActivationDate =  ISOdateTimetoDate(this.detailUser.ActivationDate);
                    this.setSelectedAvailabiliy(this.detailUser.AskForPhonenumber, this.detailUser.LoginWithWorkplace);
                    this.getAvailablePhones()
                    .then(success => {
                        this.availablePhones = [...success, ...this.getMappedUserPhones()]; // Add userPhones to available Phones
                        this.setDisabledAvailablePhones();
                        this.screenStatus = 'detail-edit';

                        this.$nextTick(() => {
                            this.showLoader(false);
                            if(this.detailUser.ActivationDate) {
                                this.setDatePicker();
                            }
                        });
                    }, error => {
                        console.error(error);
                    });
                }, error => {
                    console.error(error);
                });
            }, error => {
                console.error(error);
            });
        },
        // editUser(evt) {
        //   // sortoptions.isSortable = false;
        //   this.$refs.useremail2.value = this.detailUser.EmailAddress;
        //   this.screenStatus           = 'detail-edit';
        // },
        saveUser() {
            if (this.tabSwitched) {
                this.tabSwitched = false;
                this.activeTab   = this.nextTab;
            } else {
                this.showLoader(true);
                this.detailUser.UserPhones = this.userPhones;
                if(this.detailUser.UserPhones.length > 0)
                    this.reprioritizeUserphones();
                if(this.detailUser.ActivationDate != null)
                    this.detailUser.ActivationDate = saveFormatDate(this.detailUser.ActivationDate);
                this.detailUser.CustomerId   = this.selectedCustomerId;
                this.detailUser.FullName     = this.getFullName;
                IPCCCConfigurator.Request(this.selectedCustomerId, 'users', 'save', this.detailUser, -1)
                .then(response => {
                    if(this.detailUser.ActivationDate != null)
                        this.detailUser.ActivationDate = ISOdateTimetoDate(this.detailUser.ActivationDate);
                    if(this.detailUser.UserPhones.length > 0)
                        this.disableDestinations();
                    if(this.hasAvailability && this.okToSaveRGs) { //save RGs
                        this.saveUserToRoutingGroups(response, data => {
                        this.updateUserList(response);
                        });
                    } else {
                        this.updateUserList(response);
                    }
                }).catch(error => {
                    if(this.detailUser.ActivationDate != null)
                        this.detailUser.ActivationDate = ISOdateTimetoDate(this.detailUser.ActivationDate);
                    this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.dialog.dialogalertheader, error));
                    console.error(error);
                    this.showLoader(false);
                });
            }
        },
        saveListUser(user, usrIndex) {
            IPCCCConfigurator.Request(user.CustomerId, 'users', 'save', user, -1)
            .then(response => {
                this.reactToUseractions(response.Action, usrIndex);
                this.showLoader(false);
            })
            .catch(error => {
                this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.dialog.dialogalertheader, error));
                console.error(error);
                this.showLoader(false);
            });
        },
        deleteUser() {
            this.showLoader(true);
            this.screenStatus        = 'detail-delete';
            this.detailUser.FullName = this.getFullName;
            if(this.detailUser.ActivationDate != null)
            this.detailUser.ActivationDate = saveFormatDate(this.detailUser.ActivationDate);
            IPCCCConfigurator.Request(this.selectedCustomerId, 'users', 'delete', this.detailUser, -1)
            .then(response => {
                let _userToDeleteIndex = this.unOrderedList.findIndex(user => user.UserId == response.UserId);
                this.unOrderedList.splice(_userToDeleteIndex, 1);
                this.orderedList        = [...this.unOrderedList];
                this.totalUsers         = this.orderedList.length;
                this.filterList();
                this.sortColumn();
                this.hideConfirm();
                this.backToList();
                this.showLoader(false);
            }).catch(error => {
                this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.dialog.dialogalertheader, error));
                console.error(error);
                this.showLoader(false);
            });
        },
        updateUserList(userData) {
            let _userToUpdateIndex    = this.unOrderedList.findIndex(user => user.UserId == userData.UserId);
            this.totalUsers           = 0;
            userData.departmentName   = userData.Department.Title;
            userData.roleName         = userData.Role.Name;

            if(_userToUpdateIndex != -1) {
                this.unOrderedList[_userToUpdateIndex] = userData;
            } else {
                this.unOrderedList.push(userData);
            }

            this.orderedList        = [...this.unOrderedList];
            this.totalUsers         = this.orderedList.length;

            this.resetDisplay();
            this.filterList();
            this.sortColumn();
            this.backToList();
            if(_userToUpdateIndex != -1) {
                setTimeout(() => {
                    this.setHighlightedRow(userData.UserId);
                }, 500);
            }
            this.showLoader(false);
        },
        cancelEdit() {
            if(this.detailUser.UserPhones.length > 0)
                this.disableDestinations();
            this.backToList()
        },
        backToList() {
            this.hideValidation();
            this.notValidTabList = [];
            this.activeTab       = 0;
            this.screenStatus    = 'list';
            this.showHelp        = false;
            //set defaults back
            this.detailUser      = Object.assign({}, {
                Role: {
                    RoleId             : -1,
                    AccessibilityRole  : false
                },
                Department: {
                    Id                 : -1
                }
            });
            this.userPhones          = [];
            this.dummyAvailability   = "toestel";
            this.newStartDate        = '';
            this.resetDisplay();
        },
        showConfirm() {
            this.showDialog = true;
        },
        hideConfirm() {
            this.showDialog = false;
            this.resetDisplay();
        },
        updateDepartment(evt) {
            let _val               = parseInt(evt.target.value),
                _changedDepartment = this.departments.filter(_department => _department.Id == _val);

            //ADDET PROPS ARE NOT REACTIVE SO CLONE AND REASSIGN.
            // this.detailUser = Object.assign({}, this.detailUser, { DepartmentId: _val });

            if(_changedDepartment.length > 0) {
                this.detailUser['Department'].Id = _val;
                this.detailUser['Department'].Title = _changedDepartment[0].Title;
                this.detailUser['Department'].Description = _changedDepartment[0].Description;
            }
        },
        updateRole(evt) {
            let _val               = evt.target.value,
                _role              = this.roles.filter(role => role.RoleId == _val);

            if(_role.length > 0) {
                this.detailUser.Role.AccessibilityRole = _role[0].AccessibilityRole;
                this.detailUser.Role.Currency = _role[0].Currency;
                this.detailUser.Role.Description = _role[0].Description;
                this.detailUser.Role.Name = _role[0].Name;
                this.detailUser.Role.NumberOfAssignedAssetDetails = _role[0].NumberOfAssignedAssetDetails;
                this.detailUser.Role.PricePerDay = _role[0].PricePerDay;
                this.detailUser.Role.PricePerMonth = _role[0].PricePerMonth;
                this.detailUser.Role.RoleId = _role[0].RoleId;
            }
        },
        checkPhoneNumber(evt, prop, index) {
            this.userPhones[index][prop] = Mask.isPhoneNumberMask(evt);
            this.validateUserPhones;
        },
        disableDestinations() {
            // sortoptions.isSortable = true;
            this.userPhones.forEach((el, index) => {
                this.userPhones[index].disabled = true;
            });
        },
        addDestination(addExtNr) {
            let _priority  = this.userPhones.length;
            this.disableDestinations();
            this.userPhones.push({
                Active          : true,
                Address         : '',
                AddressType     : 1,
                ContactPersonId : -1,
                Id              : -1,
                IsPrivate       : false,
                Priority        : _priority,
                ShortDialCode   : this.$store.state.settings.usermanagement.defaultshortdialcode,
                disabled        : false,
                uniqueId        : getUniqueId(),
                TypeOfPhone     : addExtNr
            });
            if(addExtNr == 'extnr') {
                this.$nextTick(() => {
                    document.querySelector('[name="u-address_' + _priority + '"]').focus();
                });
            }
        },
        setDestinationEditable(e, selectedIndex) {
            // sortoptions.isSortable = false;
            this.userPhones.forEach((el, index) => {
                if(index == selectedIndex && el.disabled) {
                    this.userPhones[selectedIndex].disabled = false;
                    // sortoptions.isSortable = true;
                } else {
                    this.userPhones[index].disabled = true;
                }
            });
        },
        deleteDestination(e, phone) {
            let _index = e.target.getAttribute('data-index');
            this.userPhones.splice(_index, 1);
            this.userPhones.map((el, index) => {
                el.Priority = index;
            });
            //update AvailablePhones
            this.setDisabledAvailablePhones();
        },
        reprioritizeUserphones() {
            this.userPhones.map((el, index) => {
                el.Priority = index;
            });
        },
        //   reorderNumbers(evt) {
        //     const movedItem = this.userPhones.splice(evt.detail.oldIndex, 1)[0];
        //     this.userPhones.splice(evt.detail.newIndex, 0, movedItem);
        //     this.reprioritizeUserphones();
        //   },
        reorderNumbers(oldindx, newindx) {
            const movedItem = this.userPhones.splice(oldindx, 1)[0];
            this.userPhones.splice(newindx, 0, movedItem);
            this.reprioritizeUserphones();
        },
        setSelectedAvailabiliy(_vrijekeus, _werkplek) {
            if(!_vrijekeus && !_werkplek)
                this.dummyAvailability = "toestel";
            else if(_vrijekeus)
                this.dummyAvailability = "vrijekeus";
            else
                this.dummyAvailability = "toestel";
        },
        updateAvailability(evt) {
            let _val = evt.target.value;

            switch(_val) {
            case "werkplek":
                this.dummyAvailability = "werkplek"
                this.detailUser.LoginWithWorkplace = true;
                this.detailUser.AskForPhonenumber = false;
                break;
            case "toestel":
                this.dummyAvailability = "toestel"
                this.detailUser.LoginWithWorkplace = false;
                this.detailUser.AskForPhonenumber = false;
                break;
            case "vrijekeus":
                this.dummyAvailability = "vrijekeus"
                this.detailUser.LoginWithWorkplace = false;
                this.detailUser.AskForPhonenumber = true;
                break;
            }
        },
        reactToUseractions(action, usrIndex) {
            switch(action) {
            case USERACTIONS.SetCoached:
                let _toggleCoached = !this.unOrderedList[usrIndex].Coached;
                this.unOrderedList[usrIndex].Coached = _toggleCoached;
                break;
            case USERACTIONS.Unblock:
                this.unOrderedList[usrIndex].BlockedTill = null;
                break;
            }
        },
        getAvailablePhones() {
            return IPCCCConfigurator.Request(this.selectedCustomerId, 'UserAvailablePhones', 'list', null, -1);
        },
        getMappedUserPhones() {
            let _filteredUserPhones = [],
                _mappedUserPhones   = [];
            _filteredUserPhones     = this.detailUser.UserPhones.filter(phone => phone.Address.length <= this.minPhoneNumberLength);
            _mappedUserPhones       = _filteredUserPhones.map(phone => {
                let { Address, AddressType: Type } = phone;
                return { Address, Type };
            });
            return _mappedUserPhones;
        },
        checkIsUserPhone(address) {
            return this.detailUser.UserPhones.findIndex(phone => phone.Address == address) != -1;
        },
        setDisabledAvailablePhones() {
            this.availablePhones.forEach((phone, index) => {
                if(this.userPhones.findIndex(uphone => uphone.Address == phone.Address) == -1) {
                    this.availablePhones[index].phoneDisabled = false;
                } else {
                    this.availablePhones[index].phoneDisabled = true;
                }
            });
            this.availablePhones.sort(dynamicSort('Address'));
        },
        //=========================================================== START USERTOCALLGROUP METHODS
        setUserRGObj(userrgobj) {
            this.userRGObj = userrgobj;
        },
        saveUserToRoutingGroups(userdata, callback) {
            this.userRGObj.Details.forEach(rg => {
                rg.UserName = userdata.FullName;
                rg.UserId   = userdata.UserId;
            })
            IPCCCConfigurator.Request(this.selectedCustomerId, 'staffing', 'save', this.userRGObj, userdata.UserId)
            .then(() => callback())
            .catch(error => {
                console.error(error);
                this.showLoader(false);
            });
        },
        // rgArraysEqual(_arr1, _arr2) {
        //   if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
        //     return false;
        //   let arr1 = _arr1.concat().sort(),
        //       arr2 = _arr2.concat().sort();
        //   arr1.forEach((rg, index) => {
        //     if (rg !== arr2[index])
        //       return false;
        //   });
        //   return true;
        // },
        //=========================================================== START TABBAR METHODS

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

        //=========================================================== START DISPLAY LIST METHODS
        menuHasItems(user) {
            // if(this.hasCoachAgenten) {
            //     //menuitem coaching is dependable on having the permission to coach
            //     return true;
            // } else {
                if(this.hasBeheerGebruikers &&
                    user.ActivationDate != null ||
                    user.LastLoginDate != null ||
                    user.BlockedTill != null) {
                    return true;
                } else {
                    return false;
                }
            // }
        },
        hasActivation(date) {
            //Date means there is an activationlink.
            let _hasActivation = false;

            if(date) {
                let _date      = date.split('T')[0],
                    _dateNow   = new Date().toISOString().split('T')[0],
                    _msdate    = Date.parse(_date),
                    _msnow     = Date.parse(_dateNow);
                _hasActivation = (_msdate >= _msnow) ? true : false;
            }
            return _hasActivation;
        },
        isCoached(coached) {
            return coached ? '&#xF474' : '&nbsp;';
        },
        coachingLabel(coached) {
            return coached ? this.$store.state.settings.usermanagement.sublist[1] : this.$store.state.settings.usermanagement.sublist[0];
        },
        clickedOnList(evt) {
            let _target    = evt.target,
                _trigger   = [..._target.classList].find(cls => cls.indexOf('--js') != -1),
                _userId    = this.selectedUser.UserId,
                _userIndex = this.unOrderedList.findIndex(usr => usr.UserId == _userId),
                _user      = this.unOrderedList[_userIndex];

            if(_trigger === 'send-activation--js') {
                _user.Action = USERACTIONS.SendActivationLink;
            }
            if(_trigger === 'change-password--js') {
                _user.Action = USERACTIONS.ChangePassword;
            }
            if(_trigger === 'unblock--js') {
                _user.Action = USERACTIONS.Unblock;
            }
            if(_trigger === 'coaching--js') {
                _user.Action = USERACTIONS.SetCoached;
            }
            if(typeof _trigger !== 'undefined') {
                this.showLoader(true);
                this.saveListUser(_user, _userIndex);
            }
        },
        filterList() {
            this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
            this.totalCustomers = this.orderedList.length;
            this.sortColumn();
        },
        filterListOnString(list, str) {
            if(str != '') {
                let _rawList = [...list];
                return _rawList.filter(item => {
                    if(item['FullName'].toLowerCase().indexOf(str) != -1 ||
                        item['EmailAddress'].toLowerCase().indexOf(str) != -1 ||
                        item['roleName'].toLowerCase().indexOf(str) != -1 ||
                        item['departmentName'].toLowerCase().indexOf(str) != -1) {
                        return item;
                    };
                });
            } else {
            return [...list];
            }
        },
        sortColumn(key, e = null) {
            this.setHighlightedRow(-2);
            let _order,
                _t;

            if(e != null) {
                _t     = e.target;
                _order = _t.getAttribute('data-sortOrder');
                document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
                this.sortSetting = {
                    'key': key,
                    'order' : _order
                }
            } else {
                _order = this.sortSetting.order;
                key    = this.sortSetting.key;
            }

            switch(_order) {
            case 'NONE':
                this.orderedList.sort(dynamicSort(key));
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'ASC');
                break;
            case 'ASC':
                this.orderedList.sort(dynamicSort('-' + key));
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'DES');
                break;
            case 'DES':
                this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
                this.totalCustomers = this.orderedList.length;
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'NONE');
                break;
            }
        },
        setHighlightedRow(id) {
            let _wrapper = null;
            document.querySelectorAll('[data-userid]').forEach(el => {
                _wrapper = el.parentElement.parentElement;
                if (el.getAttribute('data-userid') == id) {
                    el.classList.add('list-content__row--mutated');
                    scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
                } else {
                    el.classList.remove('list-content__row--mutated');
                }
            });
            if(id == -2 && _wrapper !== null)
                scrollTo(_wrapper, 0, 200);
        },
        //=========================================================== END DISPLAY LIST METHODS

        //=========================================================== START HELPER METHODS
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
        displayHelp() {
            this.showHelp = !this.showHelp;
        },
        resetDisplay() {
            // sortoptions.isSortable = true;
            if(this.$refs.useremail2)
                this.$refs.useremail2.value = '';
            document.querySelectorAll('span[data-name="validCheck"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('span[data-name="validMessage"]').forEach(el => el.style.display = 'none');
            this.userRGObj         = {};
            this.newExternalNumber = false;
        },
        composeFullName(fn, inf, ln) {
            let fullName = fn + " ";
            if(inf != '') fullName += inf + " ";
            fullName += ln;
            return fullName;
        },
        setDatePicker() {
            this.datePickerActivationDate = new PikaDay({
                field: document.getElementById('datepickerActivationDate'),
                format: 'DD-MM-YYYY',
                minDate: new Date(),
                i18n: this.$store.state.settings.datepicker,
                onOpen: () => { //FIX VOOR EDIT MODE
                    if(this.screenStatus == 'detail-show') {
                    this.datePickerActivationDate.hide();
                    }
                },
                onSelect: () => {
                    this.newStartDate = pikaDayToDDMMYYYY(this.datePickerActivationDate.getDate());
                    this.detailUser.ActivationDate = this.newStartDate;
                },
            })
        },
        getUsers(cusId) {
            this.showLoader(true);

            this.resetDisplay();
            IPCCCConfigurator.Request(cusId, 'users', 'list', null, -1)
            .then(response => {
                this.totalUsers       = 0;
                this.unOrderedList    = [...response];
                this.unOrderedList.map(user => {
                    user.departmentName = user.Department.Title;
                    user.roleName       = user.Role.Name;
                });
                this.orderedList      = [...this.unOrderedList];
                this.totalUsers       = this.orderedList.length;
                IPCCCConfigurator.Request(cusId, 'department', 'readall', null, -1)
                    .then(response => {
                        this.departments = [...response];
                        this.showLoader(false);
                }).catch(error => {
                    console.error(error);
                    this.showLoader(false);
                });
            })
            .catch(error => {
                console.error(error);
                this.showLoader(false);
            });
        },
        //=========================================================== END HELPER METHODS
    },
    mounted() {
        this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
        this.tabdata            = this.$store.state.settings.usermanagement.tabdatalbl;
        this.tabList            = this.$refs['tabContent'];

        if(this.selectedCustomerId !== -1)
            this.getUsers(this.selectedCustomerId);

        this.storeWatch = this.$store.watch(() => this.$store.getters.getCustomerInfo(), cObj => {
            this.showDialog = false;
            this.resetDisplay();
            this.selectedCustomerId = cObj.selectedCustomerId;
            this.screenStatus       = 'list';
            this.showHelp           = false;
            this.getUsers(cObj.selectedCustomerId);
        });

        this.storeWatchTwo = this.$store.watch(() => this.$store.getters.getBulkImport(), status => {
            this.doImport = status;
        });

    },
    beforeUnmount() {
      this.storeWatch();
      this.storeWatchTwo();
    }
});
</script>

<style scoped lang="scss">
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

[data-e2e='user-management'] {
    .form-checkbox {
        width: auto;
        height: 33px;
    }
    .list-topbar {
        z-index: 200;
    }
    .list-content-wrapper {
        z-index: 100;
    }
    .list-number-line {
        overflow: hidden;
    }
    .dropdown-container {
        height: 40px;
        display:grid;
        overflow: hidden;
        padding: 0 3px 0 20px;
        background-color: globals.$color-gray2;
        border: 1px solid transparent;
        border-bottom: 1px solid globals.$color-gray30;
        &:before {
            content: "";
            position: absolute;
            width: 0;
            height: 0;
            top: 18px;
            right: calc(100% - 23px);
            border: 6px solid transparent;
            border-top-color: #a6a6a6;
            z-index: 2;
            pointer-events: none;
            user-select: none;
        }
        &:hover {
            height: 100%;
            z-index: 200;
            background-color: globals.$color-white;
            box-shadow: 0 0 8px rgb(0 0 0 / 20%);
            border: 1px solid functions.tint(globals.$color-black, 80%);
            padding: 0 3px;
            &:before {
                display: none;
            }
        }
        & > button {
            text-align: right;
        }
    }
}
</style>