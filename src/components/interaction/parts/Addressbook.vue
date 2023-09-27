<template>
    <header :class="['header-bar', {'header-bar--wide' : getFrameClass().indexOf('LM') !== -1}]" data-e2e="address-book">
        <div class="grid__row">
            <div class="grid-unit__alpha vspace">
                <SearchField
                    :placeholder="store.state.settings.searchtext"
                    @oninput="filterList"
                />
            </div>
        </div>
        <div class="grid__row">
            <div class="grid-unit__epsilon">
                <IconToggleButton v-model:status="leftToggleStatus" :icon-on="ViewAgenda" :icon-off="ViewSequential" class="toggle__btn" @click="toggleMinMax" />
            </div>
            <div class="grid-unit__delta--tripple vspace hspace">
                <CsSelectField :options="contactFilters" v-model:selectedValue="currentFilter" />
            </div>
            <div class="grid-unit__epsilon">
                <IconToggleButton :icon-on="AccountPlus" :icon-off="AccountPlus" class="add-contact__btn" data-e2e="address-book-addcontact-btn" @click="addContact" />
            </div>
        </div>
    </header>
    <VirtualListViewer :class="['contact-wrapper', {'contact-wrapper--wide' : getFrameClass().indexOf('LM') !== -1}]" :data="displayList" rowClasses="contact-card-wrapper" :contentWrapperClass="contentWrapperClass">
        <template v-slot="{ row }">
            <div :class="['contact-card', {'contact-card--nopointer' : (row.Id == -1 || row.IsMe)}]" :key="row.Id" data-e2e="address-book-opencard-btn" @click="openCard(row)">
                <div class="contact-card__infix-cell" data-e2e="address-book-icon-initials">
                    <div class="contact-card__infix-icon" :style="row.sn ? 'background-color:rgb(252, 219, 169);color:rgb(243, 146, 0);' : ''" >{{ row.initials }}</div>
                    <div v-if="!row.sn && row.StatusId > -1" class="contact-card__infix-status" :style="`background-color:#${row.Status.Color}`" ></div>
                </div>
                <div :class="['contact-card__name-cell', {'contact-card__name-cell--mod' : row.StatusText === ''}]" data-e2e="address-book-fullname">{{ row.fullName }}</div>
                <div v-if="!row.sn" class="contact-card__department-cell" data-e2e="address-book-department">{{ row.Department }}</div>
                <div v-if="row.StatusId > -1" class="contact-card__status-cell" :style="`color:#${row.Status.Color}`" data-e2e="address-book-statuslabel">{{ row.statusLabel }}</div>
                <div v-if="row.sn" class="contact-card__status-cell" data-e2e="address-book-sndescription">{{ row.Description }}</div>
                <div v-if="row.sn" class="contact-card__status-cell" data-e2e="address-book-number">{{ row.ActiveNumber }}</div>
                <div v-show="row.StatusText !== ''" :title="row.StatusText" class="contact-card__message-cell span-2" data-e2e="address-book-statustext">&quot;{{ row.StatusText }}&quot;</div>
                <div class="contact-card__btn-cell">
                    <button v-if="!row.sn && row.IsContact == 0" type="button" :class="['contactButton', {'contactButton--hidden' : row.sn}]" :disabled="!row.mayChat" @click="chatInternal(row.UserId, $event)" data-e2e="btn-chat-internal"><message /></button>
                    <button v-if="row.sn" type="button" class="contactButton" :disabled="!store.state.commands.TransferISN" @click="coldTransferServiceNr($event, row.stripedNumber)" data-e2e="btn-cold-transfer"><redo /></button>
                    <button v-if="row.IsContact == 0" type="button" class="contactButton" :disabled="!row.isActiveNumber && !row.sn" @click="callNumber($event, row.stripedNumber, row.Id, row.StatusId)" data-e2e="btn-call-number"><phone /></button>
                    <button v-if="!row.sn && row.IsContact == 1" type="button" class="contactButton" :disabled="!row.isActiveNumber" @click="callContactNumber($event, row.Addresses, row.Id)" data-e2e="btn-call-number"><phone /></button>
                </div>
            </div>
        </template>
    </VirtualListViewer>
</template>

<script lang="ts">

/**
 *
 * @fixes
 * Temp fix: backwardscompattibility issue for vue2/vue3 transition (filter vue2 is [0, 1, 2, 3] filter vue3 = contactFilters.value),
 * Remove this fix when vue3 is used by everyone
 *
 * contactUpdate doesn't come with "IsMe","IsColleague","IsContact","IsOnline","InMyDepartment" this is added in contact.js and in contactUpdate
 *
 */

import { useStore }                 from 'vuex';
import { IPCCCCallControl }         from '../../../ipccc/js/callcontrol.js';
import { IPCCCUserSettings }        from '../../../ipccc/js/usersettings.js';
import { IPCCCContacts }            from '../../../ipccc/js/contacts.js'
import {
        onMounted,
        onBeforeMount,
        ref,
        inject,
        watch,
        defineComponent
        }                            from 'vue';

import { dynamicSortMultipleProps } from '../../../use/sortFunctions';
import RadioGroup                   from '../../uielements/RadioGroup.vue';
import CsSelectField                from '../../uielements/CSSelectField.vue';
import SearchField                  from '../../uielements/SearchField.vue';
import IconToggleButton             from '../../uielements/IconToggleButton.vue';
import { generateQuickGuid }        from '../../../use/guid';
import { filterListOfObjects }      from '../../../use/searchAndFilter';
import VirtualListViewer            from '../../uielements/VirtualListViewer.vue';
import {
        AccountPlus,
        ViewAgenda,
        ViewSequential,
        Message,
        Phone,
        Redo
        }                           from "mdue";
import { cancelEvent }              from '../../../use/helperFunctions';
import Contact                      from "../../../types/Contacts";
import { currentLocalDateTimeISO }  from '../../../use/dateFunctions';

export default defineComponent({
    name: 'AddressBook',
    inheritAttrs: false,
    components: {
        RadioGroup,
        SearchField,
        IconToggleButton,
        AccountPlus,
        CsSelectField,
        VirtualListViewer,
        ViewAgenda,
        ViewSequential,
        Message,
        Phone,
        Redo
    },
    props: {
        tabprops : {
            type    : Object,
            default : {}
        },
        isactive : {
            type    : Boolean,
            default : false
        }
    },
    setup(props) {
        const store:object | any                = useStore(),
                toggleLoader:Function           = inject('toggleLoader'),
                callOut:Function                = inject('callOut'),
                contactFilters                  = ref([]),
                contactList                     = ref([]),
                displayList                     = ref([]),
                currentFilter                   = ref('All'),
                searchString                    = ref(''),
                guid                            = ref(generateQuickGuid()),
                getFrameClass:Function          = inject('getFrameClass'),
                contentWrapperClass             = ref('contact-list-wrapper'),
                leftToggleStatus                = ref(false),
                setActiveBaseComponent:Function = inject('setActiveBaseComponent');

        const searchProps:string[] = ['fullName', 'CompanyName', 'Department', 'Description', 'ActiveNumber', 'statusLabel', 'StatusText'];

        enum ContactStatusIdentifiers
        {
            Deleted = -99,
        }

        enum ContactPhoneType
        {
            Fixed = 1,
            Mobile = 2,
            ServiceNumber = 3
        }

        const enrichOneContact = (contact) => {
            let _sn      = contact.Addresses && contact.Addresses.length === 1 && contact.Addresses[0].PhoneType === ContactPhoneType.ServiceNumber;
            let _mayChat = store.getters.getPermission('InterneChat');
            return {...contact,
                sn                  : _sn,
                SortEntryType       : _sn ? 1 : 2,
                SortStatus          : _sn ? 99999 : contact.StatusId > 1 ? 77777 : 88888,
                SortName            : contact.LastName.toLowerCase(),
                fullName            : contact.InFix !== '' ? `${contact.FirstName} ${contact.InFix} ${contact.LastName}` : `${contact.FirstName} ${contact.LastName}`,
                statusLabel         : contact.Status?.Label,
                initials            : _sn ? 'SN' : contact.FirstName.charAt(0).toUpperCase() + contact.LastName.charAt(0).toUpperCase(),
                stripedNumber       : contact.ActiveNumber?.indexOf('@') ? contact.ActiveNumber.split('@')[0] : contact.ActiveNumber,
                mayChat             : _mayChat && !_sn && !contact.IsMe && contact.StatusId != -1 && contact.UserId != -1 && contact.StatusId != 6,
                isActiveNumber      : (
                                        contact.StatusId > -1 && contact.ActiveNumber !== '' && !contact.IsMe && contact.StatusId !== 4
                                    ) || (
                                        contact.IsContact == 1 && contact.Addresses.length > 0 && contact.Addresses[0].Number !== '' && contact.StatusId !== -99
                                    )
            }
        };

        const enrichContactList = (list) => {
            return list.map((c, i:number):void => enrichOneContact(c));
        }

        const getContacts = () => {
            IPCCCContacts.ContactListV2()
                .then((contactlist) => {
                contactList.value       = enrichContactList(contactlist);
                contactList.value.sort(dynamicSortMultipleProps('SortEntryType', 'SortStatus', 'SortName'));

                IPCCCUserSettings.Get('AddressBookFilters').then((result):void => {
                    result.forEach(setting => {
                        if(setting.Name === 'FilterIndex' && setting.Data.length > 1)
                            currentFilter.value = setting.Data;
                        if(setting.Name === 'CardSize') {
                            leftToggleStatus.value = setting.Data === "true";
                            contentWrapperClass.value = leftToggleStatus.value ? 'contact-list-wrapper contact-list-wrapper--mini' : 'contact-list-wrapper';
                        }
                    });
                    filterList(searchString.value);
                });
            })
            .catch(error => {
                console.error(error);
            });
        };

        const contactUpdate = updatedContact => {
            let contactMutatedIndex = contactList.value.findIndex(c => c.Id === updatedContact.Id);

            if(contactMutatedIndex > -1) {
                if(updatedContact.Status.StatusId == ContactStatusIdentifiers.Deleted) {
                    contactList.value.splice(contactMutatedIndex, 1);
                } else {
                    //Contact or SN
                    if(updatedContact.UserId == -1) {
                        for(var p in updatedContact) contactList.value[contactMutatedIndex][p] = updatedContact[p];
                        contactList.value[contactMutatedIndex] = enrichOneContact(contactList.value[contactMutatedIndex]);
                    }
                    //User
                    else {
                        //IsOnline is not updated (only relevant for users) derive and update from StatusId
                        contactList.value[contactMutatedIndex].IsOnline = updatedContact.StatusId > -1 ? 1 : 0;
                        contactList.value[contactMutatedIndex].Status = {...updatedContact.Status}
                        contactList.value[contactMutatedIndex].StatusId   = updatedContact.StatusId;
                        contactList.value[contactMutatedIndex].StatusText = updatedContact.StatusText;
                        contactList.value[contactMutatedIndex].ActiveNumber = updatedContact.ActiveNumber;
                        contactList.value[contactMutatedIndex].Addresses = updatedContact.Addresses;
                        contactList.value[contactMutatedIndex].CanChat = updatedContact.CanChat;

                        contactList.value[contactMutatedIndex] = enrichOneContact(contactList.value[contactMutatedIndex]);

                        contactList.value.sort(dynamicSortMultipleProps('SortEntryType', 'SortStatus', 'SortName'));

                        filterList(searchString.value);
                    }
                }
                filterList(searchString.value);
            }
            else if (contactMutatedIndex == -1 && updatedContact.Id > -1) {
                //push new Contact if updatedContact is unknown
                if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] new Contact is pushed into the contactlist: ', updatedContact);

                let _contactType = updatedContact.UserId > -1 ? 'user' : 'contact',
                    _newContact = new Contact(_contactType);

                _newContact.CompanyName = updatedContact.CompanyName;
                _newContact.Id = updatedContact.Id;
                _newContact.Department = updatedContact.Department;
                _newContact.FirstName = updatedContact.FirstName;
                _newContact.InFix = updatedContact.InFix;
                _newContact.LastName = updatedContact.LastName;
                _newContact.Description = updatedContact.Description;
                _newContact.Addresses = updatedContact.Addresses;

                contactList.value.push(enrichOneContact(_newContact));

                contactList.value.sort(dynamicSortMultipleProps('SortEntryType', 'SortStatus', 'SortName'));

                filterList(searchString.value);
            }
            else {
                console.error("UpdatedContact coudn't be proccesed: ", updatedContact);
            }

            if (store.getters.getSelectedContact() && store.getters.getSelectedContact().Id == updatedContact.Id) {
                selectedContactUpdateState(updatedContact);
            }
        }

        const selectedContactUpdateState = (updatedContact) => {
            store.commit(
                'SET_SELECTED_CONTACT',
                {
                    'contact': updatedContact,
                    'leftlanemaxonopencontact' : store.getters.getLeftLaneMaxOnOpenContact
                }
            );
        }

        /* START HANDELING EVENTS */

        const chatInternal = (userid: string, e: MouseEvent):void => {
            e.stopPropagation(); // stop opening the contact card
            store.commit('SET_NEW_CHAT_WINDOW', userid);
        };

        const openCard = (contact):void => {
            if(contact.Id !== -1 && !contact.IsMe) { //exclude sn and self
                let _leftLaneMaxOnOpenContact = getFrameClass().indexOf('LM') !== -1;
                store.commit(
                    'SET_SELECTED_CONTACT',
                    {
                        'contact': contact,
                        'leftlanemaxonopencontact' : _leftLaneMaxOnOpenContact
                    }
                );
                setActiveBaseComponent(2); // 2 = contactdetail
            }
        };

        const callNumber = (evt:Event, phoneNumber:number, contactid:number, statusid:number):void => {
            cancelEvent(evt);
            if(store.state.commands.Callout && statusid !== 4) {
                callOut(phoneNumber, contactid);
            }
        };

        const callContactNumber = (evt:Event, addresses:{Number:string}[], contactid:number):void => {
            cancelEvent(evt);
            if (store.state.commands.Callout && addresses.length > 0 && addresses[0].Number !== '') {
                callOut(addresses[0].Number, contactid);
            }
        };

        const coldTransferServiceNr = (evt:Event, phoneNumber:Number):void => {
                cancelEvent(evt);
                if(store.state.commands.TransferISN) {
                    IPCCCCallControl.ColdTransfer(`*24*${phoneNumber}#`)
                    .catch(error => console.error(error));
                }
        };

        const addContact = () => {
            let _leftLaneMaxOnOpenContact = getFrameClass().indexOf('LM') !== -1;
            store.commit('SET_SELECTED_CONTACT',
                {
                    'contact' : {Id : -1},
                    'leftlanemaxonopencontact' : _leftLaneMaxOnOpenContact
                }
            );
            setActiveBaseComponent(2); //contactdetail
        }

        const toggleMinMax = () => {
            leftToggleStatus.value    = contentWrapperClass.value.indexOf('mini') === -1;
            IPCCCUserSettings.Save('AddressBookFilters', 'CardSize', leftToggleStatus.value)
            .catch(error => console.error('CardSize not saved'));
            contentWrapperClass.value = leftToggleStatus.value ? 'contact-list-wrapper contact-list-wrapper--mini' : 'contact-list-wrapper';
        }

        /* END HANDELING EVENTS*/

        const filterList = (searchStr:string):void => {
            searchString.value = searchStr;
            if(currentFilter.value != 'All') {
                let _displayList  = filterListOfObjects('1', contactList.value, [currentFilter.value]);
                displayList.value = filterListOfObjects(searchString.value, _displayList, searchProps);
            } else {
                displayList.value = filterListOfObjects(searchString.value, contactList.value, searchProps);
            }
        };

        watch(store.getters.getDeletedContactId, (deleteId, previousId: number) => {
            if (previousId !== -1) return;
            const ix = contactList.value.findIndex(c => c.Id === deleteId);
            if (ix > -1) {
                contactList.value.splice(ix, 1);
                filterList(searchString.value);
            }
            store.commit('SET_DELETED_CONTACT', -1);
        });

        watch(currentFilter, (newValue, oldValue) => {
            if(newValue != oldValue) {
            IPCCCUserSettings.Save('AddressBookFilters', 'FilterIndex', newValue)
            .then(() => filterList(searchString.value))
            .catch(error => console.error('Error: ', error));
            }
        });

        /* HOOKS */

        onBeforeMount(() => {
            IPCCCContacts.Update.addHandler(contactUpdate);

            contactFilters.value = [
            // {
            //   label : store.state.browserLanguage === 'en' ? 'Favorites' : 'Favorieten',
            //   value : 'favorites'
            // }, {
            {
                label : store.state.browserLanguage === 'en' ? 'All' : 'Alles',
                value : 'All'
            }, {
                label : store.state.browserLanguage === 'en' ? 'My department' : 'Mijn afdeling',
                value : 'InMyDepartment'
            }, {
                label : store.state.browserLanguage === 'en' ? 'Colleagues' : 'Collega\'s',
                value : 'IsColleague'
            }, {
                label : store.state.browserLanguage === 'en' ? 'Contacts' : 'Contacten',
                value : 'IsContact'
            }, {
                label : store.state.browserLanguage === 'en' ? 'Online' : 'Online',
                value : 'IsOnline'
            }
            ];
        });

        watch(() => props.isactive, (newVal, oldVal) => {
            toggleLoader(false);
        });

        //   const firstContactId = ref(<number>null);
        //   const findFirstContactId = ():number => {
        //     let _contact = contactList.value.find(el => !el.sn);
        //     return _contact == 'undefined' ? null : _contact.Id;
        //   }

        onMounted(() => {
            // console.log('Addressbook mounted');
            getContacts();
            toggleLoader(false);
        });


        return {
            store, guid, getFrameClass, contentWrapperClass,
            displayList, contactFilters, currentFilter, filterList,
            AccountPlus, addContact,
            ViewAgenda, ViewSequential,
            leftToggleStatus, toggleMinMax,
            chatInternal, callNumber, callContactNumber, coldTransferServiceNr, openCard
        }
    }
});

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .contact-wrapper {
    position: relative;
    padding: 0;
    background-color: globals.$color-gray5;
    height: calc(100% - 110px);
    overflow-x: hidden;
    overflow-y: scroll;
    transition: height .2s ease-in-out;
    &--wide {
      height: calc(100% - 60px);
    }
  }

  .header-bar {
    position: relative;
    height: 110px;
    z-index: 10;
    border-bottom: 1px solid globals.$color-gray10;
    transition: height .2s ease-in-out;
    overflow: hidden;
    &--wide {
      height: 60px;
    }
  }

  .contact-card {
    display: grid;
    grid-template-columns: 70px 1fr 80px;
    grid-template-rows: 18px 18px 18px 18px;
    padding: 6px 0 8px 0;
    height: 80px;
    width: 328px;
    margin: 5px;
    background-color: globals.$color-white;
    border-radius: 3px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, .1);
    cursor: pointer;
    .span-2 {
        grid-column: span 2;
    }
    &--nopointer {
      cursor: default;
    }
  }

  .contact-card__infix-cell,
  .contact-card__name-cell,
  .contact-card__department-cell,
  .contact-card__status-cell,
  .contact-card__message-cell {
    @include font.font-medium();
    overflow-y: visible;
    overflow-x: clip;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: .8em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    //border: 1px solid #C00;
  }

  .contact-card__infix-cell {
    position: relative;
    grid-row-start: 1;
    grid-row-end: span 4;
  }

  .contact-card__infix-icon {
    position: relative;
    margin: 5px 0 0 8px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    border-radius: 50%;
    text-align: center;
    font-size: 1.8em;
    @include font.font-menu();
    color: globals.$color-white;
    background-color: globals.$color-gray30;
  }

  .contact-card__infix-status {
    position: absolute;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    right: 8px;
    bottom: 22px;
    border: 2px solid globals.$color-white;
    z-index: 10;
  }

  .contact-card__name-cell {
    grid-column-start: 2;
    height: 20px;
    padding-top: 3px;
  }

  .contact-card__department-cell {
    font-size: .7rem;
    line-height: 1.8em;
    opacity: .8;
  }

  .contact-card__status-cell {
    @include font.font-medium();
    font-size: .7rem;
    line-height: 1.5em;
    opacity: .8;
  }

  .contact-card__message-cell {
    font-style: italic;
    font-size: 0.7rem;
    line-height: 1em;
    opacity: .6;
  }

  .contact-card__btn-cell {
    grid-column-start: 3;
    grid-row-start: 1;
    grid-row-end: span 3;

    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-end;
    align-items: center;
  }

  .contact-card--mini {
    grid-template-columns: 70px 1fr 80px;
    grid-template-rows: 18px;
    .contact-card__department-cell,
    .contact-card__status-cell  {
      display: none;
    }
  }

  .grid__row {
    float: left;
    width: 100%;
    max-width: 360px;
    padding: 0 5px;
  };

  [class^='grid-unit'] {
    float: left;
    padding: 0 3px;
  }

  .grid-unit__alpha {
    width: 100%;
    transition: padding .2s ease-in-out;
  }

  .grid-unit__beta {
    width: 50%;
  }

  .grid-unit__gamma {
    width: 33.333%;
    &--double {
      width: 66.666%;
    }
  }

  .grid-unit__delta {
    width: 25%;
    &--tripple {
      width: 75%;
    }
  }

  .grid-unit__epsilon {
    width: 12.5%;
  }

  .vspace {
    padding-top: 10px;
  }

  .hspace {
    padding-left: 10px;
    padding-right: 10px;
  }

  .contactButton {
    width: 30px;
    height: 30px;
    background-color: transparent;
    cursor: pointer;
    svg {
      width: 18px;
      height: 18px;
      margin: 50% 0 0 50%;
      transform: translate(-50%, -50%);
      fill: globals.$color-gray60;
    }
    &:hover {
      svg {
        fill: globals.$color-interaction;
      }
    }
    &:disabled {
      cursor: default;
      svg {
        fill: globals.$color-gray10;
      }
    }
    &--hidden {
      visibility: hidden;
    }
  }

</style>

<style lang="scss">

  @use "@/scss/includes/font";
  @use "@/scss/includes/globals";

  .radio-group--modified {
    top: 40px !important;
    height: 40px !important;
    overflow: hidden;
    label {
      @include font.font-menu();
      font-size: .8em !important;
      svg {
        fill: globals.$color-interaction !important;
      }
    }
  }

  .add-contact__btn {
    margin: 10px 5px 0 0;
    float: right;
    svg {
      fill: globals.$color-interaction;
    }
  }

  .toggle__btn {
    margin: 10px 5px 0 0;
    background-color: globals.$color-gray5;
    border-radius: 5px;
    svg {
      fill: globals.$color-gray40;
    }
  }

  .contact-list-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
  }

  .contact-list-wrapper--mini .contact-card {
    grid-template-rows: 18px 18px;
    grid-template-columns: 50px 1fr 80px;
    height: 40px;
    padding: 0;
    margin: 2px;
    .contact-card__department-cell,
    .contact-card__status-cell {
      display: none;
    }
    .contact-card__name-cell {
      @include font.font-medium();
      padding-top: 4px;
      font-size: .75em;
    }
    .contact-card__message-cell {
      padding-top: 4px;
      font-size: .75em;
    }
    .contact-card__infix-icon {
      width: 32px;
      height: 32px;
      line-height: 32px;
      font-size: 1.25em;
    }
    .contact-card__infix-status {
      width: 12px;
      height: 12px;
      right: 6px;
      bottom: 2px;
    }
  }

  .contact-list-wrapper--mini .contact-card {
    .contact-card__name-cell--mod {
      @include font.font-medium();
      padding-top: 0;
      margin-top: 13px;
    }
    .contact-card__btn-cell {
      align-content: center;
    }
  }
</style>