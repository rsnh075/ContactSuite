<template>
	<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}]">
		<div class="select-search-field__wrapper" ref="selectsearchfieldcomponent" @click="handleToggle($event)">
			<label class="select-search-field__input-label">{{ fieldlabel[browserLanguage] }}</label>
			<a :class="['select-search-field__button', 'toggle--js', {'select-search-field__button--readonly' : isReadOnly}]"></a>
			<div :class="['select-search-field__selected', 'toggle--js', {'select-search-field__selected--readonly' : isReadOnly}]" v-html="currentLabel"></div>
			<div class="select-search-field__optionlist" ref="selectsearchfieldoptionswrap">
				<div class="select-search-field__optionlist-search">
					<input type="text" v-model="searchStr" :placeholder="$store.state.settings.notes.searchlbl" @keyup="filterList()">
				</div>
				<ul @click="selectValue($event)" :data-selectedval="currentValue">
					<li class="select-search-field__option select--js" data-value="null" v-html="defaultLabel"></li>
					<li v-for="(option, index) in filteredOptions" :key="index" class="select-search-field__option select--js" :data-value="option.optionvalue">{{ option.optionlabel }}</li>
				</ul>
			</div>
		</div>
		<div v-if="isRequired(fieldrequired)" class="hidden-validation">
			<input type="hidden" :value="currentValue" data-validate="isNotEmpty" :data-message="$store.state.settings.notes.validatefieldmessage">
		</div>
	</div>
</template>

<script>
/**
 *
 * copy of SelectSearchFlyout
 * currentdata === null triggers default selected
 *
 * @changes
 * 09/11/2021 validation added if note is 'edit' but haseditabletemplatefields
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 * Add position fixed for overflowing the wrapper
 * close all instances on click outside event
 *
 */

export default {
	name : 'SelectSearchField',
	props : {
		fieldwidth : {
			type     : String,
			default  : ''
		},
		fieldlistoptions : {
			type     : Array,
			default  : [],
			required : true
		},
		fieldproperty : {
			type     : String,
			default  : '',
			required : true
		},
		fieldlabel : {
			type     : Object,
			default  : ''
		},
		currentdata : {
			type     : String,
			default  : '',
			required : true
		},
		notestatus : {
			type     : String,
			default  : 'new'
		},
		haseditabletemplatefields : {
			type     : Boolean,
			default  : true
		},
		fieldrequired : {
			type     : Boolean,
			default  : false
		}
	},
	data: () => {
		return {
			browserLanguage  : 'nl',
			defaultLabel     : '',
			currentLabel     : '',
			currentValue     : '',
			optionsWrapper   : null,
			maxHeightOptions : '300',
			searchStr        : '',
			filteredOptions  : [],
		}
	},
	computed: {
		isReadOnly() {
			return this.notestatus == 'edit' && !this.haseditabletemplatefields;
		}
	},
	watch: {
		'fieldlistoptions' : function(newVal, oldVal) {
			this.filteredOptions  = [...this.fieldlistoptions];
			if(this.currentdata === '') {
				this.currentLabel  = this.defaultLabel;
				this.currentValue  = this.currentdata;
			} else {
				this.currentValue  = this.currentdata;
				let _selOption     = this.fieldlistoptions.find(opt => opt.optionvalue == this.currentdata);
				if(_selOption)
				this.currentLabel  = _selOption.optionlabel;
			}
			this.modifyVal()
			// this.$emit('change', this.currentValue);
		},
		'currentdata': function(newVal, oldlal) {
			this.currentValue                 = this.currentdata;
			let _selOption                    = this.fieldlistoptions.find(opt => opt.optionvalue == this.currentdata);
			if(_selOption) this.currentLabel  = _selOption.optionlabel;
			else this.currentLabel            = this.defaultLabel;
		}
	},
	methods: {
		modifyVal() {
			this.$emit('propchanged', this.fieldproperty, this.currentValue);
		},
		isRequired(bool) {
			if(this.notestatus == 'edit' && !this.haseditabletemplatefields) return '';
			return bool ? 'isNotEmpty' : ''
		},
		setCurrentLabel() {
			let _selOption = this.fieldlistoptions.find(opt => opt.optionvalue == this.currentValue);
			if(_selOption) {
				this.currentLabel = _selOption.optionlabel;
			} else { //return default currentdata because _selOption was not found in optionlist
				this.currentLabel = this.defaultLabel;
				this.currentValue = '';
				this.modifyVal()
			}
		},
		selectValue(evt) {
			let _target    = evt.target,
				_option    = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

			if(_option === 'select--js') {
				this.currentValue = (_target.getAttribute('data-value')) ? _target.getAttribute('data-value') : _target.parentElement.getAttribute('data-value');
				if(this.currentValue != '') {
				[...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('select-search-field__option--selected'));
				_target.classList.add('select-search-field__option--selected');
				setTimeout(this.setCurrentLabel, 0);
				this.modifyVal()
				// this.$emit('change', this.currentValue)
				} else {
				this.currentLabel = this.defaultLabel;
				this.modifyVal()
				// this.$emit('change', this.currentValue);
				}
			}
			this.toggleOptions();
		},
		filterList() {
			if(this.searchStr != '')
				this.filteredOptions = this.fieldlistoptions.filter(item => item.optionlabel.toLowerCase().indexOf(this.searchStr.toLowerCase()) != -1);
			else
				this.filteredOptions = this.fieldlistoptions;

			// this.filteredOptions.sort(cmutils.dynamicSort(this.labelproperty));
		},
		handleToggle(evt) {
			if(this.isReadOnly) return;
			if(evt.target.classList.contains('toggle--js')) {
				if(this.optionsWrapper.classList.contains('select-search-field__optionlist--open')) {
				} else { //first close all open select searches
				let _openinstances    = [].slice.call(document.querySelectorAll('.select-search-field__optionlist--open'));
				_openinstances.forEach(el => {
					el.classList.remove('select-search-field__optionlist--open');
				});
				}
				this.toggleOptions();
			}
		},
		toggleOptions() {
			this.maxHeightOptions = window.innerHeight - this.$refs.selectsearchfieldcomponent.getBoundingClientRect().top - 100;
			this.optionsWrapper.style['max-height'] = this.maxHeightOptions + 'px';

			this.optionsWrapper.classList.toggle('select-search-field__optionlist--open');
		}
	},
	created() {
		this.browserLanguage  = this.$store.getters.getLang();
	},
	mounted() {
		this.optionsWrapper   = this.$refs.selectsearchfieldoptionswrap;
		this.defaultLabel     = this.$store.state.settings.notes.formdefaultselectlbl;
		if(this.currentdata == '' ) {
			this.currentLabel = this.defaultLabel;
		} else {
			this.currentValue = this.currentdata;
			this.setCurrentLabel();
		}
		this.filteredOptions  = [...this.fieldlistoptions];
		if(this.notestatus == 'new') this.$emit('propchanged', this.fieldproperty, '');
	}
}

</script>

<style lang="scss">

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.select-search-field__wrapper {
	position: relative;
	width: 100%;
}

.select-search-field__input-label {
	display: block;
	position: absolute;
	top: 7px;
	height: 100%;
	width: 100%;
	padding-bottom: 4px;
	padding-left: 3px;
	min-height: 14px;
	font-size: .7rem;
	overflow: hidden;
	color: globals.$color-gray30;
	font-family: 'Open Sans SemiBold', sans-serif;
}

.select-search-field__button {
	position: absolute;
	width: 30px;
	height: 40px;
	top: 12px;
	right: 0;
	cursor: pointer;
	&:before {
		content: "";
		position: absolute;
		width: 0;
		height: 0;
		top: calc(50% + 8px);
		left: calc(100% - 20px);
		border: 6px solid transparent;
		border-top-color: globals.$color-gray35;
		z-index: 2;
		pointer-events:none;
		user-select: none;
	}
	&--readonly:before {
		border: 0;
	}
}

.select-search-field__selected {
	position: relative;
	display: block;
	float: left;
	border-bottom: 1px solid globals.$color-gray35;
	background-color: transparent;
	height: 40px;
	line-height: 33px;
	width: 100%;
	padding: 10px 30px 4px 3px;
	color: globals.$color-gray60;
	font-size: 1rem;
	margin-top: 17px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	cursor: default;
	user-select: none;
	box-shadow: inset 0 -30px 0px 0px rgba(0,0,0,.025);
	&--readonly {
		border-bottom: none;
		box-shadow: none;
	}
	span {
		width: 30px;
		height: 40px;
		text-align: left;
		margin-right: 5px;
		// @include font-icon();
		font-family: 'Material Design Icons';
		font-size: .9em;
		color: globals.$color-gray35;
		float: left;
	}
}

.select-search-field__optionlist {
	position: absolute;
	top: 52px;
	left: 0;
	width: 100%;
	height: auto;
	min-height: 120px;
	overflow: hidden;
	overflow-y: auto;
	list-style-type: none;
	padding: 5px;
	background-color: globals.$color-white;
	border: 1px solid globals.$color-gray20;
	z-index: 1000;
	display: none;
	&--open {
		display: block;
	}
	&-search {
		padding: 15px 10px 15px 10px;
		position: relative;
		&:before {
			content: '\F349';
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			font-family: 'Material Design Icons';
			font-size: 1.2rem;
			font-weight: normal;
			font-style: normal;
			color: globals.$color-gray30;
		}
		input {
			text-indent: 20px;
			border: none;
			border-bottom: 1px solid globals.$color-gray30;
			width: 100%;
			color: globals.$color-gray60;
			font-size: 0.9rem;
			line-height: 1.6rem;
		}
	}
}

.select-search-field__option {
	height: 35px;
	line-height: 35px;
	width: calc(100% + 15px);
	margin-left: -5px;
	padding-right: 10px;
	padding-left: 10px;
	color: globals.$color-gray60;
	text-overflow: ellipsis;
	overflow: hidden;
	width: calc(100% + 15px);
	white-space: nowrap;
	cursor: default;
	span {
		width: 30px;
		height: 40px;
		text-align: left;
		margin-right: 5px;
		// @include font-icon();
		font-family: 'Material Design Icons';
		font-size: .9em;
		color: globals.$color-gray35;
		float: left;
	}
	&:hover {
		background-color: globals.$color-gray10;
		color: globals.$color-gray60;
	}
	&--selected {
		background-color: functions.tint(globals.$color-help, 50%);
		color: globals.$color-white;
		span {
			color: globals.$color-white;
		}
	}
}

</style>