<template>
	<div :class="[{'grid-unit--beta' : fieldwidth == 'Single'}, {'grid-unit--alpha' : fieldwidth == 'Double'}, getHeightClass(fieldheight)]"></div>
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

import { defineComponent } from 'vue';

export default defineComponent({
	name: 'WhiteSpaceField',
	props: {
		fieldwidth : {
			type     : String,
			default  : ''
		},
		fieldheight : {
			type     : Number,
			default  : '1'
		}
	},
	data: () => {
		return {
			browserLanguage : 'nl',
			defaultheight   : 77,
		}
	},
	methods: {
		getHeightClass(fieldheight) {
			return 'field-height' + fieldheight;
		}
	},
	created() {
		this.browserLanguage  = this.$store.getters.getLang();
	}
})

</script>

<style lang="scss" scoped>
.field-height1 {
	height : 77px;
}
.field-height2 {
	height : 154px;
}
.field-height3 {
	height : 231px;
}
.field-height4 {
	height : 308px;
}
.field-height5 {
	height : 385px;
}

</style>