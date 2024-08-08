import { Meteor } from "meteor/meteor";
import { photosCollection } from "./photosCollection";

Meteor.publish("backgroundFiles", function () {
  return photosCollection.find({}).cursor;
});
