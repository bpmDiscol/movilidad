import { Meteor } from "meteor/meteor";
import { documentsCollection } from "./documentsCollection";

Meteor.publish("documents", () => documentsCollection.find().cursor);
