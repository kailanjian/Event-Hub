import { Mongo } from 'meteor/mongo';

export const Businesses = new Mongo.Collection('businesses');

/*
Document structure:
{
  _id: id
  businessId: id of business this represents (in Yelp)
  numGoing: count of people going
  usersGoing: array of userId's going
}
*/
