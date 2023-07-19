<script lang="ts">
export default {
  inheritAttrs: false,
  customOptions: {
	name: "NotesFilters",
  }
}
</script>
<script setup lang="ts">
/**
 * Filters for Notes.vue (list)
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 *
 */

import { FilterData }               from '../../../../types/Notes'
import { ref } 						from '@vue/reactivity';
import { onMounted, watch } 		from '@vue/runtime-core';
import { useStore }					from 'vuex';
import { ValidateDir as vValidate }	from '../../../../directives/validate';
import PikaDay                      from 'pikaday';
import {
          ISOToDDMMYYYY,
		  ISOToHHMM,
		  pikaDayToDDMMYYYY,
       }                   			from '../../../../use/dateFunctions';
import * as Mask          			from '../../../../utils/cm_mask';
import { Sync }          			from 'mdue';

const props = defineProps(['visible', 'filterdata']);
const emit  = defineEmits(['getfilterednotelist', 'resetfilters', 'close']);

const store:object | any    = useStore();

const filterData            = ref({} as FilterData),
	  fromDate				= ref(''),
	  fromTime				= ref(''),
	  tillDate				= ref(''),
	  tillTime				= ref('');


const setFilterData = (newVal) => {
	filterData.value = newVal;
}
setFilterData(props.filterdata);

const setFilterDataFrom = (newVal) => {
	fromDate.value   = ISOToDDMMYYYY(newVal);
	fromTime.value   = ISOToHHMM(newVal);
}
watch(() => props.filterdata.From, (newVal, oldVal) => {
	setFilterDataFrom(newVal);
})

const setFilterDataTill = (newVal) => {
	tillDate.value   = ISOToDDMMYYYY(newVal);
	tillTime.value   = ISOToHHMM(newVal);
}
watch(() => props.filterdata.Till, (newVal, oldVal) => {
	setFilterDataTill(newVal);
});

const getFilteredNoteList = () => {
	emit('getfilterednotelist', filterData.value);
	close();
}

const onReset = () => {
	emit('resetfilters');
}

const close = () => {
	emit('close');
}

const checkNumber = () => {
	if(filterData.value.SearchValue.length == 2 && filterData.value.SearchValue.charAt(0) == '0') {
		filterData.value.SearchValue = filterData.value.SearchValue.charAt(1) == '0' ? '+' : '+31' + filterData.value.SearchValue.charAt(1);
	}
}

const checkTime = (evt, fromtill) => {
	let _target  = evt.target;
	Mask.isTimeMask(evt);
	if (fromtill == 'from')
		fromTime.value = _target.value;
	else
		tillTime.value = _target.value;
	setFilterDataDateTime(fromtill);
}

const setFilterDataDateTime = (fromtill) => {
	let _parts = [];
	if (fromtill == 'from') {
		_parts = fromDate.value.split('-');
		filterData.value.From = _parts[2].concat('-' + _parts[1] + '-' + _parts[0] + 'T' + fromTime.value);
	} else {
		_parts = tillDate.value.split('-');
		filterData.value.Till = _parts[2].concat('-' + _parts[1] + '-' + _parts[0] + 'T' + tillTime.value);
	}
}

const setFromDate = (date) => {
	fromDate.value = date;
	setFilterDataDateTime('from');
}

const setTillDate = (date) => {
	tillDate.value = date;
	setFilterDataDateTime('till');
}

const setDatePickerFrom = () => {
	const datepickerFrom = new PikaDay({
		field: document.getElementById('datepickerNotesFiltersFrom'),
		format: 'DD-MM-YYYY',
		// minDate: new Date(),
		i18n: store.state.settings.datepicker,
		onSelect: () => {
			setFromDate(pikaDayToDDMMYYYY(datepickerFrom.getDate()));
		},
	})
}
// setDatePickerFrom();

const setDatePickerTill = () => {
	const datepickerTill = new PikaDay({
		field: document.getElementById('datepickerNotesFiltersTill'),
		format: 'DD-MM-YYYY',
		// minDate: new Date(),
		i18n: store.state.settings.datepicker,
		onSelect: () => {
			setTillDate(pikaDayToDDMMYYYY(datepickerTill.getDate()));
		}
	})
}
// setDatePickerTill();
onMounted(() => {
	setDatePickerFrom();
	setDatePickerTill();
})
</script>

<template>
	<div :class="['notes-filters-wrapper', {'notes-filters-wrapper--isvisible' : props.visible}]">
		<div class="notes-filters-header">
			<div class="notes-filters-close">
				<a class="close--js" @click="close()"><span></span> <span></span></a>
			</div>
			<h2 class="notes-filters-h2">{{ store.state.settings.notesfilters.header }}</h2>
		</div>
		<form @valid="getFilteredNoteList()" v-validate="{'submitBtns' : 'js-submitbtn--filterednotelist'}" autocomplete="off">
			<div class="notes-filters-body">
				<div class="grid-row">
					<div class="grid-unit--alpha">
					<div class="form-textfield form-textfield--bground form-textfield--nopaddingbottom">
						<input type="text" name="formsearchvalue" id="formsearchvalue" v-model="filterData.SearchValue" @keyup="checkNumber()" :placeholder="store.state.settings.notesfilters.searchvalueplaceholder">
						<label for="formsearchvalue" class="form-label form-label--hidden">{{ store.state.settings.notesfilters.searchvaluelabel }}</label>
					</div>
					</div>
				</div>
				<div class="grid-row">
					<div class="grid-unit--delta">
						<div class="form-textfield form-textfield--bground form-textfield--normal-form">
							<input id="datepickerNotesFiltersFrom" type="text" v-model="fromDate" autocomplete="off">
							<label class="form-label form-label--hidden">{{ store.state.settings.notesfilters.formfromdate }}</label>
						</div>
					</div>
					<div class="grid-unit--delta">
						<div class="form-textfield form-textfield--bground form-textfield--normal-form">
							<input type="text" v-model="fromTime" @keydown="checkTime($event, 'from')">
						</div>
					</div>
					<div class="grid-unit--delta">
						<div class="form-textfield form-textfield--bground form-textfield--normal-form">
							<input id="datepickerNotesFiltersTill" type="text" v-model="tillDate" autocomplete="off">
							<label class="form-label form-label--hidden">{{ store.state.settings.notesfilters.formtilldate }}</label>
						</div>
					</div>
					<div class="grid-unit--delta">
						<div class="form-textfield form-textfield--bground form-textfield--normal-form">
							<input type="text" v-model="tillTime" @keydown="checkTime($event, 'till')">
						</div>
					</div>
				</div>
				<div class="grid-row">
					<div class="grid-unit--alpha">
						<label class="form-label form-label--list-inline">{{ store.state.settings.notesfilters.formemptynoteslbl }}</label>
						<div class="form-checkbox form-checkbox--large">
							<input type="checkbox" name="onlyemptycheckbox" id="onlyemptycheckbox" v-model="filterData.OnlyEmpty">
							<label for="onlyemptycheckbox">{{ store.state.settings.notesfilters.formonlyemptycheckboxlbl }}</label>
						</div>
					</div>
				</div>
			</div>
			<div class="notes-filters-footer">
				<div class="grid-row">
					<div class="grid-unit--alpha">
						<a class="button-primary button-primary--gray notesaddnote-resetbtn" @click="onReset()"><Sync class="notesaddnote-resetbtn__icon" />{{ store.state.settings.notesfilters.cancellbl }}</a>
						<span class="grid--push">
							<a class="button-primary js-submitbtn--filterednotelist">{{ store.state.settings.notesfilters.savelbl }}</a>
						</span>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .notes-filters-wrapper {
    border-radius: 3px;
    display: none;
    position: absolute;
    width: 410px;
    background-color: globals.$color-white;
    box-shadow: 0 0 18px 0 rgba(0,0,0,.2);
    z-index: 200;
    top: 120px;
    left: 0;
    &--isvisible {
      display: block;
    }
    &:before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      bottom: 100%;
      border: 10px solid transparent;
      border-bottom-color: globals.$color-white;
      border-top-color: transparent;
      border-left-color: transparent;
      border-right-color: transparent;
      pointer-events: none;
      z-index: 1;
      left: 40px;
      top: -20px;
    }
  }

  .notes-filters-header {
    height: 45px;
    .notes-filters-h2 {
      color: globals.$color-gray80;
      padding: 15px 0 0 20px;
      font-size: 1.3rem;
      line-height: 1.3rem;
    }
    .notes-filters-close {
      position: absolute;
      height: 45px;
      width: 45px;
      color: globals.$color-gray50;
      right: 0;
      a {
        position: absolute;
        top: 5px;
        right: 8px;
        width: 35px;
        height: 35px;
        display: block;
        z-index: 1;
        cursor: pointer;
        span {
          content: "";
          position: absolute;
          background-color: globals.$color-gray25;
          width: 60%;
          height: 2px;
          border-radius: 2px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%)
                    rotate(45deg);
          &:nth-child(2) {
            transform: translate(-50%, -50%)
                      rotate(-45deg);
          }
        }
      }
    }
  }

  .notes-filters-body {
    line-height: initial;
    .form-textfield--bground label {
      line-height: initial;
    }
    .grid-unit--delta {
      // padding: 0 5px;
      &:first-of-type {
        padding: 0 0 0 1.5rem;
        width: 30%;
      }
      &:last-of-type {
        padding: 0 1.5rem 0 0;
        width: 23%;
      }
      &:nth-child(2) {
        padding: 0 5px 0 5px;
        width: 20%;
      }
      &:nth-child(3) {
        padding: 0 5px 0 10px;
        width: 27%;
      }
    }
  }

  .notes-filters-footer {
    padding: 0 0 10px 0;
    .notesaddnote-resetbtn {
      color: globals.$color-gray80;
      &__icon {
		vertical-align: middle;
		font-size: 1.2rem;
		margin: -3px 6px 0 -10px;
        color: globals.$color-gray25;
      }
    }
  }

</style>