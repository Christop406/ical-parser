import * as iCalDateParser from 'ical-date-parser';
import rrule, { RRule, RRuleSet, rrulestr } from 'rrule';
import * as fs from 'fs';
import { getDate, insert, Metadata, splitICSLines } from './lib/util';
import { join } from 'path';
import { createInterface } from 'readline';
import { ICalKey } from './lib/ical-key';
import { getEventsBetweenDates, getEventsOnDate } from './lib/parsed-event';

export const parseString = (ics: string) => {
    const lines = splitICSLines(ics);
};

// let propertyKeySet = new Set<string>();


export const parseFile = (filePath: fs.PathLike) => {
    console.log('reading', filePath);

    const readStream = fs.createReadStream(filePath);

    const readInterface = createInterface({
        input: readStream,
        terminal: false,
    });

    let obj: any = {};

    readInterface.on('line', (line) => {
        const parsed = parseLine(line);
        if (parsed.property === 'begin') {
            obj[parsed.value] = {};
        }
    });

    // return new Promise((resolve, reject) => {
    //     readStream.on('end', () => {
    //         console.log('end');
    //         resolve();
    //     });
    // });
};

type ICSProperty = 'begin'
    | 'end'
    | 'prodid'
    | 'version'
    | 'calscale'
    | 'method'
    | 'tzid'
    | 'dtstart'
    | 'dtend'
    | 'rrule'
    | string;

interface ParsedLineInfo {
    property?: ICSProperty;
    value?: string;
    rawLine: string;
}


const parseLine = (line: string): ParsedLineInfo => {
    line = line.toLowerCase();
    let lineInfo: ParsedLineInfo = {
        rawLine: line,
    };

    if (!line) {
        return lineInfo;
    }

    const [property, value] = line.split(':');

    lineInfo = {
        ...lineInfo,
        property,
        value
    };

    // if (!propertyKeySet.has(property) && !property.includes(' ')) {
    //     console.log(property);
    //     propertyKeySet.add(property);
    // }

    // console.log(lineInfo);
    return lineInfo;
};

parseFile(join(__dirname, '..', 'test', 'ical', 'mine', 'test.ics'));
