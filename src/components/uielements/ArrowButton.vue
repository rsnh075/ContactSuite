<template>
    <a class="arrow-button" :disabled="disabled" @click=handleClick data-e2e="arrow-button">
        <chevron-up    v-if="orientation === 'vertical'   && !status" />
        <chevron-down  v-if="orientation === 'vertical'   && status"  />

        <chevron-right v-if="orientation === 'horizontal' && !status" />
        <chevron-left  v-if="orientation === 'horizontal' && status"  />
    </a>
</template>

<script lang="ts">
/**
    * Arrow button for open close min max
    * @param orientation:String - horizontal (=default) state false is to right >, vertical state false (=default) is to top ^
    * @param status:Boolean - false default state
    * @param disabled:Boolean - false default state
    * @event click - emits new current status
    *
    * @version 0.1
    * @author Erik Rosenhart
    *
    *
*/

import { ref,
        defineComponent
        }                 from "vue";

import { ChevronUp,
        ChevronLeft,
        ChevronDown,
        ChevronRight,
        }                 from "mdue";


export default defineComponent({
    name : "ArrowButton",
    props : {
        orientation : {
            type: String,
            default: 'horizontal'
        },
        status: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    components: {
        ChevronUp,
        ChevronDown,
        ChevronLeft,
        ChevronRight
    },
    emits: ['click'],
    setup(props, { emit }) {
        const currentStatus = ref<boolean>(props.status);

        const handleClick = (evt:Event):void => {
            if (props.disabled) {

            } else {
                currentStatus.value = !currentStatus.value;
                emit('click', currentStatus.value);
            }
        }

        return {
            handleClick
        }
    }
});

</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals";

.arrow-button {
    width: 40px;
    height: 40px;
    display: block;
    cursor: pointer;
    svg {
        width: 32px;
        height: 32px;
        margin: 4px;
        fill: globals.$color-gray40;
    }
    &:disabled {
        svg {
            fill: globals.$color-gray20;
        }
    }
}

</style>