const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

require("dotenv").config({
  path: "./.env",
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

//Define a message object with a seen property
const createMessge = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
});

io.on("connection", (socket) => {
  //when connection
  console.log(`a user is connected`);

  //take userid and socketid from user

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  const messages = {}; //object to track messages

  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const message = createMessge({ senderId, receiverId, text, images });

    const user = getUser(receiverId);

    //store message in messages object
    if (!messages[receiverId]) {
      messages[receiverId] = [message];
    } else {
      messages[receiverId].push(message);
    }

    //send message to receiver

    io.to(user?.socketId).emit("getMessage", message);
  });

  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const user = getUser(senderId);

    //update seen flag for the message
    if (messages[senderId]) {
      const message = messages[senderId].find(
        (message) =>
          message.receiverId === receiverId && message.Id === messageId
      );

      if (message) {
        message.seen = true;

        //send a message seen event to sender
        io.to(user?.socketId).emit("messageSeen", {
          senderId,
          receiverId,
          messageId,
        });
      }
    }
  });

  //update and get last last message
  socket.on("updateLastMesage", ({ lastMessage, lastMessagesId }) => {
    io.emit("getLastMessage", {
      lastMessage,
      lastMessagesId,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log(`a user disconnected!`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`server is running on port ${process.env.PORT || 4000}`);
});
