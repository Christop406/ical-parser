import { RRule, RRuleSet, rrulestr } from 'rrule';
import { getDate, insert, Metadata, splitICSLines } from './util';
import { getEventsOnDate, getEventsBetweenDates } from './parsed-event';
import { ICalKey } from './ical-key';

interface ICalEvent {
    rrule?: string;
    recurrenceRule?: RRule | RRuleSet;
}

const parseString = function (input: string, max?: number) {
    const lines = splitICSLines(input);
    let inEvent = false;
    let eventCount = 0;
    let events: ICalEvent[] = [];
    let metadata: Metadata = { calendar: {} };
    const block: string[] = ['calendar'];

    lines.slice(1).forEach((rawLine) => {
        const line = rawLine.replace(/\r/g, '');
        const key = line.substring(0, line.indexOf(':'));
        let [mainKey, ...subKeys] = key.split(';');
        const params: Record<string, string> = {};

        if (subKeys.length) {
            subKeys.forEach((str) => {
                const [pKey, pVal] = str.split('=');
                params[pKey] = pVal;
            });
        }

        mainKey = mainKey.toLowerCase();

        const value = line.substring(line.indexOf(':') + 1);

        if (line.includes('BEGIN:VEVENT')) {
            inEvent = true;
            events[eventCount] = {};
        } else if (line.includes('END:VEVENT')) {
            if (events[eventCount].rrule) {
                events[eventCount].recurrenceRule = rrulestr(events[eventCount].rrule)
                events[eventCount].rrule = undefined;
            }

            eventCount++;
            inEvent = false;
        } else if (inEvent) {
            switch (key) {
                case ICalKey.Rrule:
                    events[eventCount].rrule = line;
                    break;
                case ICalKey.Exdate:
                    events[eventCount].rrule = line;
                    break;
                case ICalKey.Created:
                case ICalKey.LastModified:
                case ICalKey.Dtstamp:
                    events[eventCount][mainKey] = getDate(undefined, value);
                    break;
                case ICalKey.Dtstart:
                case ICalKey.Dtend:
                    events[eventCount][mainKey] = events[eventCount][mainKey] || {};
                    if (params[ICalKey.Value] === 'DATE') {
                        events[eventCount][mainKey].value = getDate(params['VALUE'], value);
                    } else if (params['TZID']) {
                        events[eventCount][mainKey].value = getDate(undefined, value.concat('Z'));
                    } else {
                        events[eventCount][mainKey].value = getDate(undefined, value);
                    }

                    events[eventCount][mainKey].params = Object.keys(params).reduce((acc, curr) => {
                        acc[curr.toLowerCase()] = params[curr];
                        return acc;
                    }, {});

                    break;
                case ICalKey.Location:
                case ICalKey.Status:
                case ICalKey.Summary:
                case ICalKey.Description:
                case ICalKey.Transp:
                case ICalKey.Sequence:
                case ICalKey.Organizer:
                case ICalKey.Uid:
                case ICalKey.Attendee:
                default:
                    events[eventCount][mainKey] = {};
                    events[eventCount][mainKey].value = value;
                    events[eventCount][mainKey].params = Object.keys(params).reduce((acc, curr) => {
                        acc[curr.toLowerCase()] = params[curr];
                        return acc;
                    }, {})
            }
        } else if (!inEvent) {
            switch (key) {
                case ICalKey.Begin:
                    const lowerValue = value.toLowerCase();
                    metadata = insert(metadata, block, lowerValue, {});
                    block.push(lowerValue);
                    break;
                case ICalKey.End:
                    block.pop();
                    break;
                default:
                    metadata = insert(metadata, block, mainKey, value);
            }
        }
    });

    return {
        calendarData: metadata.calendar,
        events,
        getEventsOnDate: getEventsOnDate,
        getEventsBetweenDates: getEventsBetweenDates,
    };
}

export default parseString;