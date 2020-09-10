const iCalDateParser = require('ical-date-parser');
const rrule = require('rrule');
const moment = require('moment');

module.exports.parseString = function(st, max) {
    let lines = getLines(st);
    let event_count = 0;
    let in_event = false;
    let metadata = {};
    let events = [];
    var key = '';
    var k = '';
    var value = '';
    var kspl = []; // split at ;
    var params = [];

    var block = [];
    block.push('calendar');
    metadata['calendar'] = {};

    for (let i = 1; i < lines.length && (max === undefined || event_count < max) ; i++) {
        lines[i] = lines[i].replace("\r", "");
        key = lines[i].substring(0, lines[i].indexOf(":"));
        kspl = key.split(";");
        if(kspl.length > 1){
          kspl.slice(1).forEach(function(el) {
            let el_split = el.split("=");
            params[el_split[0]] = el_split[1];
          });
        }
        key = kspl[0];
        k = key.toLowerCase();
        value = lines[i].substring(lines[i].indexOf(":") + 1);

        if(lines[i].indexOf("BEGIN:VEVENT") !== -1) {
            in_event = true;
            events[event_count] = {};
        } else if(lines[i].indexOf("END:VEVENT") !== -1) {
            if(events[event_count].rrule !== undefined) {
                events[event_count].recurrenceRule = rrule.rrulestr(events[event_count].rrule, {dtstart: events[event_count].dtstart.value});
                events[event_count].rrule = undefined;
            }
            event_count++;
            in_event = false;
        } else if(in_event) {
            switch(key) {
              case 'RRULE':
                events[event_count].rrule = lines[i];
                break;
              case 'EXDATE':
                events[event_count].rrule = events[event_count].rrule + '\n' + lines[i];
                break;
              case 'CREATED':
              case 'LAST-MODIFIED':
              case 'DTSTAMP':
                events[event_count][k] = getDate(undefined, value);
                break;
              case 'DTSTART':
              case 'DTEND':
                events[event_count][k] = {};
                if(params['VALUE'] === 'DATE') {
                    events[event_count][k].value = getDate(params["VALUE"], value);
                } else {
                    /*if(params["TZID"] !== undefined) {
                        events[event_count][k].value = getDate(undefined, value.concat('Z'));
                    } else {
                        events[event_count][k].value = getDate(undefined, value);
                    }*/
                    /**Leave tz management to users */
                    events[event_count][k].value = getDate(undefined, value);
                }
                if(Object.keys(params).length > 0) events[event_count][k].params = {};
                for(var p in params) {
                  events[event_count][k].params[p.toLowerCase()] = params[p];
                }
                break;
              case 'LOCATION':
              case 'STATUS':
              case 'SUMMARY':
              case 'DESCRIPTION':
              case 'TRANSP':
              case 'SEQUENCE':
              case 'ORGANIZER':
              case 'UID':
              //events[event_count].uid = lines[i].split(":")[1];
              case 'ATTENDEE':
              // console.log(params);
              default:
                events[event_count][k] = {};
                events[event_count][k].value = value;
                if(Object.keys(params).length > 0) events[event_count][k].params = {};
                for(var p in params) {
                  events[event_count][k].params[p.toLowerCase()] = params[p];
                }
            }
        } else if(!in_event) {
            if(key === 'BEGIN') {
              insert(metadata, block, value.toLowerCase(), {});
              block.push(value.toLowerCase());
            } else if(key === 'END') {
              block.pop();
            } else {
              insert(metadata, block, k, value);
            }
        }
        key = '';
        k = '';
        value = '';
        params = [];
        kspl = [];
    }
    return {
        calendarData: metadata.calendar,
        events: events,
        getEventsOnDate: getEventsOnDate,
        getEventsBetweenDates: getEventsBetweenDates
    }
}

function insert(metadata, block, key, value) {
  if(key === '') return;
    let obj = metadata;
    let len = block.length - 1;
    var i = 0;
    while(obj !== undefined && i <= len) {
      if(obj.hasOwnProperty(block[i])) {
        obj = obj[block[i]];
        i++;
      }
    }
    obj[key] = value;
    metadata = obj;
}

const getEventsOnDate = function(dateToCheck) {
  function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  if(this != null && this.events !== undefined && dateToCheck !== undefined) {
    return this.events.filter(event => {
      if(sameDay(event.dtstart.value, dateToCheck)) {
        return true;
      } else if(event.recurrenceRule !== undefined) {
        let eventsOnSameDay = event.recurrenceRule.between(dateToCheck, dateToCheck, true);
        if(eventsOnSameDay.length > 0) return true;
      }
      return false;
    });
  }
}

const getEventsBetweenDates = function(startDate, endDate, inclusive) {
  function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  if(this != null && this.events !== undefined && startDate !== undefined && endDate !== undefined) {
    return this.events.filter(event => {
      if((event.dtstart.value > startDate && event.dtstart.value < endDate) || (inclusive && (sameDay(event.dtstart.value, startDate) || sameDay(event.dtstart.value, endDate)))
      ) {
        event.matchingDates = [event.dtstart.value];
        return true;
      } else if(event.recurrenceRule !== undefined) {
        let eventsOnSameDay = event.recurrenceRule.between(startDate, endDate, inclusive);
        event.matchingDates = eventsOnSameDay;
        if(eventsOnSameDay.length > 0) return true;
      }
      return false;
    });
  }
}

function getLines(icalString) {
  return icalString.replace(/\r\n\s/g, "").replace(/\\n/g, " ").replace(/  +/g, ' ').replace(/\\/g, "").split("\n");
}

function getDate(type, value) {
    if (value.includes('Z')) {
      return type ? new Date(value.substring(0, 4), parseInt(value.substring(4, 6)) - 1, value.substring(6, 8)) : iCalDateParser(value);
    }
    else {
      const newValue = moment.utc(value).format().replace(/-/g,'').replace(/:/g,'');
      return type ? new Date(newValue.substring(0, 4), parseInt(newValue.substring(4, 6)) - 1, newValue.substring(6, 8)) : iCalDateParser(newValue);
    }
    
}

function getDateStrict(value) {
    return getDate(false, value);
}

function traverseObject (obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      traverse(obj[key])
    }
  }
}
