import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import { orders, units, holidays, lines } from './src/routes/index.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
app.use(express.json({ limit: "50mb" }))

const path = __dirname + '/client/build/';


app.use(express.static(path));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

let corsOptions = {
  origin: ['http://192.168.1.19:3000', 'http://localhost:3000', 'http://localhost:3002'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
});

app.use("/orders", orders);
app.use("/units", units);
app.use("/holidays", holidays);
app.use("/lines", lines);

BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});