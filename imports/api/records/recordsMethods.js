import { Meteor } from "meteor/meteor";
import { recordsCollection } from "./recordsCollection";
import moment from "moment";

Meteor.methods({
  async createRecord(record) {
    return await recordsCollection
      .updateAsync(
        { NUMERO_DE_LA_ORDEN: record["NUMERO_DE_LA_ORDEN"] },
        { $setOnInsert: record },
        { upsert: true }
      )
      .catch((e) => console.log(e));
  },
  async getRecords(page, pageSize, filters = {}) {
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 50;

    let filter = {};
    if (filters)
      for (const [key, value] of Object.entries(filters)) {
        filter[key] = { $regex: value, $options: "i" };
      }

    const records = await recordsCollection
      .rawCollection()
      .aggregate([
        {
          $match: filter,
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
      data: records[0].data,
      total: records[0].totalCount,
    };
  },
  async updateRecordManager(recordId, managerId) {
    console.log({ recordId, managerId });
    return await recordsCollection.updateAsync(
      { NUMERO_DE_LA_ORDEN: recordId },
      { $set: { GESTOR: managerId } },
      { upsert: true }
    );
  },
  reportManagement: async function ({
    page,
    pageSize,
    managerId,
    period,
    date,
    startDate,
    endDate,
  }) {
    let query = {};

    if (managerId) {
      query["GESTOR"] = managerId;
    }

    if (period) {
      query["period"] = period;
    }

    if (date) {
      const startOfDay = moment(date, "DD/MM/YYYY").startOf("day").toDate();
      const endOfDay = moment(date, "DD/MM/YYYY").endOf("day").toDate();
      query["fecha_gestion"] = { $gte: startOfDay, $lte: endOfDay };
    }

    if (startDate && endDate) {
      const start = moment(startDate, "DD/MM/YYYY").startOf("day").toDate();
      const end = moment(endDate, "DD/MM/YYYY").endOf("day").toDate();
      query["fecha_gestion"] = { $gte: start, $lte: end };
    }
    return await recordsCollection
      .rawCollection()
      .aggregate([
        {
          $match: query,
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
  },
});
