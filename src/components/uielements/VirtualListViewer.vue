<script lang="ts">

  /**
   *
   * select
   * @info
   * All listitems must have the same height to render correctly
   * Styles applied to the listitems from the parent component are not applied to the listitems in the virtualList when the styles are scoped
   *
   * @author Erik Rosenhart
   *
   * @version 1.0
   *
   * Fix: Initial render of virtualList
   * Fix: no contentwrapperclass
   * Fix: Empty list render error
   * Fix: on viewportresize virtualList becomes empty while list is not
   * Fix: when reaching the bottom of the list on a zoomed window (eg 67%) the list is set back by (chunck * numberofrows
   * @todo
   *
   */

import {
        defineComponent,
        onMounted,
        onBeforeUnmount,
        watch,
        ref,
        nextTick
        }                 from 'vue';

export default defineComponent({
    name : 'VirtualListViewer',
    props : {
        data: {
            type    : Array,
            default : [],
        },
        rowClasses : {
            type    : String,
            default : '',
        },
        contentWrapperClass : {
            type    : String,
            default : 'contentwrapperclass',
        }
    },
    setup(props) {
        const virtualList           = ref<Object[]>([]),
            startIndex              = ref<number>(0),
            virtualListWrapper      = ref<HTMLElement>(null),
            virtualContent          = ref<HTMLElement>(null);


        let list                    = ref([...props.data]),
            rowheight:number        = 0,
            rowwidth:number         = 0,
            resizeObserver          = null;

        const getNextChunk = (from, to, numberOfRowsInChunk) => {
            if (list.value.length > numberOfRowsInChunk && to > list.value.length) {
                to -= 1;
            }
            if (list.value.length > numberOfRowsInChunk && from + numberOfRowsInChunk > list.value.length) {
                from -= 1;
            }
            virtualList.value = [...list.value.slice(from, to)];
        };

        const virtualScroll = () => {

            const calcMetrics = () => {
                let _scrollPosition       = rowheight == 0 ? 0 : (virtualListWrapper.value.scrollTop / rowheight) * rowheight,
                    _numberOfColumns      = rowwidth == 0 ? 0 : Math.floor(virtualListWrapper.value.offsetWidth / rowwidth),
                    _viewportHeight       = virtualListWrapper.value.offsetHeight,
                    _contentHeight        = rowheight == 0 ? 0 : (list.value.length * rowheight) / _numberOfColumns,
                    _chunkSize            = rowheight == 0 ? 0 : (_viewportHeight < rowheight) ? Math.floor(window.innerHeight / rowheight) + 0 : Math.floor(_viewportHeight / rowheight) + 0,
                    _marginBottom         = _contentHeight - (_scrollPosition + (_chunkSize * rowheight));

                startIndex.value          = rowheight == 0 ? 0 : Math.ceil(_scrollPosition / rowheight) * _numberOfColumns;

                if (list.value.length > (_chunkSize * _numberOfColumns) && _marginBottom < 0) {
                    _scrollPosition = _scrollPosition - Math.abs(_marginBottom);
                    _marginBottom = 0;
                }

                virtualContent.value.style.margin = `${_scrollPosition}px 0 ${_marginBottom}px 0`;

                getNextChunk(startIndex.value, startIndex.value + (_chunkSize * _numberOfColumns), (_chunkSize * _numberOfColumns));

                //   console.log('_chunkSize', _chunkSize);
                //   console.log('_numberOfColumns', _numberOfColumns);
                //   console.log('rowheight', rowheight);
                //   console.log('scrollTop', virtualListWrapper.value.scrollTop);
                //   console.log('offsetHeight', virtualListWrapper.value.offsetHeight);
                //   console.log('scrollHeight', virtualListWrapper.value.scrollHeight);
                //   console.log('getClientRects.height', Math.floor(virtualListWrapper.value.getClientRects()[0].height));
                //   console.log('scrollTop + getClientRects.height', Math.floor(virtualListWrapper.value.scrollTop + virtualListWrapper.value.getClientRects()[0].height));
                //   console.log('->' + startIndex.value + ' tot ' + (startIndex.value + (_chunkSize * _numberOfColumns)) + ' van ' + list.value.length + " (" + _numberOfColumns + ")");

            };

            if(rowheight <= 0 && list.value.length > 0) {
                getRowHeight()
                .then(value => {
                    rowheight         = value.h;
                    rowwidth          = value.w;
                    calcMetrics();
                })
                .catch(e => { console.error('Error: ', e); });
            } else {
                calcMetrics();
            }
        };

        const getRowHeight = async () => {
            virtualList.value = [];
            virtualList.value.push( list.value[0] );
            await nextTick();
            let _dim = window.getComputedStyle(virtualContent.value.children[0]);
            virtualList.value = [];
            return {
                h : parseInt(_dim.height.replace('px', '')),
                w : parseInt(_dim.width.replace('px', ''))
            };
        };

        watch(() => [...props.data], (newVal, oldVal) => {
            list.value = newVal;
            virtualScroll();
        }, {deep: true});

        onMounted(() => {
            virtualListWrapper.value.addEventListener("scroll", virtualScroll, { passive: true });
            window.addEventListener('resize', virtualScroll, false);

            resizeObserver = new ResizeObserver(entries => {
            rowheight = 0;
            rowwidth = 0;
            clearTimeout(virtualScroll._tId);
            virtualScroll._tId = null;
            if(entries[0].contentRect.width > 0)
                virtualScroll._tId = setTimeout(virtualScroll, 200);
            });

            resizeObserver.observe(virtualContent.value);

            if(props.data.length > 0) virtualScroll();
        });

        onBeforeUnmount(() => {
            resizeObserver = null;
            virtualListWrapper.value.removeEventListener("scroll", virtualScroll, false);
            window.removeEventListener('resize', virtualScroll, false);
        });

        return {
            virtualList, list,
            virtualListWrapper, virtualContent,
            startIndex
        }
    }
})
</script>

<template>
    <div ref="virtualListWrapper" data-e2e="virtual-list-viewer">
        <div :class="contentWrapperClass" ref="virtualContent">
            <div v-for="(rowValues, index) in virtualList" :class="rowClasses">
                <slot :row="rowValues" :index="startIndex + index"/>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .contentwrapperclass {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: flex-start;
        & > div {
            width: 100%;
        }
    }
</style>