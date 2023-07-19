<template>
	<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}]">
		<div class="form-textfield form-textfield--bground">
			<input type="text" :name="fieldlabel[browserLanguage] + 'Textfield'" :value="currentdata" @keyup="modifyVal($event, fieldproperty)" :readonly="isReadOnly" :data-validate="isRequired(fieldrequired)" :data-message="$store.state.settings.notes.validatefieldmessage">
			<label :for="fieldlabel[browserLanguage] + 'Textfield'" class="form-label form-label--hidden">{{ fieldlabel[browserLanguage] }}</label>
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
	name: 'TextField',
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
		currentdata : {
			type    : [String, Number],
			default : ''
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

.form-textfield.form-textfield--bground:read-only {
	border-bottom-color: transparent;
}

</style>