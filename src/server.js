import express from "express";
import http from "http";
import { Server } from "socket.io";
import ContainerFake from "./containers/ContainerFake.js";
import ContainerFs from "./containers/ContainerFs.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const productsApi = new ContainerFake();
const messagesApi = new ContainerFs("./mensajes.json");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// conexión con socket
io.on("connection", async (socket) => {
  console.log("Un cliente se ha conectado");

  const chat = await messagesApi.getNormalizedMensajes();
  socket.emit("chat", chat);

  socket.on("new-message", async (data) => {
    await messagesApi.save(data);
    const chat = await messagesApi.getNormalizedMensajes();
    io.sockets.emit("chat", chat);
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Genero los productos con faker.js
app.get("/api/productos-test", (req, res) => {
  res.json(productsApi.getProducts(5));
});

const srv = server.listen(8080, () => {
  console.log("servidor conectado!");
});
