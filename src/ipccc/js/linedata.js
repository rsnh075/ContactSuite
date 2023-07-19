import { SupervisorStatus } from './supervisor.js';

class RawData {
    Raw = null;

    constructor(rawData) {
        this.Raw = rawData;
    }
}

class LineData extends RawData {
    Participants = new Array();

    constructor(rawLineData) {
        super(rawLineData);

        rawLineData.Participants.map(p => {
            this.Participants.push(new LineParticipant(p));
        });
    }
}

class LineParticipant {
    constructor(rawParticipant) {
        LineParticipant.ExtractData(rawParticipant, this);
    }

    static ExtractData = (raw, participant) => {
        var ParseValue = (str, defaultValue) => {
            var retValue = defaultValue || 0;

            //+ is for phoneNumbers, so if found then don't parse
            if (str !== "" && (str.toString().includes("+") || str.toString().includes("@"))) {
                var value = parseInt(str);
                if (!isNaN(value)) {
                    retValue = value;
                } else {
                    retValue = str;
                }
            } else {
                retValue = str;
            }

            return retValue;
        }

        var ParseData = (value) => {
            switch (value.toString().toLowerCase().trim()) {
                case "true":
                    return true;
                case "false":
                    return false;
                default:
                    return ParseValue(value);
            }
        }

        Object.keys(raw).map(p => {
            if (!Array.isArray(raw[p])) {
                participant[p] = ParseData(raw[p]);
            }
        });

        if (raw.Details) {
            raw.Details.map(d => {
                participant[d.Name] = ParseData(d.Value);
            });
        }

        // //Setting the values for easier checking the status of the supervisor
        participant.IsSupervisor = participant.SupervisorStatus !== SupervisorStatus.NoSupervisor;
        participant.SupervisorListens = participant.SupervisorStatus === SupervisorStatus.Listen;
        participant.SupervisorCoaching = participant.SupervisorStatus === SupervisorStatus.Coaching;
        participant.SupervisorJoined = participant.SupervisorStatus === SupervisorStatus.Joined;
    }
}

class Lines extends RawData {
    Line1 = null;
    Line2 = null;
    Line3 = null;
    Line4 = null;
    Line5 = null;

    TimeStamp = null;

    constructor(rawLines) {
        super(rawLines);

        this.TimeStamp = rawLines.TimeStamp;

        if (rawLines.Lines) {
            rawLines.Lines.map(l => {
                var lineData = new LineData(l);

                switch (l.Id) {
                    case 1:
                        this.Line1 = lineData;
                        break;
                    case 2:
                        this.Line2 = lineData;
                        break;
                    case 3:
                        this.Line3 = lineData;
                        break;
                    case 4:
                        this.Line4 = lineData;
                        break;
                    case 5:
                        this.Line5 = lineData;
                        break;
                }
            });
        }
    }
}

export { Lines }