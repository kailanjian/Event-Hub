import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Businesses } from './businesses.js';

Meteor.methods({
  // does not need to be used, addUser upserts
  'businesses.insert'(businessId) {
    return Businesses.insert({
      businessId: businessId,
      numGoing: 0,
      usersGoing: []
    });
  },
  'businesses.addUser'(businessId, userId) {
    const existing = Businesses.findOne({businessId: businessId});
    if (existing && existing.usersGoing.includes(userId)) {
      return existing;
    } else {
      return Businesses.update(
        {businessId: businessId}, {
          $inc: {numGoing: 1},
          $push: {usersGoing: userId}
        }, {upsert: true});
    }
  },
  'businesses.removeUser'(businessId, userId) {
    const existing = Businesses.findOne({businessId: businessId});
    if (!existing) {
      return undefined;
    } else {
      return Businesses.update(
        {businessId: businessId}, {
          $inc: {numGoing: -1},
          $pull: {usersGoing: userId}
        }
      )
    }
  }
})