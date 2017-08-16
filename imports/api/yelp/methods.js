import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';

var authKey;
const authUrl = "https://api.yelp.com/oauth2/token";
const searchUrl = "https://api.yelp.com/v3/businesses/search";

Meteor.methods({
  // gets returns authKey. Uses caching.
  'yelp.authorize'() {
    console.log("yelp.authorize called!");
    if (!authKey) {
      // get auth key
      // wrap the post method to make it synchronous (since our whole method will be asynchronous)
      var httpPostSync = Meteor.wrapAsync(HTTP.post);

      // post request
      var res = httpPostSync(authUrl, 
        {
          // params for post request
          params: {
            "grant_type": "client_credentials", 
            "client_id": Meteor.settings.client_id,
            "client_secret": Meteor.settings.client_secret
          }});
      
      //return the only relevant field
      console.log("auth get called:");
      console.log(res);
      return JSON.parse(res.content).access_token;
    
    } else {
      
      // return cached key
      return authKey;
    
    }
  },
  // search by location, returns array of businesses
  'yelp.search'(location) {
    console.log("yelp.search called!");
    var httpGetSync = Meteor.wrapAsync(HTTP.get);
    var meteorCallSync = Meteor.wrapAsync(Meteor.call);

    var authKey = meteorCallSync('yelp.authorize');
    console.log("AUTH KEY: ");
    console.log(authKey);
    var res = httpGetSync(searchUrl,
      {
        "params": {
          "location": location,
          "categories": "arts"
        },
        "headers": {
          "Authorization": "Bearer " + authKey 
        }
      });
    console.log("yelp search called:");
    console.log(res);
    return JSON.parse(res.content).businesses;
  }
});