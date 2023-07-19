import {IPCCCConfigurator} from '../ipccc/js/configurator';
import {defineStore} from 'pinia';
import {computed, ref} from 'vue';

// Really quick Pinia overview: https://www.youtube.com/watch?v=8jYWx4Gjwzk

// create a store
export const useScriptBuilderStore = defineStore('scriptBuilderStore', () => {
    const addModuleId = ref(-1);

    // properties you want to track
    const userVars = ref<string[]>([]);
    const systemVars = ref<string[]>([]);
    const vars = computed(() => [...userVars.value, ...systemVars.value]);
    const requestResults = ref({});

    const init = async (customerId: number, usedVars: string[]) => {
        // user vars are only valid inside the current script
        clear();
        usedVars.forEach(userVar => {
            userVars.value.push(userVar);
        });

        // systemVars don't change, don't have to fetch them again
        if (systemVars.value.length === 0) {
            try {
                systemVars.value = (await IPCCCConfigurator.Request(customerId, 'variables', 'list', null, -1))
                    .map((item) => item.Name);
            } catch (error) {
                console.error('Error getting system vars: ', error);
            }
        }

        // pre-fetch much used lists:
        await fetchListResults(customerId, 'prompts');
        await fetchListResults(customerId, 'scriptbuilderlookup*hangupflow');
    };

    const fetchListResults = async (customerId: number, lookupFunction: string) => {
        if (requestResults.value[lookupFunction] === undefined) {
            requestResults.value[lookupFunction] = [];
        }
        if (requestResults.value[lookupFunction].length === 0) {
            try {
                requestResults.value[lookupFunction] = await IPCCCConfigurator.Request(customerId, lookupFunction, 'list', null, null);
                return requestResults.value[lookupFunction]; // add this line
            } catch (error) {
                console.error(error);
                return [];
            }
        } else {
            return requestResults.value[lookupFunction];
        }
    }

    const clear = () => {
        // system vars don't change, reset not needed
        // user vars change depending on the currently loaded script
        userVars.value = [];
        requestResults.value = {};
    };

    const addUserVar = (newVar: string) => {
        if (userVars.value.findIndex(s => s === newVar) && newVar.trim() !== '') {
            userVars.value.push(newVar);
        }
    };

    const isValidVar = (varValue: string): boolean => {
        const invalid = ['!', '#', '$', ' ']; // invalid START characters
        return !invalid.includes(varValue.substring(0, 1));
    };

    const isNewVarAllowed = (newVar: string) => {
        return userVars.value.find(v => v.toLowerCase().trim() === newVar.toLowerCase().trim()) === undefined;
    };

    return {
        // vars
        addModuleId, vars, userVars,

        // functions
        init, clear, addUserVar, isValidVar, isNewVarAllowed, fetchListResults
    };
});
