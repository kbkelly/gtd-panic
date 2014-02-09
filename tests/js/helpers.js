function expectEventPlacement(events, position, title, startHour, startMinute, endHour, endMinute) {
  expect(events[position].title).toEqual(title);
  expect(events[position].start.getHours()).toEqual(startHour);
  expect(events[position].start.getMinutes()).toEqual(startMinute);
  expect(events[position].end.getHours()).toEqual(endHour);
  expect(events[position].end.getMinutes()).toEqual(endMinute);
}
