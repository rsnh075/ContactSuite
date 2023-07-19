<script setup lang="ts">

import ListViewer from "../uielements/ListViewer.vue";
import { IPCCCConfigurator } from "../../ipccc/js/configurator";
import { useStore } from 'vuex';
import { ref } from "@vue/reactivity";
import { inject, onMounted, onUnmounted } from "@vue/runtime-core";
import BoxProps, { ModalType } from '../../types/BoxProps';
import RestapisView from "./RestapisView.vue";

const store:object | any = useStore(),
	selectedCustomerId	= ref(-1),
	rawList				= ref([]),
	displayList			= ref([]),
	searchStr			= ref(""),
	modulename			= "rest-apis",
	totalItems			= ref(0),
	mutatedRow			= ref(-1),
	headerprops			= ref([]),
	detailData			= ref(null),
	detailVisibility	= ref(false),
	showLoader			= inject('showLoader') as Function,
	showModalDialog		= inject('showModalDialog') as Function,
	thelist				= ref(null),
	detail				= ref(null);

let storeWatch:Function;

const filterList = () => {
	displayList.value = filterListOnString(rawList.value, searchStr.value.toLowerCase());
	totalItems.value = displayList.value.length;
	thelist.value.sortColumn();
};

const filterListOnString = (list, str) => {
	if (str != "") {
		let _rawList = [...list];
		return _rawList.filter((item) => {
			if (item[headerprops.value[0].dataprop].toLowerCase().indexOf(str) != -1 ||
                item[headerprops.value[1].dataprop].toLowerCase().indexOf(str) != -1 ||
                item[headerprops.value[2].dataprop].toLowerCase().indexOf(str) != -1 ||
                item[headerprops.value[3].dataprop].toLowerCase().indexOf(str) != -1
            ) {
				return item;
			}
		});
	} else {
		return [...list];
	}
};

const getListData = (cId) => {
	IPCCCConfigurator.Request(cId, "restconfig", "list", null,	null)
	.then(result => {
		rawList.value = [...result];
		filterList();
		showLoader(false);
	}).catch (error => {
		showLoader(false);
		console.error(error);
	});
};

const openItemDetail = (id) => {
    showLoader(true);
    IPCCCConfigurator.Request(selectedCustomerId.value, "restconfig", "readone", null, id)
    .then(result => {
        detailData.value = result;
    	detail.value.unlocSave();
	    detailVisibility.value = true;
        showLoader(false);
    })
    .catch(e => {
        console.error('Error: ' + e);
        showLoader(false);
    });
};

const closeItemDetail = () => {
	detailVisibility.value = false;
	detailData.value = null;
};

const addItem = () => {
    showLoader(true);
    IPCCCConfigurator.Request(selectedCustomerId.value, "restconfig", "readnew", null, -1)
    .then(result => {
        detailData.value = result[0];
        detailData.value.CustomerId = selectedCustomerId.value;
        detail.value.unlocSave();
	    detailVisibility.value = true;
        showLoader(false);
    })
    .catch(e => {
        console.error('Error: ' + e);
        showLoader(false);
    });
};

const updateList = (item) => {
	return new Promise((resolve, reject) => {
		try {
            let _index = rawList.value.findIndex((i) => i.Id === item.Id);
            if (_index !== -1) {
                rawList.value[_index] = {
                    Id: item.Id,
                    Name: item.Name,
                    Url: item.Url
                };
            } else {
                rawList.value.push({
                    Id: item.Id,
                    Name: item.Name,
                    Url: item.Url
                });
            }
            mutatedRow.value = item.Id;
            resolve('resolved');
        } catch (e) {
            reject(e)
        }
	});
};

const saveItem = (item) => {
	showLoader(true);
	IPCCCConfigurator.Request(selectedCustomerId.value, "restconfig", "save", item, null)
	.then(result => {
		updateList(result)
		.then((resolved) => {
			filterList();
			showLoader(false);
		})
        .catch((error) => console.error(error));
	}).catch(error => {
		showLoader(false);
		showModalDialog(new BoxProps(ModalType.Alert, store.state.settings[modulename].mutationerrorheader, store.state.settings[modulename].mutationerrorbody));
		console.error(error);
	});
	detailVisibility.value = false;
};

const deleteItem = (item) => {
	showLoader(true);
	IPCCCConfigurator.Request(selectedCustomerId.value, "restconfig", "delete", item, null)
        .then(result => {
			let _index = rawList.value.findIndex((i) => i.Id === item.Id);
			if (_index !== -1) {
				rawList.value.splice(_index, 1);
			} else {
				console.error("Item to delete not found");
			}
			filterList();
			showLoader(false);
		}).catch
			(error => {
			showLoader(false);
			showModalDialog(new BoxProps(ModalType.Alert, store.state.settings[modulename].mutationerrorheader, store.state.settings[modulename].deleteerrorbody));
			console.error(error);
		}
	);
	detailVisibility.value = false;
}

onMounted(() => {
	headerprops.value = [
		{
			label: store.state.settings[modulename].listheaders[0],
			width: 25,
			dataprop: "Name",
			sortprop: "Name",
		},{
			label: store.state.settings[modulename].listheaders[1],
			width: 10,
			dataprop: "Id",
			sortprop: "Id",
		},{
			label: store.state.settings[modulename].listheaders[2],
			width: 40,
			dataprop: "Url",
			sortprop: "Url",
		},{
			label: store.state.settings[modulename].listheaders[3],
			width: 25,
			dataprop: "Description",
			sortprop: "Description",
		},
	];

	selectedCustomerId.value = store.getters.getCustomerInfo().selectedCustomerId;
	if (selectedCustomerId.value !== -1) {
		getListData(selectedCustomerId.value);
	}

	storeWatch = store.watch(store.getters.getCustomerInfo, (cObj) => {
		selectedCustomerId.value = cObj.selectedCustomerId;
		getListData(selectedCustomerId.value);
	});

	showLoader(false);
});

onUnmounted(() => {
    storeWatch();
})
</script>

<template>
	<div data-e2e="rest-apis">
		<div class="list-wrapper">
			<div class="list-topbar">
				<div class="list-topbar__content">
					<div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
						<input type="text" id="search" v-model="searchStr" :placeholder="store.state.settings[modulename].searchtxt" @keyup="filterList()" />
					</div>
					<div class="typo-tabletitle">
						{{ totalItems + " " + store.state.settings[modulename].countlabel }}
					</div>
					<div class="grid--push">
						<div class="form-button__secondary form-button__secondary--add grid--push">
							<button @click="addItem()">{{ store.state.settings[modulename].addlabel }}</button>
						</div>
					</div>
				</div>
			</div>
			<ListViewer :headerprops="headerprops" :listdata="displayList" :highlightid="mutatedRow" @rowclick="openItemDetail" ref="thelist" />
			<RestapisView :visibility="detailVisibility" :data="detailData" @cancel="closeItemDetail" @save="saveItem" @delete="deleteItem" ref="detail" />
		</div>
	</div>
</template>
