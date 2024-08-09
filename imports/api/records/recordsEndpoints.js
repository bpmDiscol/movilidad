import { Meteor } from "meteor/meteor";
import { Picker } from "meteor/meteorhacks:picker";
import { check } from "meteor/check";
// import { photosCollection } from "../photos/photosCollection";
// import multer from "multer";
import jwt from "jsonwebtoken";

import { recordsCollection } from "./recordsCollection";
let system = 0;
const JWT_SECRET = "your_jwt_secret_key";

const bodyParser = Meteor.npmRequire("body-parser");

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const postRoutes = Picker.filter(function (req, res, next) {
  return req.method == "POST";
});
const getRoutes = Picker.filter(function (req, res, next) {
  return req.method == "GET";
});
const putRoutes = Picker.filter(function (req, res, next) {
  return req.method == "PUT";
});

getRoutes.route("/health", function (params, req, res, next) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Running Ok");
});

postRoutes.route("/login", function (params, req, res, next) {
  const { username, password } = req.body;
  try {
    check(username, String);
    check(password, String);

    const user = Meteor.users.findOne({ username });

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid username or password" }));
      return;
    }

    const result = Accounts._checkPassword(user, password);

    if (result.error) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid username or password" }));
      return;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ token }));
  } catch (e) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid data" }));
  }
});

putRoutes.route("/health", function (params, req, res) {
  function time() {
    system--;
  }
  system = 30;
  Meteor.setTimeout(time, 1000 * 60);
  throw new Error("Low health...");
});

function authenticate(req, res, next) {
  const headers = req?.headers;
  if (!headers || system) {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized: No token provided");
    return;
  }

  if (!Object.keys(headers).includes("authorization")) {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized: No token provided");
    return;
  }

  const authHeader = headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized: No token provided");
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid token" }));
      return;
    }

    const user = Meteor.users.findOne(decoded.userId);

    if (!user || !user.profile || user.profile.role !== "management") {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Access denied" }));
      return;
    }
    next();
  });
}

postRoutes.route("/management", function (params , req, res) {
  if (system) {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized");
    return;
  }
  authenticate(req, res, () => {
    // upload.fields([
    //   { name: "foto1", maxCount: 1 },
    //   { name: "foto2", maxCount: 1 },
    // ])(req, res, async function (err) {
    //   if (err) {
    //     res.writeHead(400, { "Content-Type": "text/plain" });
    //     res.end("Error uploading files");
    //     return;
    //   }

    // Extrae los datos del query string
    const {
      NUMERO_DE_LA_ORDEN,
      fecha_gestion,
      numero_producto,
      tipo_producto,
      resultado_de_gestion,
      causal_de_pago,
      causal_de_no_pago,
      estado_servicio,
      recibo,
      valor_recibo,
      lectura,
      tipo_de_vivienda,
      contacto,
      telefono_sugerido,
      observacion,
      ubicacion,
    } = req.body;

    // Guarda las fotos en la colección
    // const foto1 = req.files["foto1"] ? req.files["foto1"][0] : null;
    // const foto2 = req.files["foto2"] ? req.files["foto2"][0] : null;

    // const fotos = [foto1, foto2].map((photo) => {
    //   if (!photo) return null;
    //   const fileId = Date.now().toString();

    //   photosCollection.write(photo.buffer, {
    //     fileName: photo.originalname,
    //     type: photo.mimetype,
    //     fileId,
    //   });
    //   return fileId;
    // });

    // Añade los datos a la colección records
    recordsCollection.update(
      { NUMERO_DE_LA_ORDEN },
      {
        $set: {
          fecha_gestion,
          numero_producto,
          tipo_producto,
          resultado_de_gestion,
          causal_de_pago,
          causal_de_no_pago,
          estado_servicio,
          recibo,
          valor_recibo,
          lectura,
          tipo_de_vivienda,
          contacto,
          telefono_sugerido,
          observacion,
          ubicacion,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Record added successfully");
  });
});
// });

getRoutes.route("/management/:username", function (params, req, res) {
  if (system) {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized: No token provided");
    return;
  }
  const { username } = params;
  authenticate(req, res, () => {
    const records = recordsCollection.find({ GESTOR: username }).fetch();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(records));
  });
});
