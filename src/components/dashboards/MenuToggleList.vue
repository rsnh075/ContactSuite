<template>
	<div data-e2e="menu-toggle-list">
		<div class="menu-toggle-list__icon button__icon" @click.stop="toggleList">&#xF1D9;</div>
		<div v-show="moreOptionsIsVis" class="menu-toggle-list__wrapper" @click.stop="() => {}">
            <div class="menu-toggle-list__header">
                {{ $store.state.settings.queueDashboard.menutogglelistheader }}<a class="menu-toggle-list--close" @click.stop="toggleList"><i>&#xF156;</i></a>
            </div>
            <ul class="menu-toggle-list__body">
                <li v-for="item in list" class="menu-toggle-list__item">
                    <div class="grid-unit--alpha grid-unit--no-padding">
                        <div class="form-togglefield form-togglefield--nomargin">
                            <input type="checkbox" :id="'menutogglelistitem' + item.Id" :name="'menutogglelistitem' + item.Id" v-model="item.Active" @change="toggleActive(item.Id, item.Active)">
                            <label :for="'menutogglelistitem' + item.Id" :data-label="item.Name"></label>
                        </div>
                    </div>
                </li>
            </ul>
		</div>
	</div>
</template>

<script>
import { defineComponent, nextTick } from 'vue'


export default defineComponent({
    name: 'MenuToggleList',
    props: {
		list : {
            type    : Array,
            default : [],
        },
        parentWrapper : {
            type    :HTMLElement,
            default : null,
        }
	},
    data: () => {
      return {
      	moreOptionsIsVis     : false,
      }
    },
    methods: {
    	toggleList() {
	    	this.moreOptionsIsVis = !this.moreOptionsIsVis;
	    },
    	toggleActive(id, activeState) {
        this.list[id].Active = activeState;
        this.$emit('propChanged', this.list);
    	},
    },
    mounted() {
        this.$nextTick(() => {
            if (this.$props.parentWrapper) {
                this.$props.parentWrapper.addEventListener('click', () => this.moreOptionsIsVis = false, false);
            }
        });
    },
    beforeUnmount() {
        if (this.$props.parentWrapper) {
            this.$props.parentWrapper.removeEventListener('click', () => this.moreOptionsIsVis = false, false);
        }
    }
});
</script>
