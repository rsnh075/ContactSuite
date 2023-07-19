<template>
  <div class="list-content-wrapper" data-e2e="list-viewer">
    <div class="list-content--back">
      <div class="list-content--header">
        <div class="list-content__row--header">
          <ExportListToXLSX
          :data="sortedData"
          :customBtnStyles="exportListBtnStyles"
          :customWrapperStyles="exportListWrapperStyles"
        />
          <span v-for="(headitem, index) in headerprops" :key="index" class="list-content__row-cell" :style="setColwidth(index)" @click="sortColumn($event, headitem.sortprop)" data-sortorder="NONE" v-html="headitem.label" :ref="setHeadRefs"></span>
        </div>
      </div>
      <div class="list-content" ref="scroller">
        <ol @click="handleRowClick">
          <li v-for="rows in sortedData" :key="rows.Id" class="list-content__row list-content__row--clickable" :data-id="rows.Id" :data-changed="rows.Id === highlightid ? 1 : 0" :data-editable="1">
            <span v-for="(col, i) in headerprops" :key="i" :style="setDataColumn(i, col.dataprop)" :class="['list-content__row-cell', { 'list-content__row-cell--font-icon': valueIsIcon(rows[col.dataprop]) }]" v-html="rows[col.dataprop]"></span>
            <span v-if="hascontextmenu" class="list-content__row-cell--contextmenu" @click.stop="handleContextMenuClick($event, rows.Id)">&#xF1D9;</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>

import { dynamicSort }      from '../../use/sortFunctions';
import ExportListToXLSX      from '../uielements/ExportListToXLSX.vue';

export default {
  name: "ListViewer",
  props: {
    headerprops: {
      type: Array,
      default: [],
    },
    listdata: {
      type: Array,
      default: [],
    },
    rowcomponent: {
      type: String,
      default: "",
    },
    highlightid: {
      type: Number,
      default: -1,
    },
    hascontextmenu: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      sortedData: [],
      sortSetting: {},
      headRefs: [],
      exportListBtnStyles  : {
        top: '9px',
        right: '8px',
        zIndex: 1
      },
      exportListWrapperStyles : {
        top: '9px',
        right: '8px',
      },
    };
  },
  watch: {
    listdata: function (newVal, oldVal) {
      this.sortedData = [...newVal];
    },
  },
  components: {
    ExportListToXLSX
  },
  methods: {
    setHeadRefs(el) {
      if (el) this.headRefs.push(el)
    },
    valueIsIcon(val) {
      return String(val).startsWith("&#x");
    },
    setColwidth(i) {
      return "width:" + this.headerprops[i].width + "%";
    },
    setDataColumn(i, key) {
      let _index = this.headerprops.findIndex((head) => head.dataprop === key);
      return _index !== -1 ? "width:" + this.headerprops[_index].width + "%" : "display:none";
    },
    sortColumn(evt, propToSort) {
      let _order, _target;
      if (typeof evt !== "undefined") {
        _target = evt.target;
        _order = _target.getAttribute("data-sortOrder");
        this.headRefs.forEach((col) => col.setAttribute("data-sortorder", "NONE"));
        this.sortSetting = {
          key: propToSort,
          order: _order,
        };
      } else {
        _order = this.sortSetting.order;
        propToSort = this.sortSetting.key;
      }
      switch (_order) {
        case "NONE":
          if (typeof evt !== "undefined") _target.setAttribute("data-sortOrder", "ASC");
          this.sortedData.sort(dynamicSort(propToSort));
          break;
        case "ASC":
          if (typeof evt !== "undefined") _target.setAttribute("data-sortOrder", "DES");
          this.sortedData.sort(dynamicSort("-" + propToSort));
          break;
        case "DES":
          if (typeof evt !== "undefined") _target.setAttribute("data-sortOrder", "NONE");
          this.sortedData = [...this.listdata];
          break;
      }
    },
    handleRowClick(evt) {
      const _getClickedRowId = (t) => {
        if (t.hasAttribute("data-id")) {
          return t.getAttribute("data-id");
        } else {
          return _getClickedRowId(t.parentElement);
        }
      };

      let _id = _getClickedRowId(evt.target);

      this.$emit("rowclick", _id);
    },
    handleContextMenuClick(evt, id) {
        this.$emit("contextmenuclick", evt, id);
    }
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.list-content__row-cell {
  min-width: auto;
}

[data-changed="1"] {
  background-color: #f0f8ec;
}

.list-content__row-cell--contextmenu {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 43px;
    height: 43px;
    font-family: 'Material Design Icons';
    font-size: 1rem;
    border-radius: 50%;
    text-align: center;
    color: globals.$color-gray35;
    cursor: pointer;
    user-select: none;
    &:hover {
        background-color: globals.$color-gray10;
        // color: globals.$color-performance;
    }

}

// [data-editable="1"] {
// }
</style>