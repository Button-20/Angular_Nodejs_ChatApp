// require("./config/config");
require("./model/db");
const cors = require("cors");
const express = require("express");
const app = express();
const socketIO = require("socket.io");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Models
const User = require("./model/user.model");
const Message = require("./model/message.model");

// Socket.io
const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started at port : ${process.env.PORT}`)
);

// Socket.io connection event listener
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Check if user is already in database and if not, add him and set his status to online
  socket.on("join", async (user) => {
    try {
      const userInDb = await User.findOne({
        email: user.email,
      });
      if (!userInDb) {
        const newUser = new User({
          socketId: socket.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
          status: "online",
        });
        await newUser.save();
      } else {
        await User.updateOne(
          {
            email: user.email,
          },
          {
            status: "online",
            socketId: socket.id,
          }
        );
      }
      // Send all users to the client
      const users = await User.find();
      io.emit("users", users);
    } catch (error) {
      console.log(error);
    }
  });

  // Send message to the client and save it in the database
  socket.on("message", async (message) => {
    try {
      const newMessage = new Message({
        sender: message.sender,
        receiver: message.receiver,
        message: message.message,
      });
      await newMessage.save().then(async (res) => {
        const data = await res.populate(
          "sender receiver",
          "username picture email"
        );
        io.emit("message-received", data);
      });
    } catch (error) {
      console.log(error);
    }
  });

  // Get all messages between two users and send them to the client
  socket.on("getMessages", async (data) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: data.sender, receiver: data.receiver },
          { sender: data.receiver, receiver: data.sender },
        ],
      }).populate("sender receiver", "username picture email");
      io.to(socket.id).emit("messages", messages);
    } catch (error) {
      console.log(error);
    }
  });

  // Block users and send the updated users to the client
  socket.on("blockUser", async (data) => {
    try {
      await User.updateOne(
        {
          _id: data.sender,
        },
        {
          $push: {
            blacklisted: data.receiver,
          },
        }
      );
      const users = await User.find();
      io.emit("users", users);
    } catch (error) {
      console.log(error);
    }
  });

  // Disconnect event listener to set the user status to offline
  socket.on("disconnect", () => {
    // Set user status to offline
    User.updateOne(
      {
        socketId: socket.id,
      },
      {
        status: "offline",
      }
    ).then(() => {
      // Send all users to the client
      User.find().then((users) => {
        io.emit("users", users);
      });
    });
  });
});
