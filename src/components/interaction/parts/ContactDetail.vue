<template>
    <div class="contact-detail-wrapper" data-e2e="contact-detail">
        <div :class="['contact-wrapper', {'contact-wrapper--active' : isactive}]">
            <div class="detailscreen-wrapper detailscreen-wrapper--visable">
                <!-- DISPLAY -->
                <button v-if="showDetailScreen && !editMode" type="button" class="detailscreen-wrapper__closebtn" @click="closeContact()">
                    <Close class="detailscreen-wrapper__closebtn__icon" />
                </button>
                <div v-if="showDetailScreen && !editMode" class="detailscreen">
                    <a v-if="hasPermissionToManageContact && !editMode" class="button__icon button__icon--top-right-corner" @click="editContact()">&#xF3EB;</a>
                    <div class="grid-row">
                        <div class="grid-unit--beta">
                            <div class="detailscreen-wrapper__title contactdetail-wrapper__title">
                                <div class="detailscreen__title-status-icon contactdetail__title-status-icon">
                                    <div class="detailscreen__title-status-dot contactdetail__title-status-dot" :style="dotStatusColor(contactProps.Status.Color)"></div>
                                    <span class="detailscreen__title-status-init contactdetail__title-status-init">{{ getInitials(contactData.fullName) }}</span>
                                </div>
                                <div class="detailscreen__title">
                                    <span class="fullname">{{ contactData.fullName }}</span>
                                    <span class="company">{{ contactData.Company }}</span>
                                    <span v-if="contactData.CanDelete" class="department">{{ contactData.Department }}</span>
                                    <span v-else class="department">{{ contactProps.Department }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="grid-unit--beta">
                            <div class="contactdetail-menu">
                                <!-- <span :class="['contactdetail__interaction-btn', {'contactdetail__interaction-btn--disabled' : !hasChat(contactProps)}]" @click="chatInternal(contactProps.UserId)">&#xF361;</span>
                                <span :class="['contactdetail__interaction-btn', {'contactdetail__interaction-btn--disabled' : contactProps.ActiveNumber == ''}]" @click="callNumber($event, stripSip(contactProps.ActiveNumber), contactProps.Id, contactProps.StatusId)">&#xF3F2;</span> -->
                                <button v-if="isMassxess" :class="['contactdetail-menu__btn', {'contactdetail-menu__btn--message' : contactData.usesMobilePhone }]" @click="showSms(true)">
                                    <div class="contactdetail-menu__btn__circle"><Message /></div>
                                    <div class="contactdetail-menu__btn__caption">{{ store.state.settings.contacts.iconcaptionlbl[0] }}</div>
                                </button>
                                <button :class="['contactdetail-menu__btn', {'contactdetail-menu__btn--phone' : !store.state.commands.Hangup}]" @click="callNumber($event, stripSip(contactProps.ActiveNumber), contactProps.Id, contactProps.StatusId)">
                                    <div class="contactdetail-menu__btn__circle"><Phone /></div>
                                    <div class="contactdetail-menu__btn__caption">{{ store.state.settings.contacts.iconcaptionlbl[1] }}</div>
                                </button>
                                <button :class="['contactdetail-menu__btn', {'contactdetail-menu__btn--email' : contactData.EmailAddresses.length > 0}]" @click="mailTo()">
                                    <div class="contactdetail-menu__btn__circle"><Email /></div>
                                    <div class="contactdetail-menu__btn__caption">{{ store.state.settings.contacts.iconcaptionlbl[2] }}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabelnumbers }}</h2>
                    </div>
                    <div class="grid-row">
                        <div v-for="number in contactData.Addresses" :key="number.Id" :class="['contactdetail__line contactdetail__line-numbers',{'contactdetail__line-numbers--disabled' : isActiveNumber(number.Number) && contactProps.IsMe}]" @click="callNumber($event, stripSip(number.Number), contactProps.Id, contactProps.StatusId)">
                            <div :class="['grid-unit--gamma', {'activenr' : isActiveNumber(number.Number)}]">{{ number.Label }}</div>
                            <div :class="['grid-unit--gamma--double', {'activenr' : isActiveNumber(number.Number)}]">{{ number.Number }}</div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabelemail }}</h2>
                    </div>
                    <div class="grid-row">
                        <div v-for="email in contactData.EmailAddresses" :key="email.Id" class="contactdetail__line">
                            <div class="grid-unit--gamma">{{ email.Label }}</div>
                            <div class="grid-unit--gamma--double">{{ email.EmailAddress }}</div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabeladdress }}</h2>
                    </div>
                    <div class="grid-row">
                        <div v-for="streetaddress in contactData.StreetAddresses" :key="streetaddress.Id" class="contactdetail__line">
                            <div class="grid-unit--gamma">{{ store.state.settings.contacts.setlabeladdress }}</div>
                            <div class="grid-unit--gamma--double">
                                <div>{{ streetaddress.Street }} {{ streetaddress.HouseNumber }} {{ streetaddress.HouseNumberAddition }}</div>
                                <div>{{ streetaddress.Zipcode }}, {{ streetaddress.City }}</div>
                                <div>{{ streetaddress.Country }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabelother }}</h2>
                    </div>
                    <div class="grid-row">
                        <div v-if="contactData.Description != ''" class="contactdetail__line contactdetail__line-other">
                            <div class="grid-unit--gamma">{{ store.state.settings.contacts.notelbl }}</div>
                            <div class="grid-unit--gamma--double">{{ contactData.Description }}</div>
                        </div>
                    </div>
                    <div class="detailscreen-footer detailscreen-footer--inside">
                        <div class="grid-unit--alpha">
                            <span class="grid--push">
                                <a class="button-primary button-primary--gray" @click="closeContact()">{{ store.state.settings.contacts.cancellbl }}</a>
                            </span>
                        </div>
                    </div>
                </div>
                <!-- EDIT -->
                <div v-if="editMode" class="detailscreen">
                    <form @valid="saveContact()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn--contactdetail'}" >
                        <div class="grid-row">
                            <div v-if="contactData.Id == -1" class="grid-unit--alpha">
                                <span class="detailscreen__title">{{ store.state.settings.contacts.detailheadernew }}</span>
                            </div>
                            <div v-else>
                                <div class="grid-unit--gamma--double">
                                    <span class="detailscreen__title">{{ composeName(contactData.FirstName, contactData.Infix, contactData.LastName) }}</span>
                                </div>
                                <div class="grid-unit--gamma">
                                    <span class="detailscreen__title detailscreen__title--right detailscreen__title--small" v-show="contactData.CanDelete">#{{ contactData.Id }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="grid-row">
                            <div class="grid-unit--gamma">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" name="contact-firstname" id="contact-firstname" :readonly="!contactData.CanDelete" v-model="contactData.FirstName" :data-validate="'isNotEmpty'" :data-message="store.state.settings.forms.messagefirstname" :placeholder="store.state.settings.contacts.firstnamelbl">
                                    <label for="contact-firstname" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.firstnamelbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--gamma">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" name="contact-infix" id="contact-infix" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.infixlbl" v-model="contactData.Infix">
                                    <label for="contact-infix" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.infixlbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--gamma">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" name="contact-lastname" id="contact-lastname" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.lastnamelbl" v-model="contactData.LastName" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.forms.messagelastname">
                                    <label for="contact-lastname" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.lastnamelbl }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="grid-row">
                            <div class="grid-unit--beta grid-unit--beta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" name="contact-company" id="contact-company" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.companylbl" v-model="contactData.Company" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.forms.messagecompany">
                                    <label for="contact-company" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.companylbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground">
                                    <input v-if="contactData.CanDelete" type="text" name="contact-department" id="contact-department" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.departmentlbl" v-model="contactData.Department" :data-message="store.state.settings.forms.messagedepartment">
                                    <input v-else type="text" name="contact-department" id="contact-department" readonly :placeholder="store.state.settings.contacts.departmentlbl" :value="contactProps.Department">
                                    <label for="contact-department" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.departmentlbl }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="grid-row">
                            <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabelnumbers }}<button type="button" v-if="contactData.CanDelete" class="list-number-header__button--add" @click="addNumber()">{{ store.state.settings.contacts.addlbl }}</button></h2>
                            <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ store.state.settings.contacts.helptextnumbers }}</div>
                        </div>
                        <div v-if="contactData.Addresses && contactData.Addresses.length == 0" class="grid-row">
                            <div class="grid-unit--alpha">
                                <p class="note">{{ store.state.settings.contacts.geenlbl }}</p>
                            </div>
                        </div>
                        <div v-for="(number, index) in contactData.Addresses" :key="index" class="grid-row grid-row--repeater">
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" :name="'contact-label_'+index" :id="'contact-label_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.numberlabellbl" v-model="number.Label" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messagenumberlbl">
                                    <label :for="'contact-label_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.numberlabellbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground form-textfield--hasdelete">
                                    <input type="text" :name="'contact-number_'+index" :id="'contact-number_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.numberlbl" v-model="number.Number" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messagenumber">
                                    <label :for="'contact-number_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.numberlbl }}</label>
                                    <button type="button" v-if="contactData.CanDelete" @click="removeItem('Addresses', index)">&#xF1C0;</button>
                                </div>
                            </div>
                        </div>

                        <div class="grid-row">
                            <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabelemail }}<button type="button" v-if="contactData.CanDelete" class="list-number-header__button--add" @click="addEmail()">{{ store.state.settings.contacts.addlbl }}</button></h2>
                            <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ store.state.settings.contacts.helptextemail }}</div>
                        </div>
                        <div v-if="contactData.EmailAddresses && contactData.EmailAddresses.length == 0" class="grid-row">
                            <div class="grid-unit--alpha">
                                <p class="note">{{ store.state.settings.contacts.geenlbl }}</p>
                            </div>
                        </div>
                        <div v-for="(email, index) in contactData.EmailAddresses" :key="index" class="grid-row grid-row--repeater">
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" :name="'contact-elabel_'+index" :id="'contact-elabel_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.emaillabellbl" v-model="email.Label" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messageemaillbl">
                                    <label :for="'contact-elabel_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.emaillabellbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground form-textfield--hasdelete">
                                    <input type="text" :name="'contact-email_'+index" :id="'contact-email_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.emaillbl" v-model="email.EmailAddress" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messageemail">
                                    <label :for="'contact-email_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.emaillbl }}</label>
                                    <button type="button" v-if="contactData.CanDelete" @click="removeItem('EmailAddresses', index)">&#xF1C0;</button>
                                </div>
                            </div>
                        </div>

                        <div class="grid-row">
                            <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabeladdress }}<button v-if="contactData.StreetAddresses && contactData.StreetAddresses.length == 0 && contactData.CanDelete" type="button" class="list-number-header__button--add" @click="addAddress()">{{ store.state.settings.contacts.addlbl }}</button></h2>
                            <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ store.state.settings.contacts.helptextaddress }}</div>
                        </div>
                        <div v-if="contactData.StreetAddresses && contactData.StreetAddresses.length == 0" class="grid-row">
                            <div class="grid-unit--alpha">
                                <p class="note">{{ store.state.settings.contacts.geenlbl }}</p>
                            </div>
                        </div>
                        <div v-for="(streetaddress, index) in contactData.StreetAddresses" :key="index" class="grid-row grid-row--repeater">
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" :name="'contact-slabel_'+index" :id="'contact-slabel_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.streetlabellbl" v-model="streetaddress.Label" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messageestreetlbl">
                                    <label :for="'contact-slabel_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.streetlabellbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground form-textfield--hasdelete">
                                    <input type="text" :name="'contact-street_'+index" :id="'contact-street_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.streetlbl" v-model="streetaddress.Street" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messageestreet">
                                    <label :for="'contact-street_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.streetlbl }}</label>
                                    <button type="button"  v-if="contactData.CanDelete" @click="removeAddress(index)">&#xF1C0;</button>
                                </div>
                            </div>
                            <div class="clear"></div>
                            <div class="grid-unit--delta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" :name="'contact-hsnr_'+index" :id="'contact-hsnr_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.hsnrlbl" v-model="streetaddress.HouseNumber" :data-validate="setValidation('isNotEmpty')" :data-message="store.state.settings.contacts.messageehsnr">
                                    <label :for="'contact-hsnr_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.hsnrlbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--delta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" :name="'contact-hsnra_'+index" :id="'contact-hsnra_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.hsnralbl" v-model="streetaddress.HouseNumberAddition">
                                    <label :for="'contact-hsnra_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.hsnralbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground form-textfield">
                                    <input type="text" :name="'contact-zipcode_'+index" :id="'contact-zipcode_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.zipcodelbl" v-model="streetaddress.Zipcode">
                                    <label :for="'contact-zipcode_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.zipcodelbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground form-textfield">
                                    <input type="text" :name="'contact-city_'+index" :id="'contact-city_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.citylbl" v-model="streetaddress.City">
                                    <label :for="'contact-city_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.citylbl }}</label>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <div class="form-textfield form-textfield--bground">
                                    <input type="text" :name="'contact-country_'+index" :id="'contact-country_'+index" :readonly="!contactData.CanDelete" :placeholder="store.state.settings.contacts.countrylbl" v-model="streetaddress.Country">
                                    <label :for="'contact-country_'+index" class="form-label form-label--hidden form-label--lowered">{{ store.state.settings.contacts.countrylbl }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="grid-row">
                            <h2 class="detailscreen__fieldsetheader">{{ store.state.settings.contacts.setlabelother }}</h2>
                        </div>
                        <div class="grid-row">
                            <div class="grid-unit--beta">
                                <div class="form-textarea form-textarea--description form-textarea--note">
                                    <label>{{ store.state.settings.contacts.notelbl }}</label>
                                    <textarea v-model="contactData.Description" maxlength="1000"></textarea>
                                    <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ store.state.settings.contacts.helptextnote }}</div>
                                </div>
                            </div>
                            <div class="grid-unit--beta">
                                <label class="form-label form-label--list-inline">{{ store.state.settings.contacts.availabiltylbltop }}</label>
                                <div v-if="contactData.Id == -1 || contactData.CanDelete" class="form-radio-small form-radio-small--inline">
                                    <input type="radio" id="radio_one" :disabled="!contactData.CanDelete" :value="TYPEOFCONTACT.personal" v-model="contactData.TypeOfContact">
                                    <label for="radio_one">{{ store.state.settings.contacts.availabiltylbl[0] }}</label>
                                </div>
                                <div class="form-radio-small form-radio-small--inline">
                                    <input type="radio" id="radio_two" :disabled="!contactData.CanDelete" :value="TYPEOFCONTACT.department" v-model="contactData.TypeOfContact">
                                    <label for="radio_two">{{ store.state.settings.contacts.availabiltylbl[1] }}</label>
                                </div>
                                <div class="form-radio-small form-radio-small--inline">
                                    <input type="radio" id="radio_three" :disabled="!contactData.CanDelete || !canAddCompanyContacten" :value="TYPEOFCONTACT.all" v-model="contactData.TypeOfContact">
                                    <label for="radio_three">{{ store.state.settings.contacts.availabiltylbl[2] }}</label>
                                </div>
                                <div class="spacer__top--8"></div>
                                <div :class="['typo-helptext', {'typo-helptext--active' : showHelp}]">{{ store.state.settings.contacts.helptextavailabilty }}</div>
                            </div>
                        </div>
                    </form>
                    <div class="detailscreen-footer detailscreen-footer--inside">
                        <div class="grid-unit--alpha">
                            <span>
                                <a v-if="contactData.Id !== -1 && contactData.CanDelete" class="button-primary button-primary--delete" @click="showConfirm(contactData.Id)">{{ store.state.settings.contacts.deletecontactlbl }}</a>
                            </span>
                            <span class="grid--push">
                                <a class="button-primary button-primary--gray" @click="cancelEdit()">{{ store.state.settings.contacts.cancellbl }}</a>
                                <a class="button-primary button-primary js-submitbtn--contactdetail">{{ store.state.settings.contacts.savecontactlbl }}</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/**
 *
 * Contact
 * @param {Id : -1}//addContact
 *
 *
 * @project ContactSuite
 * @version 1.0
 * @author Erik Rosenhart
 * @copyright 2017
 * @licence MIT
 *
 * @date 10-12-2021
 * @modified
 *
 * @todo
 *
 */

import { useStore }             from 'vuex';
import {
          defineComponent,
          inject,
          ref,
          computed,
          watch,
          onMounted
       }                        from 'vue';
import { cancelEvent }          from '../../../use/helperFunctions';
import { IPCCCConfigurator }    from '../../../ipccc/js/configurator';
import { ValidateDir }	        from '../../../directives/validate';
import {
          Close,
          Message,
          Phone,
          Email
        }                       from "mdue";

class ContactData {
    public Id = -1;
    public CanDelete = false;
    public FirstName = '';
    public Infix = '';
    public LastName = '';
    public fullName = '';
    public Company = '';
    public Department = '';
    public EmailAddresses = [];
    public Addresses = [];
    public StreetAddresses = [];
    public Description = '';
    public CustomerId = -1;
    public TypeOfContact = -1;
    public usesMobilePhone = false;
}

class ContactProps {
    public Status: any;
    public ActiveNumber = '';
    public Id = -1;
    public UserId = -1;
    public StatusId: number;
    public IsMe = false;
    public Department = '';
}

export default defineComponent({
    name : 'ContactDetail',
    props: {
        tabprops : {
            type    : Object,
            default : {}
        },
        isactive : {
            type : Boolean,
            default : false
        }
        //   contactId: { type: Number },
        //   contactUserId: { type: Number },
        //   departmentlist: { type: Array }
    },
    directives: {
        validate : ValidateDir,
    },
    components: {
        Close,
        Message,
        Phone,
        Email
    },
    setup(props) {
        const store:object | any    = useStore(),
            toggleLoader:Function   = inject('toggleLoader'),
            setFrame:Function       = inject('setFrame'),
            customerId              = ref(store.getters.getCustomerInfo().customerId),
            showHelp                = false,
            contactData             = ref<ContactData>(null),
            callOut:Function        = inject('callOut'),
            TYPEOFCONTACT           = {
                personal              : 1,
                department            : 2,
                all                   : 3
            },
            ADDRESSTYPE             = {
                Number                : 1,
                EmailAddress          : 3,
                streetAddress         : 5
            },
            selectedContactId = ref(-1),
            contactProps = ref<ContactProps>(null),
            editMode = ref(false),
            setActiveBaseComponent:Function = inject('setActiveBaseComponent');

        let contactDataOrig:ContactData         = null;
        const hasPermissionToChat = computed(() => store.getters.getPermission('InterneChat'));
        const canAddCompanyContacten = computed(() => store.getters.getPermission('CompanyContacten'));
        const hasBeheerGebruikers = computed(() => store.getters.getPermission('BeheerGebruikers'));
        const hasPermissionToManageContact = computed(() => contactData.value && contactData.value.CanDelete ? true : hasBeheerGebruikers.value);
        const showDetailScreen = computed(() => contactData.value !== null && contactProps.value !== null);
        const setValidation = computed(() => {
            return type => {
                return contactData.value.CanDelete ? type : type + '_skip';
            }
        });

        const shakeIt = () => {
            let _elm = document.querySelector(".contact-detail-wrapper .detailscreen");
            _elm.classList.add('detailscreen--shake');
            setTimeout(() => {
                _elm.classList.remove('detailscreen--shake');
            }, 1000);
        }

        const saveContact = () => {
            if(contactData.value.CanDelete) {
                dataContactFn('save').then(result => {
                    closeContact();
                }).catch(error => {
                    console.error('error:', error);
                });
            } else {
                saveUser();
            }
        }

        const removeItem = (prop, index) => {
            contactData.value[prop].splice(index, 1);
        }

        const showConfirm = (id) => {
            //TODO confirm
            deleteContact(id);
        }

        const deleteContact = (id) => {
            dataContactFn('delete').then(result => {
                store.commit('SET_DELETED_CONTACT', id);
                closeContact();
            }).catch(error => {
                console.error('error:', error);
            });
        }

        const addContact = () => {
            contactData.value = null;
            dataContactFn('readnew').then(result => {
                contactData.value = result as ContactData;
                contactData.value.CanDelete = true;
                contactData.value.TypeOfContact = TYPEOFCONTACT.personal;
                editMode.value = true;
            }).catch(error => {
                console.error('error:', error);
                editMode.value = false;
            });
        }

        const saveUser = () => {
            toggleLoader(true);
            getUserById().then(result => {
                let _detailUser = result;
                _detailUser.Description = contactData.value.Description;
                IPCCCConfigurator.Request(customerId.value, 'users', 'save', _detailUser, -1).then(() => {
                    closeContact();
                    toggleLoader(false);
                }).catch(error => {
                    console.error(error);
                    toggleLoader(false);
                });
            }).catch(error => {
                toggleLoader(false);
                console.error('error:', error);
            });
        };

        const getUserById = () => {
            return IPCCCConfigurator.Request(customerId.value, 'users', 'readone', null, contactProps.value.UserId);
        }

        const getContactData = () => {
            dataContactFn('readone').then(result => {
                contactData.value = result as ContactData;
                contactData.value.fullName = composeName(contactData.value.FirstName, contactData.value.Infix, contactData.value.LastName);
                editMode.value = false;
            }).catch(error => {
                console.error('error:', error);
                editMode.value = false;
            });
        };

        const composeName = (fn, inf, ln) => {
            let _fullName = fn + ' ';
            if(inf && inf != '') _fullName += inf + ' ';
            _fullName += ln;
            return _fullName;
        };

        const addNumber = () => {
            contactData.value.Addresses.push({Label : '', Number : '', AddressType : ADDRESSTYPE.Number})
        }

        const addEmail = () => {
            contactData.value.EmailAddresses.push({Label : '', EmailAddress : '', AddressType : ADDRESSTYPE.EmailAddress})
        }

        const addAddress = () => {
            contactData.value.StreetAddresses.push({
                Label : '',
                Street : '',
                HouseNumber : '',
                HouseNumberAddition : '',
                Zipcode : '',
                City : '',
                Country : '',
                AddressType : ADDRESSTYPE.streetAddress
            });
        }

        const removeAddress = (index) => {
            contactData.value.StreetAddresses.splice(index, 1);
        }

        toggleLoader(false);

        function dataContactFn(dataOp) {
            return new Promise((resolve, reject) => {
                toggleLoader(true);
                if (!contactData.value) {
                    contactData.value = new ContactData();
                }
                if(!contactData.value.CustomerId || contactData.value.CustomerId == -1) {
                    contactData.value.CustomerId = customerId.value;
                }
                IPCCCConfigurator.Request(customerId.value, 'contacts', dataOp, contactData.value, selectedContactId.value).then(result => {
                    let _data = result;
                    if (Array.isArray(_data)) {
                        _data = result[0];
                    }
                    resolve(_data);
                    toggleLoader(false);
                }).catch(error => {
                    reject(error);
                    toggleLoader(false);
                });
            });
        }

        const closeContact = () => {
            editMode.value = false;
            contactData.value = null;
            if (store.getters.getLeftLaneMaxOnOpenContact()) setFrame('L', 'R');
            store.commit(
                'SET_SELECTED_CONTACT',
                {
                    'contact' : null,
                    'leftlanemaxonopencontact' : false
                }
            );
            setActiveBaseComponent(0);
        }

        const callNumber = (evt, _nr, contactid, sId = -1) => {
            if(store.state.commands.Callout && sId != 4) {
                callOut(_nr, contactid);
                // emit('showTabContentOne'); // todo: show first left tab
            }
            cancelEvent(evt);
        }

        const  isActiveNumber = (number) => {
            return number == stripSip(contactProps.value.ActiveNumber);
        }

        const stripSip = (rawNr) => rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;

        const chatInternal = (userid) => {
            store.commit('SET_NEW_CHAT_WINDOW', userid);
        }

        const dotStatusColor = (color) => {
            if (color.length > 1) {
                return { backgroundColor: '#' + color, border: '2px solid #FFF' };
            }
        }

        const getInitials = (fullName) => {
            let _initials  = '',
                _parts     = fullName.split(' '),
                _l         = _parts.length;

            _initials += _parts[0].charAt(0).toUpperCase() + _parts[_l - 1].charAt(0).toUpperCase();

            return _initials;
        }

        const isMassxess = () => {
            return store.getters.getCustomerInfo().selectedCustomerId === 1;
        }

        const smsIsvisible = ref(false);

        const showSms = (bool) => {
            if(contactData.value?.usesMobilePhone) {
                smsIsvisible.value = bool;
            } else {
                smsIsvisible.value = false;
            }
        }

        const mailTo = () => {
            let _link = document.createElement('a');
            _link.setAttribute('href', `mailto:${contactData.value?.EmailAddresses[0].EmailAddress}`);
            document.body.appendChild(_link);
            _link.click();
        }

        const hasChat = (pers) => {
            return hasPermissionToChat && !pers.IsMe && pers.StatusId != -1 && pers.UserId != -1 && pers.StatusId != 6;
        }

        const editContact = () => {
            editMode.value = true;
            contactDataOrig = JSON.parse(JSON.stringify(contactData.value));
        }

        const cancelEdit = () => {
            if(contactData.value.Id == -1) { //newContact
                closeContact();
            } else {
                editMode.value = false;
                contactData.value = contactDataOrig;
            }
        }

        store.watch(store.getters.getCustomerInfo, cObj => {
            if(cObj.customerId != -1) {
                customerId.value = cObj.customerId;
            }
        }, {immediate:true});

        store.watch(store.getters.getSelectedContact, contact => {
            if(contact == null) return;
            contactData.value = null;
            if(contact.Id == -1) {
                contactProps.value = null;
                selectedContactId.value = -1;
                addContact();
            } else {
                selectedContactId.value = contact.Id;
                contactProps.value = contact;
                getContactData();
            }
        }, {deep:true,immediate:true});

        return {
            store, contactData, dotStatusColor, getInitials,
            chatInternal, stripSip, isActiveNumber, callNumber,
            isMassxess, showSms, mailTo, hasChat, closeContact,
            hasPermissionToManageContact, showDetailScreen,
            selectedContactId, contactProps, editMode, composeName,
            setValidation, TYPEOFCONTACT, showHelp, saveContact, shakeIt,
            removeAddress, addNumber, canAddCompanyContacten, removeItem,
            showConfirm, addEmail, addAddress, editContact, cancelEdit, contactDataOrig
        }
    },
});
</script>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;

.contact-detail-wrapper {
    position: absolute;
    top: 0px;
    right: 0;
    bottom: 0;
    left: 0px;
    overflow: hidden;
    // transition: left .2s ease-in-out,
    //             right .2s ease-in-out;
    z-index: 100;
    // background-image: url('/assets/images/app-background.jpg');
    // background-position: center center;
    // background-size: cover;
    background-color: globals.$color-gray2;
}

.contact-wrapper {
    position: absolute;
    display: none;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    // transition: left .2s ease-in-out,
    //             right .2s ease-in-out;
    z-index: 200;
    // background-image: linear-gradient(#FAFAFA, #FAFAFA 160px, #F2F2F2 160px, #F2F2F2);
    &--wide {
        left: 50px;
    }
    &--active {
         display: block;
    }
    .detailscreen {
        width: 80%;
        max-width: 860px;
        min-width: 400px;
    }

    .contactdetail-wrapper__title {
        height: auto;
        overflow: visible;
    }

    .detailscreen-wrapper {
        position: relative;
    }
    .detailscreen-wrapper--visable {
        background-color: transparent;
        .detailscreen {
            box-shadow: 0 2px 3px 0 rgb(0 0 0 / 15%);
        }
    }

    .detailscreen-wrapper__closebtn {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        &__icon {
            width: 40px;
            height: 40px;
            padding: 10px;
            color: globals.$color-gray30;
        }
    }

    .contactdetail__title-status-icon {
        width: 66.67px;
        height: 66.67px;
        line-height: 5rem;
        left: 52px;
        top: 50px;
    }

    .contactdetail__title-status-dot {
        width: 23px;
        height: 23px;
    }

    .contactdetail__title-status-init {
        font-size: 2.2rem;
    }

    .contactdetail__title-status-icon + .detailscreen__title {
        margin-left: 106px;
        display: block;
        height: auto;
        margin-top: 0;
        font-size: 1.1rem;
        span {
            display: block;
            height: 1.6rem;
            line-height: 1.6rem;
            width: 100%;
            &:nth-of-type(1) {
                font-family: 'Open Sans Bold', sans-serif;
                color: globals.$color-gray80;
            }
            &:nth-of-type(2) {
                font-family: 'Open Sans SemiBold', sans-serif;
                color: globals.$color-gray60;
            }
            &:nth-of-type(3) {
                font-family: 'Open Sans Regular', sans-serif;
                color: globals.$color-gray40;
            }
        }
    }
    .contactdetail-menu {
        &__btn {
            margin-left: 20px;
            width: 80px;
            height: 80px;
            background-color: globals.$color-white;
            &__circle {
                background-color: globals.$color-gray10;
                color: globals.$color-white;
                width: 60px;
                height: 60px;
                margin: 0 auto;
                line-height: 3.6rem;
                font-size: 2.5em;
                text-align: center;
                border-radius: 50%;
                transition: background-color .15s ease-in-out;
                svg {
                    vertical-align: middle;
                }
            }
            &__caption {
                padding-top: 3px;
                color: globals.$color-gray30;
                font-family: 'Abel', sans-serif;
            }
            &--message,
            &--phone,
            &--email {
                cursor: pointer;
                .contactdetail-menu__btn__circle {
                    background-color: globals.$color-gray30;
                }
            }
            &--message:hover .contactdetail-menu__btn__circle,
            &--phone:hover .contactdetail-menu__btn__circle,
            &--email:hover .contactdetail-menu__btn__circle {
                background-color: globals.$color-blue;
            }
        }
    }
}

.contactdetail__interaction-btn {
    width: 45px;
    height: 45px;
    display: inline-block;
    color: globals.$color-white;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 1.5em;
    line-height: 1.9em;
    text-align: center;
    margin: 0 20px 0 0;
    border-radius: 50%;
    background-color: globals.$color-blue;
    cursor: pointer;
    &:hover {
        cursor: pointer;
    }
    &--disabled {
        pointer-events: none;
        background-color: globals.$color-gray20;
    }
}

.contactdetail__line {
    font-size: .9rem;
    font-family: 'Open Sans Regular', sans-serif;
    color: globals.$color-gray60;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
    div:nth-of-type(2) {
        color: globals.$color-blue;
        user-select: text;
        div {
            user-select: text;
        }
    }
    &-other {
        color: globals.$color-gray60;
    }
}

.contactdetail__line-numbers {
    div {
        transition: background-color 0.15s ease-in-out;
        &:nth-of-type(1) {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            &.activenr {
                font-weight: bold;
            }
        }
        &:nth-of-type(2) {
            user-select: text;
            &.activenr {
                font-weight: bold;
            }
            &:after {
                color: transparent;
                transition: color 0.15s ease-in-out;
            }
        }
    }
}

.contactdetail__line-numbers {
    &:hover {
        div {
            background-color: globals.$color-lightblue;
            cursor: pointer;
        }
        div:nth-of-type(2) {
            &:after {
                content: "\F3F2";
                position: absolute;
                right: 7px;
                top: 7px;
                color: globals.$color-blue;
                font-family: 'Material Design Icons';
                font-weight: normal;
                font-size: 1.1rem;
            }
        }
    }
    &--disabled {
        cursor: default;
        pointer-events: none;
        span {
            color: globals.$color-gray20;
        }
    }
}

.note {
    font-size: .9em;
    color: globals.$color-gray80;
    padding-left: 10px;
}

.list-number-header__button--add {
    right : 10px;
}

.grid-row--repeater {
    padding: 0;
    .grid-unit--beta,
    .grid-unit--delta {
        padding-top: 0;
        padding-bottom: 0;
    }
}

.form-textfield--hasdelete {
    input[type='text'] {
        width: calc(100% - 45px);
        float: left;
    }
    button {
        width: 36px;
        height: 36px;
        float: left;
        display: block;
        color: globals.$color-reporting;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        margin: 18px 0 0 8px;
        border-radius: 50%;
        background-color: transparent;
        font-size: 1.2em;
        cursor: pointer;
        &:hover {
            color: fn.tint(globals.$color-reporting, 20%);
            background-color: globals.$color-gray5;
        }
    }
}

.clear {
    height: 0;
    width: 100%;
    float: left;
    display: block;
}

.form-textarea--note textarea {
    height: 90px;
    box-shadow: inset 0 -240px 0px 0px rgba(0, 0, 0, 0.025);
    padding-left: 10px;
    padding-right: 10px;
}

.typo-helptext--top {
    padding-left: .5rem;
    padding-right: .5rem;
}
</style>
