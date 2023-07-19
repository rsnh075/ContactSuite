<script lang="ts">
export default {
    name: 'SmartIdBaseComp',
	components: { SmartIdBaseCompSms }
}
</script>

<script setup lang="ts">

/**
 *
 * Smart id: call info for agent
 * Contains inbound call data, Asr-data, Call-me-now-data
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

import { useStore } from 'vuex';
import { inject, computed, ref, watch } from 'vue';
import { Close, AccountCircle } from "mdue";
import { LineInfo } from '../../../types/LineInfo';
import { NvpContact } from '../../../types/NvpContact';
import { validateValue } from '../../../helpers/validationRegex';
import SmartIdBaseCompSms from './SmartIdBaseCompSms.vue';
import {
          Message,
          Phone,
          Email
        } from "mdue";

const store:object | any			    = useStore(),
	toggleLoader:Function			    = inject('toggleLoader'),
	lineActive:boolean				    = inject('lineActive'),
	lastInboundLineInfo:LineInfo	    = inject('lastInboundLineInfo'),
	userResetLastInboundLineInfo:Function = inject('userResetLastInboundLineInfo'),
    callOut:Function				    = inject('callOut'),
	nvpData							    = ref([]),
	hasNvpData						    = computed(() => nvpData.value.length > 0),
	nvpContact						    = ref<NvpContact>(null),
	hasContactData				        = computed(() => nvpContact.value ? Object.keys(nvpContact.value).length > 0 : false);

const stripSip = (rawNr) => {
    return rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;
}

const isMobilePhone = (number) => {
    let _isValid = validateValue(number, 'isMobileNL') || validateValue(number, 'isMobileBE');
    return _isValid;
}

const resetData = () => {
    nvpData.value = [];
    nvpContact.value = null;
};

const handleNewNvpData = (data) => {
    nvpData.value = data;
    nvpContact.value = nvpData.value.reduce((acc, el) => {
        if(el.Name == '!CONTACT') {
            let _contact = {};
            el.Tuples.forEach(tuple => {
                _contact[tuple.Name] = tuple.Value;
            });
            _contact.usesMobilePhone = isMobilePhone(stripSip(_contact.Phonenumber));
            _contact.ContactId = el.Index;
            acc = _contact;
        }
        return acc;
    }, {});
};

watch(() => lastInboundLineInfo.value.nvpData, (newVal, oldVal) => {
    if(newVal && newVal.length > 0) {
        handleNewNvpData(newVal);
    } else {
        resetData();
    }
}, {immediate:true});

const testIsValueUrl = val => {
    return val.startsWith('https');
}

const openUrl = url => {
    window.open(url);
}

const mailTo = () => {
    let _link = document.createElement('a');
        _link.setAttribute('href', `mailto:${nvpContact.value?.Email}`);
        document.body.appendChild(_link);
        _link.click();
}

const smsIsvisible = ref(false);

const showSms = (bool) => {
    if(nvpContact.value?.usesMobilePhone) {
        smsIsvisible.value = bool;
    } else {
        smsIsvisible.value = false;
    }
}

const callNumber = (number) => {
    let _contactid = nvpContact.value?.ContactId ? nvpContact.value.ContactId : -1;
    if(store.state.commands.Callout && store.state.statusId != 4) {
        callOut(stripSip(number), _contactid);
    }
}

const closeNvpData = () => {
    userResetLastInboundLineInfo();
}

const isMassxess = () => {
    return store.getters.getCustomerInfo().selectedCustomerId === 1;
}

toggleLoader(false);

</script>

<template>
	<section :class="['smart-id-wrapper', {'smart-id-wrapper--appbg' : !hasNvpData }]" data-e2e="smart-id">

        <button v-if="hasNvpData && !lineActive" type="button" class="smart-id-header__closebtn" @click="closeNvpData()">
            <Close class="smart-id-header__closebtn__icon" />
        </button>

        <div v-if="!hasNvpData" class="smart-id-nocalldataavailable">
			{{ store.state.settings.smartid.nocalldataavailable }}
		</div>

        <header v-if="hasContactData" class="smart-id-header">
			<AccountCircle class="smart-id-header__icon--contact" />
            <div class="smart-id-header__info">
                <div v-if="nvpContact.Fullname.length > 0" class="smart-id-header__info--name">{{ nvpContact.Fullname }}</div>
                <div v-else class="smart-id-header__info--number">{{ stripSip(nvpContact.Phonenumber) }}</div>
                <div v-if="nvpContact.Company && nvpContact.Company.length > 0" class="smart-id-header__info--company">{{ nvpContact.Company }}</div>
                <div v-if="nvpContact.Department && nvpContact.Department.length > 0" class="smart-id-header__info--department">{{ nvpContact.Department }}</div>
            </div>

            <button v-if="isMassxess" :class="['smart-id-header__menu', {'smart-id-header__menu--message' : nvpContact.usesMobilePhone }]" @click="showSms(true)">
                <div class="smart-id-header__menu__circle"><Message /></div>
                <div class="smart-id-header__menu__caption">{{ store.state.settings.smartid.iconcaptionlbl[0] }}</div>
            </button>
            <button :class="['smart-id-header__menu', {'smart-id-header__menu--phone' : !store.state.commands.Hangup}]" @click="callNumber(nvpContact.Phonenumber)">
                <div class="smart-id-header__menu__circle"><Phone /></div>
                <div class="smart-id-header__menu__caption">{{ store.state.settings.smartid.iconcaptionlbl[1] }}</div>
            </button>
            <button :class="['smart-id-header__menu', {'smart-id-header__menu--email' : nvpContact.Email.length > 0}]" @click="mailTo">
                <div class="smart-id-header__menu__circle"><Email /></div>
                <div class="smart-id-header__menu__caption">{{ store.state.settings.smartid.iconcaptionlbl[2] }}</div>
            </button>

		</header>

		<div class="smart-id-grid" v-if="hasNvpData">

			<div v-for="listitem in nvpData" class="smart-id-infocell" :key="listitem.Index" :class="[{'smart-id-infocell--hidden' : listitem.Name == '!CONTACT'}]">
				<div class="smart-id-infocell__header">{{ listitem.Name }}</div>
				<span v-for="(tuple, index) in listitem.Tuples" class="smart-id-infocell__tuple" :key="index">
					<span class="smart-id-infocell__label" :data-e2e="tuple.Name">{{ tuple.Name }}</span>
					<span v-if="testIsValueUrl(tuple.Value)" class="smart-id-infocell__text smart-id-infocell__text--link" @click.stop="openUrl(tuple.Value)">{{ tuple.Value }}</span>
					<span v-else class="smart-id-infocell__text" :data-e2e="tuple.Value">{{ tuple.Value }}</span>
				</span>
			</div>

		</div>
        <smart-id-base-comp-sms
            v-if="smsIsvisible"
            :visible="smsIsvisible"
            :number="nvpContact.Phonenumber"
            :contactid="nvpContact.ContactId"
            @showSms="showSms" />
	</section>

</template>

<style lang="scss" scoped>
@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions" as fn;



.smart-id-wrapper {
    position: absolute;
    padding : 2rem 3rem .5rem 3rem;
    overflow-y: auto;
    top: 0px;
    right: 0;
    bottom: 0;
    left: 0px;
    z-index: 100;
    background-color: globals.$color-gray2;
    &--appbg {
        background-image: url('/assets/images/app-background.jpg');
        background-position: center center;
        background-size: cover;
    }
}

.smart-id-header__closebtn {
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

.smart-id-header {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
	max-width: 1280px;
    padding: 15px 20px;
    margin: 0 auto 1rem auto;
    border-radius: 3px;
    box-shadow: 0 2px 3px 0 rgb(0 0 0 / 15%);
    background-color: globals.$color-white;
    font-family: "Open Sans SemiBold", sans-serif;
	overflow: hidden;
    &__icon--contact {
        width: 80px;
        margin-right: 20px;
		font-size: 5rem;
		color: globals.$color-gray30;
		font-family: 'Material Design Icons';
		font-weight: normal;
		font-style: normal;
        transition: background-color 0.15s ease-in-out;
        color: globals.$color-blue;
        background-color: transparent;
    }
    &__info {
        margin-right: auto;
        font-size: 1.1rem;
        line-height: 1.6rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        &--name,
        &--number {
            font-family: 'Open Sans Bold', sans-serif;
            color: globals.$color-gray80;
        }
        &--company {
            color: globals.$color-gray60;
        }
        &--department {
            color: globals.$color-gray40;
            font-family: 'Open Sans Regular', sans-serif;
        }
    }
    &__menu {
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
            .smart-id-header__menu__circle {
                background-color: globals.$color-gray30;
            }
        }
        &--message:hover .smart-id-header__menu__circle,
        &--phone:hover .smart-id-header__menu__circle,
        &--email:hover .smart-id-header__menu__circle {
            background-color: globals.$color-blue;
        }
    }
}

.smart-id-grid {
	max-width: 1280px;
	margin: 0 auto;
	display: grid;
    grid-template-columns: repeat(1, 1fr);
	@media #{globals.$media_XXL} {
		grid-template-columns: repeat(2, 1fr);
	}
	grid-auto-rows: auto;
	gap: 1rem;
}

.smart-id-infocell {
    padding: 10px 20px 10px 20px;
    line-height: 25px;
    font-size: .9rem;
	background-color: #FFF;
	border-radius: 3px;
    box-shadow: 0 2px 3px 0 rgb(0 0 0 / 15%);
	// max-width: 450px;
	min-width: 200px;
	&__header {
		margin-bottom:10px;
		line-height: 30px;
    	font-size: 1rem;
		font-family: 'Open Sans SemiBold', sans-serif;
    	border-bottom: 1px solid globals.$color-gray15;
		color: globals.$color-gray80;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
    }
    &__tuple {
		display: flex;
		flex: 1 0 100%;
		max-width: 100%;
    }
    &__label {
		flex: 1 0 auto;
		width: 30%;
		color: globals.$color-gray80;
		font-family: 'Open Sans SemiBold', sans-serif;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
    }
    &__text {
		flex: 1 0 auto;
		width: 70%;
		color: globals.$color-gray60;
		overflow: hidden;
		text-overflow: ellipsis;
      	&--link {
			flex: 1 0 auto;
			cursor: pointer;
			text-decoration: underline;
			color: globals.$color-blue;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
      	}
  	}
    &--hidden {
        display: none;
    }
}

.smart-id-nocalldataavailable {
	position: absolute;
    top: 35%;
    left: 50%;
    width: auto;
    transform: translate(-50%, -50%);
    font-family: "Open Sans Light", sans-serif;
    color: globals.$color-gray80;
    font-size: 1rem;
    z-index: 1;
}

</style>