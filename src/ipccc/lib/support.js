import { Logging, LoggingLevel, LogEntry } from './logging.js';

class Support {
    static CurrentLocation;
    static Information = new Object();

    static SetInformation =
        (label, value) => {
            Support.Information[label] = value;
        }

    static RemoveInformation =
        (label) => {
            if (Support.Information[label]) {
                delete Support.Information[label];
            }
        }

    static ClearInformation =
        () => {
            Support.Information = new Object();
        }

    static SetLocation =
        (location, info = "") => {
            if (location) {
                if (location != Support.CurrentLocation) {
                    Support.CurrentLocation = location;

                    var logInfo = `[[[ ${location} ]]]`;
                    if (info) {
                        logInfo += ` : ${info}`;
                    }

                    Logging.WriteAlways(logInfo);
                }
            } else return Support.CurrentLocation;
        }

    static Init = debug => {
        if (debug) {
            window.Support = Support;
        }
        window.addEventListener("keydown",
            ({ key, ctrlKey, metaKey, repeat }) => {
                if (!repeat && ((metaKey || ctrlKey) && key === '/')) {
                    Support.Open();
                }
            });
        }

    static Open =
        () => {
            var w = (msg) => Logging.WriteMessage(LoggingLevel.Info, msg);

            // w("=========================================");
            // w(`== SUPPORT REQUESTED @ ${Support.CurrentLocation} ==`);
            // w("=========================================");
            // w("== Information ==");
            // w("=========================================");
            // for (const [key, value] of Object.entries(Support.Information)) {
            //     w(`${key}: ${value}`);
            // }
            // w("=========================================");
            // w("== ConsoleLog ==");
            w("=========================================");
            Logging.History.map(
                e => {
                    e.Write();
                });
            w("=========================================");
        }
}

Support.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { Support };