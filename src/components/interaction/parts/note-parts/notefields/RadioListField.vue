<template>
	<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}]">
		<label class="form-label form-label--list-inline">{{ fieldlabel[browserLanguage] }}</label>
		<div v-if="fieldlistradio[0]" class="form-radio-small form-radio-small--inline">
			<input type="radio" :id="fieldproperty + 'radio_one'" :name="fieldproperty + 'radio'" :value="fieldlistradio[0].radiovalue" v-model="dummyData" :disabled="isReadOnly">
			<label :for="fieldproperty + 'radio_one'">{{ fieldlistradio[0].radiolabel }}</label>
		</div>
		<div v-if="fieldlistradio[1]" class="form-radio-small form-radio-small--inline">
			<input type="radio" :id="fieldproperty + 'radio_two'" :name="fieldproperty + 'radio'" :value="fieldlistradio[1].radiovalue" v-model="dummyData" :disabled="isReadOnly">
			<label :for="fieldproperty + 'radio_two'">{{ fieldlistradio[1].radiolabel }}</label>
		</div>
		<div v-if="fieldlistradio[2]" class="form-radio-small form-radio-small--inline">
			<input type="radio" :id="fieldproperty + 'radio_three'" :name="fieldproperty + 'radio'" :value="fieldlistradio[2].radiovalue" v-model="dummyData" :disabled="isReadOnly">
			<label :for="fieldproperty + 'radio_three'">{{ fieldlistradio[2].radiolabel }}</label>
		</div>
		<div v-if="fieldlistradio[3]" class="form-radio-small form-radio-small--inline">
			<input type="radio" :id="fieldproperty + 'radio_four'" :name="fieldproperty + 'radio'" :value="fieldlistradio[3].radiovalue" v-model="dummyData" :disabled="isReadOnly">
			<label :for="fieldproperty + 'radio_four'">{{ fieldlistradio[3].radiolabel }}</label>
		</div>
		<div v-if="isRequired(fieldrequired)" class="hidden-validation">
			<input type="hidden" :value="dummyData" data-validate="isNotEmpty" :data-message="$store.state.settings.notes.validatefieldmessage">
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
	name: 'RadioListField',
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
			type     : String,
			default  : ''
		},
		fieldlistradio : {
			type     : Array,
			default  : []
		},
		currentdata : {
			type    : String,
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
			dummyData       : null,
		}
	},
	computed: {
		isReadOnly() {
			return this.notestatus == 'edit' && !this.haseditabletemplatefields;
		}
	},
	watch: {
		dummyData: function(newVal, oldVal) {
			if(newVal != oldVal) {
			this.$emit('propchanged', this.fieldproperty, newVal);
			}
		}
	},
	methods: {
		isRequired(bool) {
			if(this.notestatus == 'edit' && !this.haseditabletemplatefields) return false;
			return bool;
		}
	},
	created() {
		this.browserLanguage  = this.$store.getters.getLang();
	},
	mounted() {
		this.dummyData = this.currentdata;
	}
}

</script>
