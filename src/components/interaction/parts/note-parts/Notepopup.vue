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

import { defineComponent } 				from 'vue';
import AutoCompleteInput 				from '../../../uielements/AutoCompleteInput.vue';
import 	{ 	dateToLocal,
			ISOdateTimetoDate,
			dateToLocalTimeHHMMSS
		}								from '../../../../use/dateFunctions';
import ConfirmBox						from '../../../dialogs/Confirm-box.vue';
import { ValidateAsyncDir }				from '../../../../directives/validateasyncformcomponents';
import NotepopupComments 				from './notefields/NotepopupComments.vue';
import TextField						from './notefields/TextField.vue';
import TextAreaField					from './notefields/TextAreaField.vue';
import SelectField						from './notefields/SelectSearchField.vue';
import RadioListField					from './notefields/RadioListField.vue';
import ReferredToField					from './notefields/ReferredToField.vue';
import WhiteSpaceField					from './notefields/WhiteSpaceField.vue';
import {
    Text,
    WindowMinimize,
    ContentCopy
} from 'mdue';
import { IPCCC } from '../../../../ipccc/js/ipccc';

export default defineComponent({
	name : 'NotePopup',
	components: {
		AutoCompleteInput,
		ConfirmBox,
		NotepopupComments,
		TextField,
		TextAreaField,
		SelectField,
		RadioListField,
		ReferredToField,
		WhiteSpaceField,
		WindowMinimize,
		Text,
        ContentCopy
	},
	directives: {
		validateasyncformcomponents : ValidateAsyncDir,
	},
	props: ['visible', 'selectedtemplate', 'notedata', 'haseditabletemplatefields'],
	inject: ['showLoader', 'callOut'],
	emits: ['cancel', 'save', 'delete'],
	data: () => {
    	return {
			screenWidth      : 0,
			showHelp         : false,
			noteData         : null,
			showConfirm      : false,
			commentsSection  : null,
			newComment       : null,
			confirmDelBody   : '',
			popupIsMinimized : false
		}
	},
	computed : {
		niceDate() {
			if(this.noteData) {
				let _d = new Date(this.noteData.Date); //datum/tijd van binnenkomst
				return ISOdateTimetoDate(_d);
			} else {
				return null;
			}
		},
		niceTime() {
			if(this.noteData) {
				let _d = new Date(this.noteData.Date).getTime();
				return dateToLocal(_d);
			} else {
				return null;
			}
		},
		isVisible() {
			return (this.visible === 'new' || this.visible === 'edit');
		},
		cancelIsDelete() {
			return this.haseditabletemplatefields || this.$store.state.unsavedNote.NoteId > -1
		},
        hasNoteDataPhoneNumber() {
            return (this.noteData.Phonenumber && this.noteData.Phonenumber.length > 0);
        },
        noteDataPhoneNumberIsMe() {
            return this.hasNoteDataPhoneNumber && this.stripSip(this.noteData.Phonenumber) == this.stripSip(IPCCC.LoginSession.PhoneNumber);
        },
        incommingNumberNotEmpty() {
            return this.noteData.incommingNumber && this.noteData.incommingNumber.length > 0;
        }
	},
	watch: {
		'notedata' : function(newVal, oldVal) {
			this.noteData = this.notedata;
		},
		'visible' : function(newVal, oldVal) {
			if(newVal == 'edit') {
				if(this.noteData?.Note == '') {
					console.error('Cannot set Commentslist on string: ', this.noteData);
					this.commentsSection = this.newComment = null;
				} else if (this.noteData) {
					this.startEditNote();
				}
                else {
                    //delay 5000 mills once when this.noteData is not ready and is null
                    setTimeout(() => {
                        if (this.noteData) {
                            this.startEditNote();
                        }
                    }, 200)
                }
			} else {
				this.commentsSection = this.newComment = null;
			}
			if(this.showLoader) {
				this.$nextTick(() => this.showLoader(false));
			} else {
				this.noteData                       = null;
			}
		},
	},
	methods: {
		startEditNote() {
			this.noteData.Note.CommentsList = this.noteData.Note.CommentsList ? this.noteData.Note.CommentsList : [];
			this.newComment                 = '',
			this.commentsSection            = 'NotepopupComments';
		},
		callNumber(_nr) {
			if(this.$store.state.commands.Callout) {
				this.callOut(_nr);
			}
		},
		copyNumber(_nr) {
			navigator.clipboard.writeText(_nr);
		},
        stripSip(rawNr) {
            return rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;
        },
		hideConfirm() {
			this.showConfirm = false;
		},
		bindLanguageValue(val) {
			this.noteData.Language = val;
		},
		shakeIt() {
			if(this.$refs.notepopup) {
			this.$refs.notepopup.classList.add('detailscreen--shake');
			setTimeout(() => {
				this.$refs.notepopup.classList.remove('detailscreen--shake');
			}, 1000);
			}
		},
		displayHelp() {
			this.showHelp = !this.showHelp;
		},
		toggleNotePopup() {
			this.popupIsMinimized = !this.popupIsMinimized;
		},
		saveNote() {
			if(!this.noteData) return;

			delete this.noteData.screenTime;
			delete this.noteData.screenDate;

			//Handle CommentsList
			if(this.visible == 'edit' && this.newComment && this.newComment !== '') {
			    this.noteData.Note.CommentsList.push(this.handleNewCommentForSave());
			} else if(this.visible == 'edit' && this.haseditabletemplatefields) {
			    this.newComment = 'notitie aangepast';
			    this.noteData.Note.CommentsList.push(this.handleNewCommentForSave());
			}

			//Name is used as subject
			let _fieldwithsubject    = this.selectedtemplate.Template.FieldMappings.find(field => field.fieldissubject == true);
			this.noteData.Name       = _fieldwithsubject && this.noteData.Note[_fieldwithsubject.fieldproperty] ? this.noteData.Note[_fieldwithsubject.fieldproperty] : '';
			this.noteData.TemplateId = this.selectedtemplate.Id;

			//Note has to be checked on values to determine if Note should be saved as empty
			// console.log('should be made empty', this.checkEmptyNoteObj(this.noteData.Note));
			this.noteData.Note       = this.checkEmptyNoteObj(this.noteData.Note) ? '' : JSON.stringify(this.noteData.Note);

			this.$emit('save', this.noteData);
		},
		onCancel() {
			if(this.cancelIsDelete) {
			    this.confirmDelBody = '<p>' + this.$store.state.settings.notes.deletenoteoncancelconformationtext + '<p>'
			    this.showConfirm    = true;
			} else {
			    this.$emit('cancel');
			}
		},
		onDelete() {
			this.confirmDelBody = '<p>' + this.$store.state.settings.notes.deletenoteconformationtext + '<p>'
			this.showConfirm    = true;
		},
		deleteNote() {
			delete this.noteData.screenTime;
			delete this.noteData.screenDate;
			this.noteData.Note = JSON.stringify(this.noteData.Note);
			this.$emit('delete', this.noteData);
			this.hideConfirm();
		},
		propChanged(propname, val) {
			this.noteData.Note[propname] = val;
		},
		commentChanged(val) {
			this.newComment = val;
		},
		getCurrentData(ismetadata, propname) {
			if(this.showLoader) this.showLoader(false);
			    let _currentValue = '';
			if(ismetadata) {
			    _currentValue = this.noteData[propname] !== null ? this.noteData[propname] : null;
			} else {
			    _currentValue = this.noteData.Note[propname] !== null ? this.noteData.Note[propname] : null;
			}
			return propname ? _currentValue : null;
		},
		handleNewCommentForSave() {
			let _commentBy     = this.$store.state.loginSession.Details.FullName,
				_commentDate   = ISOdateTimetoDate(new Date()),
				_commentTime   = dateToLocalTimeHHMMSS(new Date()),
				_newComment    = {
				'commentBy'     : _commentBy,
				'commentISOstr' : new Date().toISOString(),
				'commentDate'   : _commentDate,
				'commentTime'   : _commentTime,
				'commentTxt'    : this.newComment
				};
			return _newComment;
		},
		checkEmptyNoteObj(notedata) {
			// console.log('<- 1', notedata && notedata.constructor === Object && Object.keys(notedata).length == 0 && notedata.CommentsList == null);
			// console.log('<- 2', notedata && notedata.constructor === Object && Object.keys(notedata).length > 0 && Object.values(notedata).filter(val => val !== '' || (Array.isArray(val) && val.length == 0)).length == 0 && notedata.CommentsList == null && notedata.Note == null);
			// console.log('<- 3', notedata.Note !== null && notedata.Note == '' && notedata.CommentsList == null);
			return (
			(notedata && notedata.constructor === Object && Object.keys(notedata).length == 0 && notedata.CommentsList == null) ||
			(notedata && notedata.constructor === Object && Object.keys(notedata).length > 0 && Object.values(notedata).filter(val => val !== '' || (Array.isArray(val) && val.length == 0)).length == 0 && notedata.CommentsList == null) ||
			(notedata.Note !== null && notedata.Note == '' && notedata.CommentsList == null)
			)
		}
	},
	mounted() {
		this.confirmDelBody = '<p>' + this.$store.state.settings.notes.deletenoteconformationtext + '<p>';
	}
})
</script>

<template>
	<teleport to="#note" data-e2e="NotePopup">
		<div :class="['notepopup-wrapper', {'notepopup-wrapper--visable' : isVisible}]" ref="notepopupwrapper">
			<div v-if="noteData != null" :class="['detailscreen', {'notepopup--isminimized' : popupIsMinimized}]" ref="notepopup">
				<div v-if="popupIsMinimized" class="notepopup__minimize notepopup__minimize--expandedclickarea" @click="toggleNotePopup"><Text /></div>
				<div v-else class="notepopup__minimize" @click="toggleNotePopup"><WindowMinimize /></div>
				<!-- <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
				<form @valid="saveNote()" @notvalid="shakeIt()" v-validateasyncformcomponents="{'submitBtns' : 'js-submitbtn--notepopup'}" autocomplete="off" ref="theNoteForm">
					<div class="grid-row">
                        <div class="grid-unit--alpha notepopup-wrapper__title">
                            <h2 v-if="!popupIsMinimized" class="detailscreen__fieldsetheader detailscreen__fieldsetheader--nomargin">{{ $store.state.settings.notes.addheader }}</h2>
                            <div class="noteData__metadata-header">
                                <span class="noteData__metadata--left">
                                    <span v-if="(hasNoteDataPhoneNumber && !noteDataPhoneNumberIsMe) || !incommingNumberNotEmpty" class="noteData__callphonenumber" @click="callNumber(noteData.Phonenumber)">{{ stripSip(noteData.Phonenumber) }}</span>
                                    <span v-if="(hasNoteDataPhoneNumber && !noteDataPhoneNumberIsMe) || !incommingNumberNotEmpty" class="noteData__copyphonenumber" @click="copyNumber(noteData.Phonenumber)"><ContentCopy /></span>
                                    <span v-if="hasNoteDataPhoneNumber && noteDataPhoneNumberIsMe && incommingNumberNotEmpty" class="noteData__callphonenumber" @click="callNumber(noteData.incommingNumber)">{{ stripSip(noteData.incommingNumber) }}</span>
                                    <span v-if="hasNoteDataPhoneNumber && noteDataPhoneNumberIsMe && incommingNumberNotEmpty" class="noteData__copyphonenumber" @click="copyNumber(noteData.incommingNumber)"><ContentCopy /></span>
                                </span>
                                <!-- <span v-if="visible !== 'edit' && noteData.incommingNumber !== null" class="detailscreen__title--right detailscreen__title--small noteData__metadata--right">{{ noteData.incommingNumber }}</span> -->
                                <span v-if="visible === 'edit'" class="noteData__metadata--right">
                                    <span class="header__time">{{ niceTime }}</span>
                                    <span class="header__date">{{ niceDate }}</span>
                                    <span class="header__agent">{{ noteData.Agent }}</span>
                                </span>
                            </div>
                        </div>
					</div>
					<div class="grid-row">
						<component
							v-for="(comp, index) in selectedtemplate.Template.FieldMappings"
							:key="index"
							:is="comp.fieldtype"
							v-bind="comp"
							:currentdata="getCurrentData(comp.metadatafield, comp.fieldproperty)"
							:showhelp="showHelp"
							:haseditabletemplatefields="haseditabletemplatefields"
							:notestatus="visible"
							@propchanged="propChanged"
						></component>
					</div>
					<component
						v-if="noteData.Note.CommentsList !== null"
						:is="commentsSection"
						:commentslist="noteData.Note.CommentsList"
						:newcomment="newComment"
						@commentchanged="commentChanged"
					></component>
					<div class="grid-row">
						<div class="grid-unit--alpha">
							<a v-show="!cancelIsDelete" class="button-primary button-primary--delete" @click="onDelete()">{{ $store.state.settings.notes.deletelbl }}</a>
							<span class="grid--push">
								<a class="button-primary button-primary--gray" @click="onCancel()">{{ $store.state.settings.notes.cancellbl }}</a>
								<a class="button-primary js-submitbtn--notepopup">{{ $store.state.settings.notes.savelbl }}</a>
							</span>
						</div>
					</div>
				</form>
			</div>
			<ConfirmBox
				:status="showConfirm"
				:header="$store.state.settings.notes.deletenoteconformationheader"
				:bodyContent="confirmDelBody"
				:acceptLabel="$store.state.settings.notes.deletelbl"
				:cancelLabel="$store.state.settings.notes.cancellbl"
				@accepted="deleteNote"
				@canceled="hideConfirm"
			/>
		</div>
	</teleport>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";
@use "@/scss/includes/font";

.button-primary.button-primary--gray {
	margin-right: 10px;
}

.notepopup-wrapper {
	pointer-events: none;
	position: absolute;
	z-index: 4000;
    top: 100vh;
	bottom: 0;
    width: 100%;
	transition: top .15s ease-in-out;
}

.notepopup-wrapper--visable {
	top: 80px;
	.detailscreen {
		padding-top: 2rem;
		margin-top: 4.7rem;
		opacity: 1;
		pointer-events: all;
		overflow-y: auto;
	    max-height: calc(100% - 80px);
		transition: margin-top .15s ease-in-out;
		transition: margin-left .15s ease-in-out;
		box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.16), 0px 1px 22px 0px rgba(0,0,0,0.42);
		.notepopup__minimize {
			position: absolute;
			right: 1rem;
			top: .6rem;
			width: 2rem;
			height: 2rem;
			text-align: center;
			cursor: pointer;
			z-index: 10;
			svg {
				font-size: 1.5rem;
				fill: globals.$color-interaction;
			}
		}
		&.notepopup--isminimized {
			background-color: #FAFAFA;
			min-width: 14rem;
			width: 14rem;
			overflow-y: hidden;
			margin-top: calc(100vh - 122px);
			// margin-left: calc(100vw - 256px);
            margin-left: 490px;
			.notepopup__minimize--expandedclickarea {
				width: 100%;
                text-align: end;
                position: absolute;
                left: 0;
                top: 0;
                height: 40px;
                padding: 9px;
			}
		}
	}
}

.form-textarea--note textarea {
	height: 240px;
	box-shadow: inset 0 -240px 0px 0px rgba(0, 0, 0, 0.025);
	padding-left: 10px;
	padding-right: 10px;
}

.header__date,
.header__time,
.header__agent {
	color: globals.$color-gray40;
	font-size: .85em;
	font-family: 'Open Sans SemiBold', sans-serif;
	&:before {
        content: '\FDFB';
        display: inline-block;
        padding: 0 5px 0 10px;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        color: globals.$color-gray20;
        font-size: 1.1em;
	}
}

.header__time {
	&:before {
	content: '\F150';
	}
}
.header__agent {
	&:before {
	content: '\F2CE';
	}
}

//Overrule cs
h2.detailscreen__fieldsetheader.detailscreen__fieldsetheader--nomargin {
    position: absolute;
    inset: -21px 0 0 0;
    padding: 0 0px 35px 0;
}

.noteData__metadata-header {
    display: flex;
    padding-top: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid globals.$color-gray40;
    .noteData__metadata--left {
        display: flex;
        width: 35%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .noteData__callphonenumber {
            // background-color: transparent;
            // transition: background-color 0.1s ease-in-out;
            color: globals.$color-blue;
            font-family: 'Open Sans SemiBold';
            // transition: padding-right 0.05s ease-in-out;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
            // &:after {
            //     content: "\F3F2";
            //     position: absolute;
            //     top: -1000px;
            //     right: 42px;
            //     color: transparent;
            //     transition: color 0.1s linear;
            //     padding: 0 0 0 .4rem;
            // }
            // &:hover {
            //     // background-color: globals.$color-lightblue;
            //     padding-right: 52px;
            //     &:after {
            //         top: 0;
            //         content: "\F3F2";
            //         color: globals.$color-blue;
            //         font-family: 'Material Design Icons';
            //         font-weight: normal;
            //     }
            // }
        }
        .noteData__copyphonenumber {
            position: relative;
            height: 100%;
            width: 40px;
            color: globals.$color-gray40;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            svg {
                transition: top 0.1s linear;
                position: absolute;
                top: 2px;
            }
            &:active svg {
                top: 4px;
            }
        }
    }
    .noteData__metadata--right {
        text-align: end;
        width: 65%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}


</style>