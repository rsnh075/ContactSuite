import { getUniqueId } from '../use/helperFunctions';

export enum ModalType {
    Generic = 0,
    Alert = 1,
    Message = 2,
    Confirm = 3
}

export default class BoxProps {
    type = ModalType.Alert;
    uniqueid = '';
    header = '';
    message = '';
    confirmFn = null;
    cancelFn = null;
    show = true;
    hideBg = false;
    buttonLabels = {
        okLabel : 'Ok',
        cancelLabel : 'Cancel'
    }

    /**
     * @type: ModalType
     * @header: string
     * @message: string
     */
    constructor(type: ModalType = ModalType.Alert, header: string = '', message: string = '') {
        this.uniqueid = getUniqueId();
        this.type = type;
        this.header = header;
        this.message = message;
    }
}
