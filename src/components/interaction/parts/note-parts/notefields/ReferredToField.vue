<template>
<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}]">
	<div class="form-textfield form-textfield--bground">
	<input type="text" name="noteReferrer" :value="currentdata" readonly>
	<label for="noteReferrer" class="form-label form-label--hidden">{{ $store.state.settings.notes.helptextreferredto }}</label>
	</div>
</div>
</template>

<script>
/**
	*
	* select
	* selectedvalue === null triggers default selected
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
	name: 'ReferredToField',
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
		}
	},
	data: () => {
		return {
			browserLanguage : 'nl',
		}
	},
	created() {
		this.browserLanguage  = this.$store.getters.getLang();
	}
}

</script>