const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const { get_Current_User, user_Disconnect, join_User } = require("./dummyuser");

app.use(express());

const port = 8000;

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);

      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// app.use(cors());

var server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `.green)
);

const io = socket(server, {
  cors: {
    origin: "*",
  },
});

//initializing the socket io connection
io.on("connection", (socket) => {
  //for a new user joining the room
  socket.on("joinRoom", ({ username, roomname }) => {
    //* create user
    console.log(username, roomname)
    const p_user = join_User(socket.id, username, roomname);
    console.log(socket.id, "=id");
    socket.join(p_user.chatRoomId);

    //display a welcome message to the user who have joined a room
    // socket.emit("message", {
    //   userId: p_user.id,
    //   username: p_user.username,
    //   data: `Welcome ${p_user.username}`,
    // });

    //displays a joined room message to all other room users except that particular user
    // socket.broadcast.to(p_user.chatRoomId).emit("message", {
    //   userId: p_user.id,
    //   username: p_user.username,
    //   data: `${p_user.username} has joined the chat`,
    // });
  });

  //user sending message
  socket.on("chat", (data) => {
    //gets the room user and the message sent
    const p_user = get_Current_User(socket.id);

    io.to(p_user.chatRoomId).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      data: data,
    });
  });

  //when the user exits the room
  // socket.on("disconnect", () => {
  //   //the user is deleted from array of users and a left room message displayed
  //   const p_user = user_Disconnect(socket.id);

  //   if (p_user) {
  //     io.to(p_user.chatRoomId).emit("message", {
  //       userId: p_user.id,
  //       username: p_user.username,
  //       data: `${p_user.username} has left the chat`,
  //     });
  //   }
  // });
});
