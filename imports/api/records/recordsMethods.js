import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { recordsCollection } from "./recordsCollection";
import moment from "moment";

Meteor.methods({
  async createRecord(record, leaderId) {
    const _id = Random.id(10);
    recordsCollection.remove({
      NUMERO_DE_LA_ORDEN: record.NUMERO_DE_LA_ORDEN,
    });

    return recordsCollection.insert({ ...record, leaderId, _id });
  },
  async getRecords(page, pageSize, filters = {}, sort) {
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 50;
    const project = Meteor.users.findOne(this.userId).profile.project;

    let filter = { project };
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
  async updateRecordManager(recordId, managerId, leaderId) {
    return await recordsCollection.updateAsync(
      { NUMERO_DE_LA_ORDEN: recordId, leaderId },
      {
        $set: {
          GESTOR: managerId,
          status: "pending",
          updatedAt: "",
          fecha_gestion: "",
        },
      },
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
    leaderId,
  }) {
    let query = {};

    if (leaderId) query.leaderId = leaderId;

    if (managerId) {
      query["GESTOR"] = managerId;
    }

    if (period) {
      query["period"] = period;
    }

    if (date) {
      // Normaliza la fecha proporcionada a un objeto Date
      const normalizedDate = moment(date, "DD/MM/YYYY").startOf("day").toDate();

      query["updatedAt"] = normalizedDate;
    }

    if (startDate && endDate) {
      // Normaliza las fechas proporcionadas a objetos Date
      const normalizedStartDate = moment(startDate, "DD/MM/YYYY")
        .startOf("day")
        .toDate();
      const normalizedEndDate = moment(endDate, "DD/MM/YYYY")
        .endOf("day")
        .toDate();

      query["updatedAt"] = {
        $gte: normalizedStartDate,
        $lte: normalizedEndDate,
      };
    }

    const pages = await recordsCollection
      .rawCollection()
      .aggregate([
        {
          $match: query, // Filtrar los documentos según el criterio de búsqueda
        },
        {
          $sort: { [sortField]: sortOrder }, // Ordenar los documentos según el campo y orden
        },
        {
          $facet: {
            metadata: [{ $count: "totalCount" }], // Contar el número total de documentos
            data: [
              { $skip: (page - 1) * pageSize }, // Saltar registros para paginación
              { $limit: pageSize }, // Limitar la cantidad de registros por página
              
            ],
          },
        },
        {
          $project: {
            data: 1, // Mantener solo los datos y el conteo total en la salida
            totalCount: { $arrayElemAt: ["$metadata.totalCount", 0] },
          },
        },
      ])
      .toArray();

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
                      deudaTotalAsignada: {
                        $sum: { $toDouble: "$DEUDA_TOTAL_ASIGNADA" },
                      },
                      indicadorCounts: {
                        $push: { $toUpper: "$INDICADOR" },
                      },
                      descripcionTipoProductoCounts: {
                        $push: { $toUpper: "$DESCRIPCION_TIPO_PRODUCTO" },
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
                deudaTotalAsignada: {
                  $ifNull: [
                    { $arrayElemAt: ["$metadata.deudaTotalAsignada", 0] },
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
                        cond: {
                          $in: ["$$ind", ["NORMALIZACION", "NORMALIZACIÓN"]],
                        },
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
                        cond: { $in: ["$$ind", ["CONTENCION", "CONTENCIÓN"]] },
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
                        cond: { $eq: ["$$ind", "CASTIGADO"] },
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

    const report = pages[0].totalCount
      ? await recordsCollection
          .rawCollection()
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: "$GESTOR",
                asignadas: { $sum: 1 },
                totalDeudaCorrienteAsignada: {
                  $sum: { $toDouble: "$DEUDA_TOTAL_ASIGNADA" },
                },
                gestionadas: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0],
                  },
                },
                totalDeudaCorrienteGestionada: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "reviewed"] },
                      { $toDouble: "$DEUDA_TOTAL_ASIGNADA" },
                      0,
                    ],
                  },
                },
                pendientes: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                totalAsignadas: { $sum: "$asignadas" },
                totalDeudaCorrienteAsignada: {
                  $sum: "$totalDeudaCorrienteAsignada",
                },
                totalGestionadas: { $sum: "$gestionadas" },
                totalDeudaCorrienteGestionada: {
                  $sum: "$totalDeudaCorrienteGestionada",
                },
                totalPendientes: { $sum: "$pendientes" },
                gestores: {
                  $push: {
                    gestor: "$_id",
                    asignadas: "$asignadas",
                    totalDeudaCorrienteAsignada: "$totalDeudaCorrienteAsignada",
                    gestionadas: "$gestionadas",
                    totalDeudaCorrienteGestionada:
                      "$totalDeudaCorrienteGestionada",
                    pendientes: "$pendientes",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalAsignadas: 1,
                totalDeudaCorrienteAsignada: 1,
                totalGestionadas: 1,
                totalDeudaCorrienteGestionada: 1,
                totalPendientes: 1,
                gestores: 1,
              },
            },
          ])
          .toArray()
      : {};

    return { ...pages, totales, report };
  },
});
