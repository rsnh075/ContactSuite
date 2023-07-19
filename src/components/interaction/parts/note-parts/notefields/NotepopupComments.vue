<template>
	<div class="comments-section">
		<div class="grid-row grid-row--no-padding" v-for="(comment, index) in commentslist" :key="index">
			<div class="grid-unit--alpha">
				<label class="typo-input-label typo-input-label--h20">
					{{ $store.state.settings.notes.commentbydatetime[0] }}
					<b>{{ comment.commentBy }}</b>
					{{ $store.state.settings.notes.commentbydatetime[1] }}
					<b>{{ comment.commentDate }}</b>
					{{ $store.state.settings.notes.commentbydatetime[2] }}
					<b>{{ comment.commentTime }}</b>
				</label>
				<div class="typo--paragraph--medium">{{ comment.commentTxt }}</div>
			</div>
		</div>
		<div class="grid-row">
			<h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.notes.newcommentheader }}</h2>
		</div>
		<div class="grid-row">
			<div class="grid-unit--alpha">
				<div class="form-textarea form-textarea--comment">
					<textarea :value="newcomment" @change="modifyVal($event)"></textarea>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 *
 */


export default {
	name: "NotepopupComments",
	props: ['commentslist', 'newcomment'],
	methods: {
		modifyVal(evt, propname) {
			this.$emit('commentchanged', evt.target.value);
		}
	}
}
</script>

<style lang="scss" scoped>

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.form-textarea--comment textarea {
	height: 77px;
	font-size: 0.85rem;
	box-shadow: inset 0 -240px 0px 0px rgba(0, 0, 0, 0.025);
	padding-left: 10px;
	padding-right: 10px;
}

.comments-section .typo--paragraph--medium {
	padding-left: 3px;
	color: globals.$color-gray60;
}

</style>