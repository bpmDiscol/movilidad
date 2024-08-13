import { Meteor } from "meteor/meteor";
import { documentsCollection } from "./documentsCollection";

Meteor.methods({
  createDocument(data) {
    documentsCollection.insert({ ...data, createdAt: Date.now() });
  },
  async getDocuments(page, pageSize) {
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 50;
    const documents = await documentsCollection
      .rawCollection()
      .aggregate([
        {
          $sort: { createdAt: 1 },
        },
        {
          $facet: {
            metadata: [{ $count: "totalCount" }],
            data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ["$metadata.totalCount", 0] },
          },
        },
      ])
      .toArray();

    return {
      data: documents[0].data,
      total: documents[0].totalCount,
    };
  },
});
