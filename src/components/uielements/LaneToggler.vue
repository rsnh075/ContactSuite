<script lang="ts">
export default {
    name : "LaneToggler"
};
</script>

<script setup lang="ts">
/**
 * only used for lanes on the right side of the window
 * bi-state: open - closed
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 * also lanes on the left side of the window
 * try-state: closed - min - max
 */

import {
    ChevronLeft,
    ChevronRight
} from 'mdue';
import { markRaw } from 'vue';
import ComponentModal from '../componentmodal/ComponentModal.vue';

const props = defineProps({
    laneState : {
        type : String,
        default : "",
        required : true
    },
    laneMax : {
        type : String,
        default : "",
        required : true
    },
    laneMin : {
        type : String,
        default : "",
        required : true
    },
    laneIcon : {
        default : null,
        required : false
    }
});

const emits = defineEmits(["setLane"]);

const setLane = (direction) => {
    emits("setLane", direction);
};

const handleIconClick = () => {
    if (props.laneState == props.laneMax) {
        emits("setLane", props.laneMin);
    } else if (props.laneState == props.laneMin) {
        emits("setLane", props.laneMax);
    } else {
        //nothing
    }
};

</script>

<template>
    <div class="lanetoggler-wrapper" data-e2e="lanetoggler">
        <div
        v-if="laneIcon"
        @click="handleIconClick"
        :class="[
            'lanetoggler__icon',
            {'lanetoggler__icon--disabled' : (laneState !== laneMin && laneState !== laneMax)},
        ]"
        >
            <component :is="laneIcon" />

        </div>
        <button class="lanetoggler__left" :disabled="props.laneState.indexOf(props.laneMax) !== -1" data-e2e="lanetoggler-arrow-button-left">
            <ChevronLeft @click="setLane(laneMax)" />
        </button>
        <div class="lanetoggler__divider"></div>
        <button class="lanetoggler__right" :disabled="props.laneState.indexOf(props.laneMin) !== -1" data-e2e="lanetoggler-arrow-button-right">
            <ChevronRight @click="setLane(laneMin)" />
        </button>
    </div>
</template>

<style lang="scss" scoped>

@use "@/scss/includes/font";
@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.lanetoggler-wrapper {
    display: flex;
    justify-content: center;
    height: 100%;
    width: 60px;
    background-color: globals.$color-gray5;
    border-left: 1px solid globals.$color-gray20;
    border-right: 1px solid globals.$color-gray20;
	z-index: 10;
}
.lanetoggler {
    &__icon {
        position: absolute;
        inset: 1px 1px auto 1px;
        height: 60px;
        border-bottom: 1px solid globals.$color-gray10;
        background: globals.$color-white;
        cursor: pointer;
        transition: all .15s ease-in-out;
        svg {
            position: absolute;
            top: -12px;
            left: -12px;
            width: 45%;
            height: 45%;
            margin: 50% 50%;
            font-size: 2rem;
            color: globals.$color-gray20;
            transition: all .15s ease-in-out;
        }
        &:hover {
            svg {
                color: globals.$color-interaction;
            }
        }
        &--disabled {
            &:hover {
                background: #fff0;
                svg {
                    color: globals.$color-gray20;
                }
            }
        }
        &--disabled {
            cursor: initial;
        }

    }
    &__divider {
        position: absolute;
        transform: translateX(-50%);
        width: 1px;
        top: calc(100% - 55px);
        bottom: 10px;
        background-color: globals.$color-gray20;
    }

    &__left,
    &__right {
        position: absolute;
        bottom: 10px;
        svg {
            width: 26px;
            height: 40px;
            fill: globals.$color-gray40;
            cursor: pointer;
        }
        &:disabled {
            svg {
                pointer-events: none;
                fill: globals.$color-gray20;
            }
        }
    }
    &__right {
        right: 1px;
    }
    &__left {
        left: 1px;
    }
}

</style>