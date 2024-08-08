import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

Meteor.methods({
  getUsersByRole(role) {
    check(role, String);

    return Meteor.users.find({ "profile.role": role }).fetch();
  },
  createUserWithRole(username, password, role) {
    check(username, String);
    check(password, String);
    check(role, String);

    Accounts.createUser({
      username,
      password,
      profile: { role },
    });
  },
  assignManagersToLeader(leaderId, managerIds) {
    check(leaderId, String);
    check(managerIds, [String]);

    Meteor.users.update(leaderId, {
      $set: { "profile.managers": managerIds },
    });
  },
  getManagersForLeader(leaderId) {
    check(leaderId, String);

    const leader = Meteor.users.findOne(leaderId);

    if (!leader) {
      throw new Meteor.Error("Leader not found");
    }

    return leader.profile.managers || [];
  },
  getLoggedInLeaderManagers(userId) {
    const user = Meteor.users.findOne(userId);
    if (!user || user.profile.role !== "leader") {
      throw new Meteor.Error("not-authorized");
    }

    return user.profile.managers || [];
  },
  getManagers(leaderId) {
    const user = Meteor.users.findOne(leaderId);
    const managers = user.profile?.managers || [];
    return managers.map((managerId) => {
      const manager = Meteor.users.findOne(managerId);
      return { username: manager.username, id: manager._id };
    });
  },
});
