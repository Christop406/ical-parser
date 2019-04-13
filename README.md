# cal-parser

## What does it do?

`cal-parser` parses a `.ics` file into a more-easily-usable JavaScript object.

This package can also be found [on npm](https://www.npmjs.com/package/cal-parser)

### Why use this over Mozilla's [`ical`](https://github.com/mozilla-comm/ical.js/)?

I wanted to have this functionality in React Native, but unfortunately `ical` uses Node native packages. This version does not use Node standard library packages for its functionality, so it should be usable on any JavaScript/Node platform.

## Features
- [x] Parses large ical strings.
- [x] Should be able to handle any parameters, including custom.
- [x] Automatically transforms dates and date-times into JS `Date` objects, if applicable.
- [x] Very few dependencies, giving it good compatibility.

### To-Do

(Help is appreciated!)
- [ ] Optimize the parser. (I threw this together quickly and JS is not my best language)
- [ ] Ensure/Test Full [RFC-5545](https://tools.ietf.org/html/rfc5545) Compliance.
- [ ] Add sorting the list by criteria.

## Usage

````javascript
const ical = require('cal-parser');
const fs = require("fs");

const myCalendarString = fs.readFileSync("./test/ical/mine/test.ics", "utf-8");

const parsed = ical.parseString(myCalendarString);

// Read Calendar Metadata
console.log(parsed.calendarData);

// Read Events
console.log(parsed.events);

````

## Example

This:
````
BEGIN:VEVENT
DTSTART:20180917T220000Z
DTEND:20180917T230000Z
DTSTAMP:20190411T013638Z
ORGANIZER;CN=Jordan Quinones:mailto:quinones.jordan@gmail.com
UID:6di62pj26dgmcbb360pj0b9k64sm4b9pckojcb9l64sm8phjc8p3gchhc4@google.com
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=presid
 ent.cpa.sdsu@gmail.com;X-NUM-GUESTS=0:mailto:president.cpa.sdsu@gmail.com
CREATED:20180913T213925Z
DESCRIPTION:Sheraton San Diego Hotel & Marina\nSan Diego\n+1 619-291-2900\n
 \n97766036\n97766043\n\nCheck-in: Apr 11\, 2019 4:00pm\nCheck-out: Apr 13\,
  2019 12:00pm
LAST-MODIFIED:20180916T173634Z
LOCATION:Associated Students\, 5500 Campanile Dr #320\, San Diego\, CA 9218
 2\, USA
SEQUENCE;TESTPARAM=TESTPARAM:0
STATUS:CONFIRMED
SUMMARY:Meet up with Panhellenic\, CPA
TRANSP:OPAQUE
END:VEVENT
````
Turns into this:
````JSON
{
  "dtstart": {
    "value": "2018-09-17T22:00:00.000Z"
  },
  "dtend": {
    "value": "2018-09-17T23:00:00.000Z"
  },
  "dtstamp": "2019-04-11T01:36:38.000Z",
  "organizer": {
    "value": "mailto:quinones.jordan@gmail.com",
    "params": {
      "cn": "Jordan Quinones"
      }
    },
  "uid": {
    "value":
      "6di62pj26dgmcbb360pj0b9k64sm4b9pckojcb9l64sm8phjc8p3gchhc4@google.com"
    },
  "attendee": {
    "value": "mailto:president.cpa.sdsu@gmail.com",
    "params": {
      "cutype": "INDIVIDUAL",
      "role": "REQ-PARTICIPANT",
      "partstat": "ACCEPTED",
      "cn": "president.cpa.sdsu@gmail.com",
      "x-num-guests": "0"
     }
  },
  "created": "2018-09-13T21:39:25.000Z",
  "description": {
    "value":
      "Sheraton San Diego Hotel & Marina San Diego +1 619-291-2900 97766036 97766043 Check-in: Apr 11, 2019 4:00pm Check-out: Apr 13, 2019 12:00pm"
  },
  "last-modified": "2018-09-16T17:36:34.000Z",
  "location": {
    "value":
      "Associated Students, 5500 Campanile Dr #320, San Diego, CA 92182, USA"
  },
  "sequence": {
    "value": "0",
    "params": {
      "testparam": "TESTPARAM"
    }
  },
  "status": {
    "value": "CONFIRMED"
  },
  "summary": {
    "value": "Meet up with Panhellenic, CPA"
  },
  "transp": {
    "value": "OPAQUE"
  }
}
````
