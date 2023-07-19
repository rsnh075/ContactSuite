import { EventDispatcher } from './eventdispatcher.js';
import { dateTimeToLocalDateTimeISO }  from '../../use/dateFunctions';

class LoggingLevel {
    static Unknown = -1; //Nog niet bekend wat er mee te doen
    static Always = 0; //Nog niet bekend maar altijd schrijven naar de console
    static Debug = 1;
    static Info = 2;
    static Warn = 3;
    static Error = 4;
}

class LogEntry {
    constructor(dateTime, type, values) {
        this.DateTime = dateTime;
        this.Type = type;
        this.Values = values;
    }

    TypeString =
        () => {
            switch (this.Type) {
                case LoggingLevel.Debug:
                    return "DBG";
                case LoggingLevel.Warn:
                    return "WARN";
                case LoggingLevel.Error:
                    return "ERR";
                default:
                    return "INFO";
            }
        }

    ToString =
        () => {
            return `[${dateTimeToLocalDateTimeISO(this.DateTime)}] [${this.TypeString()}] ${this.Values[0]}`;
        }

    Write =
        () => {
            Logging.WriteMessage(this.Type, this.ToString());
        }
}

class LogLevelFilter {
    constructor(filter, level = LoggingLevel.Debug) {
        this._reFilter = new RegExp(filter);
        this.Level = level;
    }

    Check =
        (msg) => {
            return this._reFilter.test(msg);
        }
}

class Logging {
    static Written = new EventDispatcher();
    static _LogFunctions;

    static _LevelFilters = new Array();
    static _TimeLabels = {};
    static History = new Array();

    static MaxHistory = 50;
    static Level = LoggingLevel.Error;

    static Init = debug => {
        if (debug) {
            window.Logging = Logging;
        }
        Logging._LogFunctions = {
            Log : console.log,
            Info : console.info,
            Warn : console.warn,
            Error : console.error,
            // Time : console.time,
            // TimeEnd : console.timeEnd
        }

        console.log = Logging.Log;
        console.info = Logging.Info;
        console.warn = Logging.Warn;
        console.error = Logging.Error;
        console.time = Logging.Time;
        console.timeEnd = Logging.TimeEnd;
    }

    static AddLevelFilter =
    (filter) => {
        Logging._LevelFilters.push(filter)
    }

    static Log =
    (...args) => {
        Logging.Process(LoggingLevel.Unknown, args);
    }

    static Info =
    (...args) => {
        Logging.Process(LoggingLevel.Info, args);
    }

    static Warn =
    (...args) => {
        Logging.Process(LoggingLevel.Warn, args);
    }

    static Error =
    (...args) => {
        Logging.Process(LoggingLevel.Error, args);
    }

    static Console = () => Logging._LogFunctions;

    static WriteAlways =
    (...args) => {
        Logging.Process(LoggingLevel.Always, args);
    }

    static Process =
        (level, ...args) => {
            try {
                var actualLevel = LoggingLevel.Unknown;

                if (level <= LoggingLevel.Always) {
                    var filter = Logging._LevelFilters.find(f => f.Check(args[0].toString()));

                    if (filter) {
                        actualLevel = filter.Level;
                    }
                } else {
                    actualLevel = level;
                }

                if (actualLevel == LoggingLevel.Unknown) {
                    actualLevel = LoggingLevel.Info;
                }

                var logValues = [].slice.call(args)[0];

                Logging.History.push(new LogEntry(new Date(), actualLevel, logValues))
                if (Logging.History.length > Logging.MaxHistory) {
                    Logging.History.shift();
                }

                if (level == LoggingLevel.Always || actualLevel >= Logging.Level) {
                    Logging.ActualWrite(actualLevel, logValues);
                }
            } catch (err) {
                //Shouldn't happen!
            }
        }

    static WriteMessage =
        (level, msg, ...args) => {

            var a = [msg];
            if (args && args.length > 0) {
                a.push(args);
            }
            Logging.ActualWrite(level, a);
        }

    static WriteMessageConditional =
        (level, msg, ...args) => {
            if (level >= Logging.Level) {
                Logging.WriteMessage(level, msg, args);
            }
        }

    static ActualWrite =
        (level, values) => {
            var logFunc = null;

            switch (level) {
                case LoggingLevel.Debug:
                case LoggingLevel.Info:
                    logFunc = Logging._LogFunctions.Info;
                    break;
                case LoggingLevel.Warn:
                    logFunc = Logging._LogFunctions.Warn;
                    break;
                case LoggingLevel.Error:
                    logFunc = Logging._LogFunctions.Error;
                    break;
            }

            if (logFunc != null) {
                logFunc.apply(this, values);

                Logging.Written.invoke(level, values);
            }
        }

    static Time =
        label => {
            if (!Logging._TimeLabels[label]) {
                Logging._TimeLabels[label] = new Date().getTime();
            } else {
                console.warn(`Timer '${label}' already exists`);
            }
        }

    static TimeEnd =
        label => {
            if (Logging._TimeLabels[label]) {
                var elapsed = new Date().getTime() - Logging._TimeLabels[label];

                delete Logging._TimeLabels[label];

                console.warn(`${label}: ${elapsed} ms`);
            } else {
                console.warn(`Timer '${label}' does not exist`);
            }
        }
}

Logging.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);


export { Logging, LoggingLevel, LogLevelFilter, LogEntry };