<template>
  <loader v-if="loading" :message="loadermsg"/>
  <div v-for="(component, index) in tabComponents" :class="['content-wrapper', {'content-wrapper--active' : (index === activeIndex)}]" :key="index" :data-e2e="component.name">
    <component :is="activeComponent[index]" :tabprops="activeComponentProps[index]" :isactive="tabVisability[index]" />
  </div>
</template>

<script lang="ts">
  /**
  /* Tab content wrapper
  /* @param {Array.<{name:String}>} - name of the componetn to load in the wrapper
  /*
  /*
  /* @version 0.1
  /* @author Erik Rosenhart
  /*
  /* @todo
  /*
  */


import {
        defineComponent,
        ref,
        shallowRef,
        watch,
        onMounted,
        provide,
    }                         from 'vue';

import Loader                 from './../preloader/Loader.vue';


export default defineComponent({
    name: 'TabContentWrapper',
    props : {
        tabComponents: {
            type: Array,
            default: []
        },
        activeIndex: {
            type: Number,
            default: 0
        }
    },
    components: {
        Loader
    },
    setup(props) {
        const activeComponent           = shallowRef<object[]>([]),
                activeComponentProps    = ref<object[]>([{}]),
                loading                 = ref<boolean>(false),
                loadermsg               = ref<string>('Loading'),
                tabVisability           = ref(new Array(props.tabComponents.length));

        const toggleLoader = (status:boolean):void => {
            loading.value = status;
        }

        provide('toggleLoader', toggleLoader);

        const switchTab = (index:number):void => {
            if(index > -1 && !activeComponent.value[index]) {
                loadermsg.value                    = `Loading ${props.tabComponents[index].name}`;
                toggleLoader(true);
                activeComponent.value[index]       = props.tabComponents[index].component;
                // activeComponentProps.value[index]  = computed(() => props.tabComponents[index].props);
                activeComponentProps.value[index]  = props.tabComponents[index].props;
            }
            tabVisability.value[index]         = true;
        };

        watch(() => props.activeIndex, (newIndex, oldIndex) => {
            if(newIndex !== oldIndex) {
                tabVisability.value[oldIndex]  = false;
                switchTab(newIndex);
            }
        });

        onMounted(() => {
            tabVisability.value.fill(false);
            switchTab(props.activeIndex);
        });

        return {
            activeComponent,
            activeComponentProps,
            loading,
            loadermsg,
            tabVisability
        }
    }
});

</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals";

.content-wrapper {
    position: absolute;
    top: 0;
    right: 100%;
    bottom: 0;
    left: -100%;
    // transition: left .2s ease-in-out,
    //             right .2s ease-in-out;
    background-color: globals.$color-white;
    &--active {
        left: 0;
        right: 0;
        z-index: 3;
    }
}


</style>