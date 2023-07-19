/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @todo
 *
 * @info
 *
 */

import { useStore } from 'vuex';
import BoxProps, { ModalType } from './../types/BoxProps';
import { inject } from 'vue';

export function useHelperFunctions() {
    const store: object | any = useStore(),
        showModalDialog: Function = inject('showModalDialog');

    const clipboardText = async () => {
        return await navigator.clipboard.readText();
    };

    const pasteClicpBoardText = async (def) => {
        let _val = def;
        try {
            return _val = await clipboardText();
        }
        catch(error) {
            showModalDialog(
                new BoxProps(
                    ModalType.Alert,
                    store.state.settings.dialog.dialogalertheader,
                    store.state.settings.dialog.dialogpasteerror
                )
            );
            console.error('Paste error ', error);

            return def;
        }
    }

    return {
        pasteClicpBoardText
    };
}
