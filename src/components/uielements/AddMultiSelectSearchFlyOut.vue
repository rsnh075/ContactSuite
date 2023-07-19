<script>

/**
 *
 * add button and multiselectbox flyout with search
 *
 *  selectBoxConfig : {
        filterProperty       : '',
        title                : ''
    }
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 *
*/

import { dynamicSort }      from '../../use/sortFunctions';
import { coordsElementInViewportFourQuadrants } from '../../use/helperFunctions';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AddMultiSelectSearchFlyOut',
    props: {
      list : {
        type : Array,
        default : () => []
      },
      selectBoxConfig : {
        type : Object,
        default : () => {}
      },
      addBtnReadOnly : {
        type : Boolean,
        default : false
      }
    },
    data: () => {
        return {
            itemList                  : [],
            filteredItemList          : [],
            searchStr                 : '',
            showList                  : false,
            addBtnReadOnlyCondition   : false,
            arrowClass                : '',
            // keyPrefix                : Math.random().toString(32).substring(2, 11) + '_'
        }
    },
    watch: {
        'list': function(newVal, oldVal) {
            this.itemList = [...this.list];
            this.filterList();
        },
        'addBtnReadOnly': function(newVal, oldVal) {
            this.addBtnReadOnlyCondition = this.addBtnReadOnly;
            if(this.addBtnReadOnlyCondition) {
                this.showList = false;
            }
        }
    },
    computed: {
        computeReadOnlyBtnCondition() {
            return !this.readOnlyBtnCondition ? false : true;
        }
    },
    methods: {
        clickedItem(item) {
            this.$emit('addSelected', item);
            this.closeList();
        },
        filterList(action = 'default') {
            if (this.searchStr != '') {
                this.filteredItemList = this.itemList.filter(item => item[this.selectBoxConfig.filterProperty].toLowerCase().indexOf(this.searchStr.toLowerCase()) != -1);
            } else {
                this.filteredItemList = this.itemList;
            }

            this.filteredItemList.sort(dynamicSort(this.selectBoxConfig.filterProperty));
            if(action == 'search') {
                this.$nextTick(() => {
                    this.positionFlyOut();
                });
            }
        },
        toggleList() {
            [].slice.call(document.querySelectorAll('.add-multiselect-search__list-wrapper--show')).forEach(el => el.classList.remove('add-multiselect-search__list-wrapper--show'));
            this.positionFlyOut();
            this.showList = !this.showList;
        },
        closeList() {
            this.searchStr = '';
            this.filterList();
            this.showList = false;
        },
        positionFlyOut() {
            this.$refs.listWrapper.removeAttribute('style');
            this.$refs.listBody.removeAttribute('style');
            let _srcEl             = this.$refs.addButton,
                _targetEl          = this.$refs.listWrapper,
                _pos               = coordsElementInViewportFourQuadrants(_srcEl, _targetEl);
            _targetEl.style.left   = _pos.left + "px";
            _targetEl.style.top    = _pos.top + "px";
            if(_pos.height == _pos.shortenedHeight) {
                _targetEl.style.height = _pos.height + "px";
                this.$refs.listBody.style.height = (_pos.height - 96) + "px";
            } else { //shortened
                _targetEl.style.height = _pos.shortenedHeight;
                this.$refs.listBody.style.height = (_pos.shortenedHeight - 96) + "px";
            }
            _targetEl.style.width  = _pos.width + "px";

            this.arrowClass = _pos.className;
        },
    },
    mounted() {
        this.itemList = [...this.list];
        this.filterList();
        document.querySelector('.detailscreen-wrapper').addEventListener('scroll', () => this.closeList(), false);
    },
    beforeUnmount() {
        if(document.querySelector('.detailscreen-wrapper')) {
            document.querySelector('.detailscreen-wrapper').removeEventListener('scroll', () => this.closeList(), false);
        }
    }
})
</script>

<template>
    <div class="add-multiselect-search__wrapper" data-e2e="add-multi-select-search-fly-out">
        <button type="button" :class="['add-multiselect-search__add-btn', {'add-multiselect-search__add-btn--readonly' : addBtnReadOnlyCondition}]" @click="toggleList()" ref="addButton">&#xF419;</button>
            <div v-show="showList"
            :class="[
                'add-multiselect-search__list-wrapper',
                { 'add-multiselect-search__list-wrapper--show': showList },
                arrowClass
            ]"
            ref="listWrapper"
            id="add-multiselect-search__list-wrapper"
            >
            <div class="add-multiselect-search__list-header">
                <span class="add-multiselect-search__list-title">{{ selectBoxConfig.title }}</span>
                <button type="button" class="add-multiselect-search__list-close-icon" @click="closeList()">&#xF156;</button>
            </div>
            <div class="add-multiselect-search__list-search">
                <input type="text" v-model="searchStr" :placeholder="$store.state.settings.addmultiselectsearchflyout.searchtxt" @keyup="filterList('search')">
            </div>
            <div class="add-multiselect-search__list-body" ref="listBody">
                <ol>
                    <li v-for="item in filteredItemList"
                    @click="clickedItem(item)"
                    :class="[
                        'add-multiselect-search__list-item',
                        {'add-multiselect-search__list-item--selected' : item.selected},
                        {'add-multiselect-search__list-item--disabled' : item.disabled}
                    ]">
                        <span v-if="item.Icon" class="add-multiselect-search__list-item-icon" v-html="item.Icon"></span>
                        {{ item[selectBoxConfig.filterProperty] }}
                    </li>
                </ol>
            </div>
        </div>
    </div>
</template>

<style lang="scss">

@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.add-multiselect-search__wrapper {
    display: block;
}

.add-multiselect-search__list-wrapper {
    display: none;
    position: fixed;
    background-color: globals.$color-white;
    box-shadow: 0 0 18px 0 rgba(0,0,0,.2);
    min-width: 220px;
    max-width: 640px;
    padding: 6px 0 0 0;
    list-style: none;
    border-radius: 3px 3px 0 0;
    z-index: 100;
    &--show {
        display: block;
    }
    &:before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        right: 10px;
        bottom: 100%;
        border: 10px solid transparent;
        border-bottom-color: globals.$color-gray5;
        border-top-color: transparent;
        pointer-events: none;
        z-index: 1;
    }
    &.BottomLeft:before {
        right: 10px;
        bottom: 100%;
        border-bottom-color: globals.$color-gray5;
        border-top-color: transparent;
    }
    &.BottomRight:before {
        left: 10px;
        bottom: 100%;
        border-bottom-color: globals.$color-gray5;
        border-top-color: transparent;
    }
    &.TopLeft:before {
        right: 10px;
        top: 100%;
        border-bottom-color: transparent;
        border-top-color: globals.$color-gray5;
    }
    &.TopRight:before {
        left: 10px;
        top: 100%;
        border-bottom-color: transparent;
        border-top-color: globals.$color-gray5;
    }
}

.add-multiselect-search__list {
    &-header {
        font-weight: bold;
        font-size: 0.8rem;
        color: globals.$color-gray60;
        background-color: globals.$color-gray5;
        margin-top: -6px;
        height: 40px;
        line-height: 31px;
        padding: 6px 0 0 10px;
        border-radius: 3px 3px 0 0;
    }
    &-title {
        color: globals.$color-gray40;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: 'Open Sans SemiBold', sans-serif;
        font-size: 0.9rem;
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
    &-body {
        overflow-y: auto;
        display: block;
    }
    &-item {
        display: block;
        width: 100%;
        padding: 0 10px;
        height: 40px;
        line-height: 40px;
        font-size: .8em;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: globals.$color-gray60;
        &:after {
            display: none;
        }
        &:hover {
            background-color: globals.$color-gray10;
        }
        &--hidden {
            display: none;
        }
        &--selected, &--disabled {
            pointer-events: none;
            color: globals.$color-gray40;
            background-color: globals.$color-gray10;
            .add-multiselect-search__list-item-icon {
            color: globals.$color-gray40;
            }
        }
        &--disabled {
            color: globals.$color-gray30;
            background-color: globals.$color-gray5;
        }
    }
    &-item-icon {
        width: 32px;
        height: 32px;
        color: globals.$color-gray60;
        font-family: 'Material Design Icons';
        // font-weight: bold;
        font-size: 1rem;
        padding-right: 7px;
    }
}

.add-multiselect-search {
    &__add-btn {
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        color: globals.$color-secondary;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 7px, transparent 11px);
        border-radius: 50%;
        text-align: center;
        font-size: 1.45rem;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        transition: color 250ms;
        cursor: pointer;
        z-index: 10;
        &:hover {
            color: globals.$color-warning;
        }
        &--readonly {
            pointer-events: none;
            color: globals.$color-gray20;
        }
    }
    &__list-close-icon {
        float: right;
        width: 22px;
        height: 22px;
        line-height: 22px;
        text-align: center;
        background-color: globals.$color-white;
        border-radius: 50%;
        margin-top: 4px;
        margin-right: 8px;
        cursor: pointer;
        font-family: 'Material Design Icons';
        font-weight: bold;
        font-style: normal;
        font-size: 14px;
        font-size: 0.8rem;
        &:hover {
            box-shadow: inset 0 0 0 1px globals.$color-gray20;
            background-color: globals.$color-gray10;
            color: globals.$color-unavailable;
        }
    }
}

</style>