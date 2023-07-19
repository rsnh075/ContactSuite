<template>
	<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}]">
		<div class="notetextareafield">
			<label>{{ fieldlabel[browserLanguage] }}</label>
			<textarea :class="[getHeightClass(fieldheight)]" :value="currentdata" @keyup="modifyVal($event, fieldproperty)" :readonly="isReadOnly" :data-validate="isRequired(fieldrequired)" :data-message="$store.state.settings.notes.validatefieldmessage"></textarea>
		</div>
	</div>
</template>

<script>
/**
 *
 * select
 * selectedvalue === null triggers default selected
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
	name: 'TextAreaField',
	props: {
		fieldwidth : {
			type     : String,
			default  : ''
		},
		fieldlabel : {
			type     : Object,
			default  : ''
		},
		fieldproperty : {
			type    : String,
			default : ''
		},
		fieldprefilledtext : {
			type    : String,
			default : ''
		},
		currentdata : {
			type    : String,
			default : ''
		},
		fieldheight : {
			type    : Number,
			default : ''
		},
		notestatus : {
			type    : String,
			default : ''
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
		modifyValWithPrefilledText() {
			this.$emit('propchanged', this.fieldproperty, this.fieldprefilledtext);
		},
		getHeightClass(fieldheight) {
			return 'fieldheight' + fieldheight;
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
		if(this.notestatus == 'new' && this.currentdata.length == 0 && this.fieldprefilledtext.length > 0) this.modifyValWithPrefilledText();
	}
}

</script>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.notetextareafield {
	position: relative;
	margin-top: 5px;
	padding-bottom: 4px;
	label {
		position: absolute;
		top: 2px;
		padding-left: 3px;
		padding-bottom: 4px;
		width: 100%;
		font-family: 'Open Sans SemiBold', sans-serif;
		font-size: 0.7rem;
		color: globals.$color-gray35;
		overflow: hidden;
	}
	textarea {
		margin-top: 22px;
		margin-bottom: -4px;
		padding-left: 10px;
		padding-right: 10px;
		padding-top: 5px;
		width: 100%;
		font-family: 'Open Sans Regular', sans-serif;
		line-height: 1.5rem;
		font-size: 0.85rem;
		color: globals.$color-gray60;
		border: none;
		border-bottom: 1px solid globals.$color-gray35;
		background-color: transparent;
		resize: none;
		&:read-only {
			border-bottom-color: transparent;
		}
	}
}

.fieldheight1 {
	box-shadow: inset 0 -30px 0px 0px rgba(0,0,0,.025);
	height : 30px;
}
.fieldheight2 {
	box-shadow: inset 0 -107px 0px 0px rgba(0,0,0,.025);
	height : 107px;
}
.fieldheight3 {
	box-shadow: inset 0 -184px 0px 0px rgba(0,0,0,.025);
	height : 184px;
}
.fieldheight4 {
	box-shadow: inset 0 -261px 0px 0px rgba(0,0,0,.025);
	height : 261px;
}
.fieldheight5 {
	box-shadow: inset 0 -338px 0px 0px rgba(0,0,0,.025);
	height : 338px;
}

</style>