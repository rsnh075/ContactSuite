/**
 *
 *
 *
 */

const isToday = (d) => {
    const _now = new Date(),
        _then = new Date(d);
    return _then.getDate() == _now.getDate() && _then.getMonth() == _now.getMonth() && _then.getFullYear() == _now.getFullYear();
};

const dayAndDateNL = (dt) => new Date(dt).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
const dayAndDateUK = (dt) => new Date(dt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });

const todayNL = () => new Date().toLocaleDateString('nl-NL').replace(/\//g, '-');
const todayUK = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

// const timeToClock = (ms) => new Date(ms).toLocaleTimeString('nl', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
const timeToClockHHMMSS = (ms) => new Date(ms).toISOString().split('T')[1].substring(0, 8);
const timeToClockHHMM = (ms) => new Date(ms).toISOString().split('T')[1].substring(0, 5);

const dateToLocal = (dt) => new Date(dt).toLocaleTimeString('nl', { day: 'numeric', month: 'numeric', year: 'numeric' });
const dateToLocalTimeHHMM = (dt) => new Date(dt).toLocaleTimeString('nl', { day: '2-digit', month: '2-digit', year: 'numeric' }).substring(11, 16);
const dateToLocalTimeHHMMSS = (dt) => new Date(dt).toLocaleTimeString('nl', { day: '2-digit', month: '2-digit', year: 'numeric' }).substring(11, 19);
const secondsToTimeHHMMSS = (s) => new Date(s * 1000).toISOString().slice(11, 19);
const secondsToTimeMMSS = (s) => new Date(s * 1000).toISOString().slice(14, 19);

const dateToTime = (dt) => {
    let _date = new Date(dt),
        _hours = ('0' + _date.getHours()).slice(-2),
        _minutes = ('0' + _date.getMinutes()).slice(-2),
        _time = `${_hours}:${_minutes}`;
    return _time;
};

const durationTime = (timeInSeconds: number, format: string = 'hh:mm:ss'): string => {
    let _part = format === 'hh:mm:ss' ? [11, 8] : [14, 5];
    return new Date(timeInSeconds * 1000).toISOString().substr(..._part);
};

const timeToMillisec = (t) => {
    let parts = t.split(':');
    return (parts[0] * 60 * 60 + parts[1] * 60 + parts[2]) * 1000;
    // m.duration(t, 'HH:mm:ss').asMilliseconds();
};

const substractDurations = (t1, t2) => {
    let _t1 = timeToMillisec(t1),
        _t2 = timeToMillisec(t2);

    return durationTime(Math.abs(_t1 - _t2) / 1000);
};

const diffTwoISOsToMillisec = (iso1:string, iso2:string) => {
    return Math.abs((new Date(iso1).getTime() - new Date(iso2).getTime()));
}

const langs = {
    nl: 'nl',
    en: 'en-gb',
};

const convertISOToDateTime = (isoDateTime, lang) => {
    let _dateObj = new Date(isoDateTime);
    return `${_dateObj.toLocaleDateString(langs[lang], { day: 'numeric', month: 'numeric', year: 'numeric' })} ${_dateObj.toLocaleTimeString(langs[lang], { hour: 'numeric', minute: 'numeric' })}`;
};

const ISOdateTimetoDate = (dt) => new Date(dt).toLocaleDateString('nl', { day: '2-digit', month: '2-digit', year: 'numeric' });
const ISOdateTimetoDateEn = (dt) => new Date(dt).toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit', year: 'numeric' });
const ISOdateTimetoTime = (dt) => {
    if (!dt) {
        return;
    }
    let res = new Date(dt).toLocaleTimeString('nl', { timeZone: 'UTC', hour: 'numeric', minute: 'numeric' });
    return res;
}

const toISODate = (dt) => new Date(dt).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });

const currentDateTime = () => dateToLocal(new Date()); //  m().format("DD-MM-YYYY");

const currentLocalDateTimeISO = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60 * 1000;
    const localTime = now.getTime() - offset;
    return new Date(localTime).toISOString();
}

const dateTimeToLocalDateTimeISO = (dt) => {
    const offset = dt.getTimezoneOffset() * 60 * 1000;
    const localTime = dt.getTime() - offset;
    return new Date(localTime).toISOString();
}

const saveFormatDate = (dt) => {
    let _date = dt.split(' ');
    let _dateParts = _date[0].split('-');
    return new Date(`${_dateParts[2]}-${_dateParts[1]}-${_dateParts[0]}Z`).toISOString();
};

const dateIsPassed = (dt) => new Date(dt) < new Date();

// const gridTime = (curentTime, step) => m(curentTime, "YYYY-MM-DDTHH:mm:ss").add(step, "milliseconds").format("HH:mm");
const timestampToHHMM = (d) => {
    let _hours = String(d.getHours()).padStart(2, '0'),
        _min = String(d.getMinutes()).padStart(2, '0');
    return `${_hours}:${_min}`;
};

const yesterdaysDate = () => {
    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
};

const pikaDayToDDMMYYYY = (d) => {
    return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
};

const parsePikaDayDateStr = (d) => {
    const parsedDate = Date.parse(d.replace(/-/g, '/'));
    return Number.isNaN(parsedDate) ? new Date() : new Date(parsedDate);
};

const ISOToDDMMYYYY = (dt) => new Date(dt).toLocaleDateString('nl', { day: '2-digit', month: '2-digit', year: 'numeric' });
const ISOToHHMM = (dt) => dt.match(/\d\d:\d\d/);

export {
    isToday,
    currentDateTime,
    currentLocalDateTimeISO,
    dateTimeToLocalDateTimeISO,
    dayAndDateNL,
    dayAndDateUK,
    todayNL,
    todayUK,
    dateIsPassed,
    dateToTime,
    durationTime,
    timeToClockHHMMSS,
    timeToClockHHMM,
    dateToLocal,
    dateToLocalTimeHHMMSS,
    dateToLocalTimeHHMM,
    secondsToTimeHHMMSS,
    secondsToTimeMMSS,
    convertISOToDateTime,
    ISOdateTimetoDate,
    ISOdateTimetoDateEn,
    saveFormatDate,
    timestampToHHMM,
    timeToMillisec,
    substractDurations,
    ISOdateTimetoTime,
    toISODate,
    yesterdaysDate,
    diffTwoISOsToMillisec,

    ISOToDDMMYYYY,
    ISOToHHMM,
    pikaDayToDDMMYYYY,
    parsePikaDayDateStr,
};
