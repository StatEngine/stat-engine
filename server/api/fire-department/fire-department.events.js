/**
 * FireDepartment model events
 */

'use strict';

import {EventEmitter} from 'events';
import {FireDepartment} from '../../sqldb';
var FireDepartmentEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
FireDepartmentEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  FireDepartment.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    FireDepartmentEvents.emit(`${event}:${doc._id}`, doc);
    FireDepartmentEvents.emit(event, doc);
    done(null);
  };
}

export default FireDepartmentEvents;
