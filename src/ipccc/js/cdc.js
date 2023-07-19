import { IPCCCManager, IPCCCMessageTypes } from './manager.js';

class CDC {
    static GetContactReasons = () => {
        return IPCCCManager.SendMessage(IPCCCMessageTypes.GetContactReasons);
    }

    static SetCDC = (recordingId, category, subcategory, reason) => {
        var cdc =
        {
            RecordingId: recordingId,
            Category: category,
            SubCategory: subcategory,
            Reason: reason
        };

        return IPCCCManager.SendMessage(IPCCCMessageTypes.SetCDC, cdc);
    }
}

export { CDC };