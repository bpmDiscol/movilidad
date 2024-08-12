import { Meteor } from "meteor/meteor";
import { photosCollection } from "./photosCollection";

function replaceBaseUrl(link) {
  return link.replace("localhost", process.env.ROOT_URL);
}

Meteor.methods({
  async getFileById(id) {
    return await photosCollection.find({ _id: id });
  },
  async getFileLink(id) {
    return photosCollection
      .find({})
      .fetch()
      .map(function (fileRef) {
        return {
          link: replaceBaseUrl(photosCollection.link(fileRef)),
          id: fileRef._id,
        };
      })
      .filter((dataLink) => dataLink.id == id);
  },
});
