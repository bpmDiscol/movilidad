import { Meteor } from "meteor/meteor";
import { recordsCollection } from "./recordsCollection";
import moment from "moment";

function formatDate(date) {
  if (!date) return null;

  const [day, month, year] = date.split("/");

  // Ensure day and month are two digits
  const formattedDay = day.length === 1 ? `0${day}` : day;
  const formattedMonth = month.length === 1 ? `0${month}` : month;

  return `${formattedDay}/${formattedMonth}/${year}`;
}

Meteor.methods({
  async createRecord(record) {
    try {
      const existingDocument = await recordsCollection.findOneAsync({
        NUMERO_DE_LA_ORDEN: record["NUMERO_DE_LA_ORDEN"],
      });

      await recordsCollection.updateAsync(
        { NUMERO_DE_LA_ORDEN: record["NUMERO_DE_LA_ORDEN"] },
        { $set: record },
        { upsert: true }
      );
      const wasInserted = !existingDocument;
      // const wasUpdated = existingDocument && result > 0;
      // Check if the record was modified
      return { success: true, wasInserted };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  },
  async getRecords(page, pageSize, filters = {}, sort) {
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 50;

    let filter = {};
    if (filters)
      for (const [key, value] of Object.entries(filters)) {
        key === "GESTOR"
          ? value == 0
            ? (filter[key] = { $eq: null })
            : (filter[key] = { $eq: value })
          : (filter[key] = { $regex: value, $options: "i" });
      }

    const { sortField, sortOrder } = sort;
    const records = await recordsCollection
      .rawCollection()
      .aggregate([
        {
          $match: filter,
        },
        {
          $sort: { [sortField]: sortOrder },
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
    sortField,
    sortOrder = 1,
  }) {
    let query = {};

    if (managerId) {
      query["GESTOR"] = managerId;
    }

    if (period) {
      query["period"] = period;
    }

    if (date) {
      // Normaliza la fecha proporcionada a un objeto Date
      const normalizedDate = moment(date, "DD/MM/YYYY").startOf("day").toDate();

      query["fecha_gestion"] = normalizedDate;
    }

    if (startDate && endDate) {
      // Normaliza las fechas proporcionadas a objetos Date
      const normalizedStartDate = moment(startDate, "DD/MM/YYYY")
        .startOf("day")
        .toDate();
      const normalizedEndDate = moment(endDate, "DD/MM/YYYY")
        .endOf("day")
        .toDate();

      query["fecha_gestion"] = {
        $gte: normalizedStartDate,
        $lte: normalizedEndDate,
      };
    }

    const pages = await recordsCollection
      .rawCollection()
      .aggregate([
        {
          $match: query,
        },
        {
          $sort: { [sortField]: sortOrder },
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
    console.log(pages);

    const totales = pages[0].totalCount
      ? await recordsCollection
          .rawCollection()
          .aggregate([
            {
              $match: query,
            },
            {
              $facet: {
                metadata: [
                  {
                    $group: {
                      _id: null,
                      totalDeudaCorriente: { $sum: "$TOTAL_DEUDA_CORRIENTE" },
                      indicadorCounts: {
                        $push: "$INDICADOR",
                      },
                      descripcionTipoProductoCounts: {
                        $push: "$DESCRIPCION_TIPO_PRODUCTO",
                      },
                    },
                  },
                ],
              },
            },
            {
              $project: {
                data: 1,
                totalCount: { $arrayElemAt: ["$metadata.totalCount", 0] },
                totalDeudaCorriente: {
                  $ifNull: [
                    { $arrayElemAt: ["$metadata.totalDeudaCorriente", 0] },
                    0,
                  ],
                },
                indicadorCounts: {
                  Normalizacion: {
                    $size: {
                      $filter: {
                        input: {
                          $arrayElemAt: ["$metadata.indicadorCounts", 0],
                        },
                        as: "ind",
                        cond: { $eq: ["$$ind", "Normalizacion"] },
                      },
                    },
                  },
                  Contencion: {
                    $size: {
                      $filter: {
                        input: {
                          $arrayElemAt: ["$metadata.indicadorCounts", 0],
                        },
                        as: "ind",
                        cond: { $eq: ["$$ind", "Contencion"] },
                      },
                    },
                  },
                  Castigado: {
                    $size: {
                      $filter: {
                        input: {
                          $arrayElemAt: ["$metadata.indicadorCounts", 0],
                        },
                        as: "ind",
                        cond: { $eq: ["$$ind", "Castigado"] },
                      },
                    },
                  },
                },
                descripcionTipoProductoCounts: {
                  GAS: {
                    $size: {
                      $filter: {
                        input: {
                          $arrayElemAt: [
                            "$metadata.descripcionTipoProductoCounts",
                            0,
                          ],
                        },
                        as: "prod",
                        cond: { $eq: ["$$prod", "GAS"] },
                      },
                    },
                  },
                  BRILLA: {
                    $size: {
                      $filter: {
                        input: {
                          $arrayElemAt: [
                            "$metadata.descripcionTipoProductoCounts",
                            0,
                          ],
                        },
                        as: "prod",
                        cond: { $eq: ["$$prod", "BRILLA SURTIGAS"] },
                      },
                    },
                  },
                  SERVICIOS_FINANCIEROS: {
                    $size: {
                      $filter: {
                        input: {
                          $arrayElemAt: [
                            "$metadata.descripcionTipoProductoCounts",
                            0,
                          ],
                        },
                        as: "prod",
                        cond: { $eq: ["$$prod", "SERVICIOS FINANCIEROS"] },
                      },
                    },
                  },
                },
              },
            },
          ])
          .toArray()
      : {};

    console.log(totales);
    return { ...pages, totales };
  },
});
