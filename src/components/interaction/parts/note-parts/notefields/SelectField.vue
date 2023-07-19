<template>
	<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}]">
		<div class="form-selectfield form-selectfield--inline-bground">
			<label :for="fieldproperty + 'SelectField'" class="form-label form-label--hidden form-label--lowered">{{ fieldlabel[browserLanguage] }}</label>
			<select :id="fieldproperty + 'SelectField'" :name="fieldproperty + 'SelectField'" :value="currentdata" @change="modifyVal($event, fieldproperty)" :disabled="isReadOnly" :data-validate="isRequired(fieldrequired)" :data-message="$store.state.settings.notes.validatefieldmessage">
			<option value="">{{ $store.state.settings.notes.formdefaultselectlbl }}</option>
			<option v-for="(opt, index) in fieldlistoptions" :key="index" :value="opt.optionvalue">{{ opt.optionlabel }}</option>
			</select>
		</div>
	</div>
</template>

<script>
/**
 *
 * select
 *
 * @changes
 * 09/11/2021 validation added if note is 'edit' but haseditabletemplatefields
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 * All
 *
 */

export default {
	name: 'SelectField',
	props: {
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
			default  : null,
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
			browserLanguage : 'nl',
		}
	},
	computed: {
		isReadOnly() {
			return this.notestatus == 'edit' && !this.haseditabletemplatefields;
		}
	},
	methods: {
		modifyVal(evt, propname) {
			this.$emit('propchanged', propname, evt.target.value);
		},
		isRequired(bool) {
			if(this.notestatus == 'edit' && !this.haseditabletemplatefields) return '';
			return bool ? 'isNotEmpty' : ''
		}
	},
	created() {
		this.browserLanguage  = this.$store.getters.getLang();
	},
	mounted() {
		if(this.notestatus == 'new') this.$emit('propchanged', this.fieldproperty, '');
	}
}
</script>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.selectbox__wrapper {
	position: relative;
	width: 100%;
}

.selectbox__button {
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
		top: calc(50% + 2px);
		left: calc(100% - 20px);
		border: 6px solid transparent;
		border-top-color: globals.$color-gray35;
		z-index: 2;
		pointer-events:none;
		user-select: none;
	}
}

.selectbox__selected {
	position: relative;
	display: block;
	float: left;
	border-bottom: 1px solid globals.$color-gray35;
	background-color: transparent;
	height: 40px;
	line-height: 40px;
	width: 100%;
	padding: 5px 30px 0 3px;
	color: globals.$color-gray60;
	font-size: 1rem;
	margin-top: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	cursor: default;
	user-select: none;
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

.selectbox__optionlist {
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
}

.selectbox__option {
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