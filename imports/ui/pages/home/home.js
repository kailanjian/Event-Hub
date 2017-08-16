import './home.html';

import '../../components/hello/hello.js';
import '../../components/info/info.js';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { Businesses } from '/imports/api/businesses/businesses.js';

var businesses = new ReactiveVar([]);
var message = new ReactiveVar();
var currSearch = undefined;

Template.App_home.onCreated(function() {
  Meteor.subscribe("businesses.all");
});

Template.App_home.onRendered(function() {
  currSearch = FlowRouter.getParam("searchQuery");
  if (currSearch) {
      addBusinesses(currSearch);
  }
});

Template.App_home.helpers({
  businesses() {
    return businesses.get();
  },
  numGoing() {
    // todo setup collection to track this
    return 0;
  },
  message() {
    return message.get();
  }
})

function login() {
  Meteor.loginWithTwitter(function(err) {
    if (!err) {
      console.log("logged in!");
    } else {
      console.log(err);
    }
  })
}

function loginSync() {
  var loginWithTwitterSync = Meteor.wrapAsync(Meteor.loginWithTwitter);
  loginWithTwitterSync();
}

function addBusinesses(searchText) {
  console.log("adding businesses");
  message.set("Loading...");
  Meteor.call("yelp.search", searchText, function(err, res) {
    if (err) {
      console.log(err);
      removeBusinesses();
      message.set("Error finding location, try again");

    } else {
      message.set("");
      console.log(res);
      businesses.set(res);
    }
  });
}
function removeBusinesses() {
  businesses.set([]);
}

Template.App_home.events({
  "submit #form-search"(event, template) {
    event.preventDefault();
    const searchText = template.find("#input-search").value;

    FlowRouter.go('/search/' + searchText);
    
    addBusinesses(searchText);
    template.find("#input-search").value = "";
    
    console.log("searching yelp...");
  },
  "click #button-login"(event, template) {
    event.preventDefault();

    login();
  },
  "click #button-logout"(event, template) {
    event.preventDefault();

    Meteor.logout(function(err) {
      if (!err) {
        console.log("logged out!");
        FlowRouter.go("/");
        removeBusinesses();
      } else {
        console.log(err);
      }
    });
  }
})

// business sub-template

Template.business.onCreated(function(){
  this.currBusiness = Businesses.findOne({businessId: this.data.id});
  console.log("USER: " + Meteor.userId())
  this.isUserGoing = new ReactiveVar(this.currBusiness ? this.currBusiness.usersGoing.includes(Meteor.userId()) : false);
})

Template.business.onRendered(function() {
});

Template.business.helpers({
  numGoing() {
    // duplicate mongo query is necessary to update helper reactively
    const currBusiness = Businesses.findOne({businessId: Template.instance().data.id});
    return currBusiness ? currBusiness.numGoing : 0;
  },
  isUserGoing() {
    return Template.instance().isUserGoing.get();
  }
});

Template.business.events({
  "click .button-going"(event, template) {
    if (!Meteor.user()) {
      loginSync();
      // todo delay and then set the button to be clicked
    } else {
      if (template.isUserGoing.get() == true) {
        Meteor.call("businesses.removeUser", template.data.id, Meteor.userId(), function(err, res) {
          if (!err) {
            template.isUserGoing.set(false);
          }
        });
      } else {
        // add user
        Meteor.call("businesses.addUser", template.data.id, Meteor.userId(), function(err, res) {
          if (!err) {
            template.isUserGoing.set(true);
          }
        });
      }
    }
  },
})

