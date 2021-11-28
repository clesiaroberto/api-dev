import "dotenv/config";
import "babel-polyfill";
import { app } from "./app";
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API is running ${port}`));
