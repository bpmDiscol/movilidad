import { Meteor } from "meteor/meteor";

export function loginDiscol({ username, password }, callback) {
  Meteor.loginWithPassword(username, password, (err) => {
    if (err) callback(err);
  });
}
