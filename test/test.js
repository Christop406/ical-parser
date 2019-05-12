const ical = require("../index.js");
const axios = require("axios");
const fs = require("fs");
const assert = require("assert");
var largeIcalString = '';
var parsed = {};
var s = 0;
var e = 0;

describe('ical parser', function() {
  describe('large ical string', function() {
    it('parses the string without failing', function() {
      largeIcalString = fs.readFileSync("./test/ical/mine/test.ics", "utf-8");
      s = Date.now();
      parsed = ical.parseString(largeIcalString);
      e = Date.now();
      assert(parsed !== undefined && parsed.events !== undefined && parsed.calendarData !== undefined);
      //console.log("=== BEGIN EXAMPLE EVENT ===");
      //console.log(parsed.events[0]);
      //console.log("=== END EXAMPLE EVENT ===");
    });
    it('finds events', function() {
      assert(parsed.events.length > 0);
    });
    it('parses multi-line location', function() {
      assert.equal(parsed.events[0].location.value, 'Associated Students, 5500 Campanile Dr #320, San Diego, CA 92182, USA');
    });
    it('parses multi-line description', function() {
        assert.equal(parsed.events[0].description.value, 'Sheraton San Diego Hotel & Marina San Diego +1 619-291-2900 97766036 97766043 Check-in: Apr 11, 2019 4:00pm Check-out: Apr 13, 2019 12:00pm');
    });
    it('shows auxiliary params', function() {
      assert.equal(parsed.events[0].sequence.params.testparam, "TESTPARAM");
    });
    it('parses the metadata correctly', function() {
      assert.notEqual(parsed.calendarData, undefined);
      assert.equal(parsed.calendarData.vtimezone.daylight.tzname, 'PDT');
      //console.log("=== BEGIN CALENDAR METADATA ===");
      //console.log(parsed.calendarData);
      //console.log("=== END CALENDAR METADATA ===");
    });
    it('limits how many events to return', function() {
      const parsed2 = ical.parseString(largeIcalString, 2);
      assert.equal(parsed2.events.length, 2);
    });
    it('returns only a single day\'s events', function() {
      assert.notEqual(parsed.getEventsOnDate, undefined);

      let dateToFind = new Date(2019, 4, 24);
      //s = Date.now();
      let todayEvents = parsed.getEventsOnDate(dateToFind);
      //e = Date.now();
      console.log(dateToFind);
      assert.notEqual(todayEvents, undefined);
      assert(todayEvents.length > 0);
      //console.log("Getting one day of events took " + (e - s) + "ms.")
      console.log(todayEvents);
    });
    it('gets a week\'s worth of events (sort-of)', function() {
      let startDate = new Date(2019, 3, 28);
      let endDate = new Date(2019, 4, 4);
      //s = Date.now();
      let weeksEvents = parsed.getEventsBetweenDates(startDate, endDate, true);
      //e = Date.now();
      assert(weeksEvents.length > 0);
      //console.log(weeksEvents);
      //console.log("Getting 3 days of events took " + (e - s) + "ms.");
      //let sorted = weeksEvents.sort((a, b) => {
        //return a.matchingDates[0] < b.matchingDates[0];
      //});
      //console.log(sorted);
    });
  });
});

function retrieveCalendar(URL) {
    return axios.get(URL);
}
