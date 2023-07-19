<script lang="ts">
export default {
	inheritAttrs: false,
	customOptions: {
		name: "NotesAddNote"
	}
}
</script>

<script setup lang="ts">

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

import { ref }                        from '@vue/reactivity';
import { onMounted, computed, watch } from '@vue/runtime-core';
import { useStore }					          from 'vuex';
import { ValidateDir as vValidate }	  from '../../../../directives/validate';
import SelectSearchFlyOut      		    from '../../../uielements/SelectSearchFlyOut.vue';

const props = defineProps(['visible', 'rgtemplatelist', 'selectedrgid', 'searchvalue']);
const emit = defineEmits(['setroutinggroupid', 'addnote', 'close']);
const store:object | any = useStore(),
	  searchValue   = ref(''),
	  okToSave      = computed(() => searchValue.value?.length > 2);

watch(() => props.searchvalue, (newVal, oldVal) => {
	searchValue.value = newVal;
});

const checkNumber = () => {
	if(searchValue.value.length == 2 && searchValue.value.charAt(0) == '0') {
		searchValue.value = searchValue.value.charAt(1) == '0' ? '+' : '+31' + searchValue.value.charAt(1);
	}
}

const setRoutingGroupId= (id) => {
	emit('setroutinggroupid', id == null  || id == 'null' ? null : parseInt(id));
}
const addNote = () => {
	if(okToSave) emit('addnote', searchValue.value)
}
const close = () => {
	emit('close');
}

onMounted(() => {
	searchValue.value = props.searchvalue;
});
</script>

<template>
  <div :class="['notes-addnote-wrapper', {'notes-addnote-wrapper--isvisible' : visible}]" id="notes-addnote-wrapper">
    <div class="notes-addnote-header">
      <div class="notes-addnote-close">
        <a class="close--js" @click="close()"><span></span> <span></span></a>
      </div>
      <h2 class="notes-addnote-h2">{{ store.state.settings.notesaddnote.header }}</h2>
    </div>
    <form @valid="addNote()" v-validate="{'submitBtns' : 'js-submitbtn--addnote'}" autocomplete="off">
      <div class="notes-addnote-body">
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="form-textfield form-textfield--bground form-textfield--nopaddingbottom">
              <input type="text" name="formsearchvalue" id="formsearchvalue" v-model="searchValue" @keyup="checkNumber()" data-validate="isNumberOrPlusOrAa" :data-message="store.state.settings.notesaddnote.validatenumber" :placeholder="store.state.settings.notesaddnote.searchvalueplaceholder">
              <label for="formsearchvalue" class="form-label form-label--hidden">{{ store.state.settings.notesaddnote.searchvaluelabel }}</label>
            </div>
          </div>
        </div>
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <div class="typo-input-label typo-input-label--select-search-fly-out">{{ store.state.settings.notesaddnote.callgrouplabel }}</div>
            <SelectSearchFlyOut
              :options="rgtemplatelist"
              :selectedvalue="selectedrgid"
              :defaultlabel="store.state.settings.notesaddnote.selectdefaultrg"
              labelproperty="RoutingGroup"
              valueproperty="RoutingGroupId"
              @changed="setRoutingGroupId"
            />
          </div>
        </div>
      </div>
      <div class="notes-addnote-footer">
        <div class="grid-row">
          <div class="grid-unit--alpha">
            <span class="grid--push">
              <a :class="['button-primary', 'js-submitbtn--addnote', {'button-primary--disabled' : !okToSave}]">{{ store.state.settings.notesaddnote.savelbl }}</a>
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

  .notes-addnote-wrapper {
    border-radius: 3px;
    display: none;
    position: absolute;
    width: 310px;
    background-color: globals.$color-white;
    box-shadow: 0 0 18px 0 rgba(0,0,0,.2);
    z-index: 200;
    top: 56px;
    right: 24px;
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
      right: 37px;
      top: -20px;
    }
  }

  .notes-addnote-header {
    height: 45px;
    .notes-addnote-h2 {
      color: globals.$color-gray80;
      padding: 15px 0 0 20px;
      font-size: 1.3rem;
      line-height: 1.3rem;
    }
    .notes-addnote-close {
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

  .notes-addnote-body {
    line-height: 1rem;
    .form-textfield--bground label,
    .typo-input-label--select-search-fly-out {
      line-height: initial;
    }
  }

  .notes-addnote-footer {
    padding: 10px 0;
  }
</style>