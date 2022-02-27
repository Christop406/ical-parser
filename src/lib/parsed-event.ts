export const getEventsOnDate = function (dateToCheck) {
    function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    if (this != null && this.events !== undefined && dateToCheck !== undefined) {
        return this.events.filter(event => {
            if (sameDay(event.dtstart.value, dateToCheck)) {
                return true;
            } else if (event.recurrenceRule !== undefined) {
                let eventsOnSameDay = event.recurrenceRule.between(dateToCheck, dateToCheck, true);
                if (eventsOnSameDay.length > 0) return true;
            }
            return false;
        });
    }
}

export const getEventsBetweenDates = function(startDate, endDate, inclusive) {
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