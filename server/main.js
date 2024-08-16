import { Meteor } from "meteor/meteor";
import settings from "../settings.json";

import "../imports/api/records/recordsIndex";
import "../imports/api/photos/photosIndex";
import "../imports/api/roles/rolesMethods";
import "../imports/api/documents/documentsIndex";
import { recordsCollection } from "../imports/api/records/recordsCollection";

Meteor.startup(async () => {
  const admin = Meteor.users.findOne({ username: settings.private.admin.user });
  if (!admin) {
    Accounts.createUser({
      username: settings.private.admin.user,
      password: settings.private.admin.password,
      profile: { role: "admin" },
    });
  }
   
});
