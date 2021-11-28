import "dotenv/config";

const environment = process.env.NODE_ENV || "development";
const config = require("../../knexfile")[environment];
export default require("knex")(config);
