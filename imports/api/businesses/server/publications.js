import { Meteor } from 'meteor/meteor';
import { Businesses } from '../businesses.js';

Meteor.publish('businesses.all', function() {
  return Businesses.find({}, {fields: {}});
});
