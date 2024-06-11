import { Socket } from "socket.io";
import { v4 as UUIDv4 } from "uuid";
import IRoomParams from "../interfaces/IRoomParams";

// The below map stores for a room what all peers have joined
const rooms: Record<string, string[]> = {};

const roomHandler = (socket: Socket) => {
  const createRoom = () => {
    const roomId = UUIDv4(); // this will be our unique room id in which multiple connections will exchange data
    socket.join(roomId); // We will make the socket connection enter the new room

    rooms[roomId] = [];

    socket.emit("room-created", { roomId }); // We will emit an event from server side that socket connection has been added to a room
    console.log("Room created with id", roomId);
  };

  // This function is executed every time a user ( creater or joinee)
  // joins a room

  const joinedRoom = ({ roomId, peerId }: IRoomParams) => {
    if (rooms[roomId]) {
      // If the given roomId exist in the in memory db
      console.log(
        `New user has joined room ${roomId} with peer is as ${peerId}`
      );
      // the moment  new user joins, add the peerId to the key of roomId
      rooms[roomId].push(peerId);
      socket.join(roomId); // make the user join the socket room

      // below event is for logging purpose
      socket.emit("get-users", {
        roomId,
        participants: rooms[roomId],
      });

      // Whenever anyone joins the room

      socket.on("ready", () => {
        // From the frontend once someone joins the room we will emit a ready event
        // then from our server we will emit an event to all the clients conn that a new peer has added
        socket.to(roomId).emit("user-joined", { peerId });
      });
    }
  };

  socket.on("create-room", createRoom);
  socket.on("joined-room", joinedRoom);
};

export default roomHandler;
