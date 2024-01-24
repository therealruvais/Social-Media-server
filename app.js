require("dotenv").config();
require("express-async-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT || 2024;
const connectDB = require("./DB/connectDB");


const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const authRoute = require('./routes/authRoute')
const postRoute = require('./routes/postRoute')
const notifyRoute = require('./routes/notifyRoute')
const chatRoute = require('./routes/chatRoute')
const messageRoute = require('./routes/messageRoute')

const express = require("express");
const app = express();

app.use(
  cors({
    origin: "https://social-media-application-lyart.vercel.app",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://social-media-application-lyart.vercel.app"
  );
  next();
});



app.use('/api/user',authRoute)
app.use('/api/post',postRoute)
app.use("/api/notify", notifyRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);


app.get('/', (req, res) => {
    res.send('hello')
})

app.use(notFound)
app.use(errorHandler)


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`server is running at ${port}`);
    });
  } catch (error) {
    console.log("something is wrong with connection" + error);
  }
};
start();
