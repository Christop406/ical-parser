import { readFileSync } from 'fs';
import { join } from 'path';
import parseString from '../../src/lib/parse-string';

describe('ParseString', () => {

    const icalFile = readFileSync(join(__dirname, '..', 'ical', 'mine', 'test.ics')).toString('utf-8');

    it('parseString', () => {
        const parsed = parseString(icalFile);
        // console.log(parsed);
        console.log(parsed.events.length);
    })
});