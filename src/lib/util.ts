import iCalDateParser from 'ical-date-parser';

export const splitICSLines = (ics: string) => {
    return ics
        .replace(/\r?\n\s/g, "")
        .replace(/\\n/g, " ")
        .replace(/  +/g, ' ')
        .replace(/\\/g, "")
        .split("\n");
};

export function getDate(type, value) {
    return type ? new Date(value.substring(0, 4), parseInt(value.substring(4, 6)) - 1, value.substring(6, 8)) : iCalDateParser(value);
}

export function getLines(icalString: string): string[] {
    return icalString.replace(/\r\n\s/g, "").replace(/\\n/g, " ").replace(/  +/g, ' ').replace(/\\/g, "").split("\n");
}

export interface Metadata {
    calendar?: Record<string, any>;
}

export function insert(metadata: Metadata, block: string[], key: string, value: any): Metadata {
    if (key === '') return metadata;
    const m = { ...metadata };
    let meta = m;
    let len = block.length - 1;
    let i = 0;
    while (meta !== undefined && i <= len) {
        // console.log(meta, i, len, block[i]);
        if (meta.hasOwnProperty(block[i])) {
            meta = meta[block[i]];
            i++;
        }
    }
    meta[key] = value;
    return m;
}