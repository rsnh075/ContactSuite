import { useStore } from 'vuex';
import 	{ dateToLocalTimeHHMMSS } from '../use/dateFunctions';

export function useExportNotes() {

    const store        = useStore(),
          META_HEADERS = `TemplateId;Phonenumber;ServiceNumber;screenDate/screenTime;durationForCaller;Agent;Name;ReferredTo;ServiceAgentNumber;NumberType;StartServiceAgentCall;EndServiceAgentCall;durationServiceAgentCall;durationServiceAgentCallInSec`;

    // const ISOdateTimetoTime = (dt) => {
    //     if (!dt) {
    //         return;
    //     }
    //     let res = new Date(dt).toLocaleTimeString('nl', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric' });
    //     return res;
    // }

    const niceTime = (d) => {
        let _d = d ? new Date(d) : '-';
        return _d !== '-' ? dateToLocalTimeHHMMSS(_d) : _d;
    }

    const niceSN = (str) => {
        if(str.length > 0) return str;
        else return '-';
    }

    const checkValue = (val) => {
        let _val = String(val).replace(/(?:\\[rn]|[\r\n]|[;]+)+/g, " ");
        return _val.trim() !== "" ? _val : "-";
    }

    const createHeader = (jsonArr) => {
        let _totalHeader = new Set();
        jsonArr.forEach(note => {
            for(const prop in note.Note) {
                if(prop !== 'Note')
                    _totalHeader.add(prop);
            }
        });
        return [..._totalHeader].sort();
    }

    const objectValuesToString = (obj) => {
        return Object.values(obj).join(" ").replace(/(?:\\[rn]|[\r\n]|[;]+)+/g, " ");
    }

    const createJSON2CSV = (jsonArr) => {
        let _notesHeader   = createHeader(jsonArr),
            _staticHeaders = META_HEADERS.split(';'),
            _csv           = [];

        _csv = jsonArr.reduce((list, row) => {
            let _row = [];
            _staticHeaders.forEach(prop => {
                switch(prop) {
                case 'ServiceNumber':
                    _row.push(row.hasOwnProperty(prop) ? niceSN(row[prop]) : '-');
                    break;
                case 'screenDate/screenTime':
                    _row.push(`${row.screenDate}/${row.screenTime}`);
                    break;
                case 'StartServiceAgentCall':
                case 'EndServiceAgentCall':
                    _row.push(row.hasOwnProperty(prop) ? niceTime(row[prop]) : '-');
                    break;
                default:
                    _row.push(row.hasOwnProperty(prop) ? checkValue(row[prop]) : '-');
                }
            });

            _notesHeader.forEach(prop => {
                if(prop === 'CommentsList' && row.Note.hasOwnProperty(prop) && row.Note[prop].length > 0) {
                    let _comments = row.Note[prop].reduce((comments, item) => {
                        delete item.commentISOstr;
                        return comments === '' ? `${comments} ${objectValuesToString(item)}` : `${comments} | ${objectValuesToString(item)}`;
                    }, '');
                    _row.push(_comments);
                } else {
                    _row.push(row.Note.hasOwnProperty(prop) ? checkValue(row.Note[prop]) : '-');
                }
            });

            return list = list.concat(`${_row.join(';')}`);
        }, []);

        return `${store.state.settings.notes.exportheader.join(';')};${_notesHeader.join(';')}\r\n${_csv.join('\r\n')}`;
    }
    return { 'createJSON2CSV' : createJSON2CSV };
}