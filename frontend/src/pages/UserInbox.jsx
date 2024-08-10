import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import axios from "axios";
import { backend_url, server } from "../server";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import styles from "../styles/style";
const ENDPOINT = "http://localhost:4000/";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);

  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(""); // " "
  const [currentChat, setCurrentChat] = useState();
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          {
            withCredentials: true,
          }
        );
        setConversations(response.data.conversations);
      } catch (error) {
        console.log(error);
      }
    };
    getConversation();
  }, [user, messages]);

  useEffect(() => {
    if (user) {
      const userId = user?._id;
      socketId.emit("addUser", userId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    //setActiveStatus(online ? true : false);

    return online ? true : false;
  };

  //get messages

  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentChat?._id}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log(error);
      }
    };
    getMessage();
  }, [currentChat]);

  console.log(messages);

  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationsId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      //(member) => member.id !== user._id
      (member) => member !== user?._id
    );

    socketId.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        await axios
          .post(`${server}/message/create-new-message`, message)
          .then((res) => {
            setMessages([...messages, res.data.message]);
            updateLastMessage();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: user._id,
    });
    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      })
      .then((res) => {
        console.log(res.data.conversation);
        setNewMessage("");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="w-full">
      <Header />

      {!open && (
        <>
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Message
          </h1>
          {conversations &&
            conversations.map((item, index) => (
              <MessageList
                data={item}
                key={index}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={user?._id}
                userData={userData}
                setUserData={setUserData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
              />
            ))}
        </>
      )}

      {open && (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={user._id}
          userData={userData}
          activeStatus={activeStatus}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  userData,
  setUserData,
  online,
  setActiveStatus,
}) => {
  const [user, setUser] = useState([]);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/inbox?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user != me);
    const getUser = async () => {
      try {
        //const res = await axios.get(`${server}/user/user-info/${userId}`);
        const res = await axios.get(`${server}/shop/get-shop-info/${userId}`);

        setUser(res.data.user);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? " bg-[#00000010]" : "bg-transparent"
      } cursor-pointer `}
      onClick={(e) =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative">
        <img
          // src={`${backend_url}${userData?.avatar}`}
          src={`${user?.avatar?.url}`}
          alt=""
          className=" w-[50px] h-[50px] rounded-full"
        />
        {online ? (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px] " />
        ) : (
          <div className="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[2px] right-[2px] " />
        )}
      </div>
      <div className="pl-3">
        <h1 className="text-[18px] ">{user?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {data?.lastMessageId !== userData?._id
            ? "You:"
            : userData?.name.split(" ")[0] + ": "}{" "}
          {data?.lastMessage}
        </p>
      </div>
    </div>
  );
};

// const SellerInbox = ({
//   setOpen,
//   newMessage,
//   setNewMessage,
//   sendMessageHandler,
//   messages,
//   sellerId,
//   userData,
//   activeStatus,
// }) => {
//   return (
//     <div className="w-full min-h-full flex flex-col justify-between">
//       {/* message header*/}

//       <div className="w-full flex p-3 items-center justify-between bg-slate-200">
//         <div className="flex">
//           <img
//             src={`${backend_url}${userData?.avatar}`}
//             alt=""
//             className="w-[60px] h-[60px] rounded-full"
//           />
//           <div className="pl-3">
//             <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
//             <h1>{activeStatus ? "Active Now" : ""}</h1>
//           </div>
//         </div>
//         <AiOutlineArrowRight
//           size={20}
//           className="cursor-pointer"
//           onClick={() => setOpen(false)}
//         />
//       </div>

//       {/* mesages */}
//       <div className="px-3 h-[65vh] py-3 overflow-auto">
//         {messages &&
//           messages.map((item, index) => {
//             return (
//               <div
//                 className={`flex w-full my-2 ${
//                   item.sender === sellerId ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 {item.sender !== sellerId && (
//                   <img
//                     src="http://localhost:8000/uploads/raza1-1722281617940-139387770.png"
//                     alt=""
//                     className="w-[40px] h-[40px] rounded-full mr-3"
//                   />
//                 )}

//                 {/* <div>
//               <div className="w-max p-2 rounded bg-[#38c776] text-[#fff] h-min">
//                 <p>{item.text}</p>
//               </div>
//               <p className="text-[12px] text-[#000000d3] pt-1">
//                 {format(item.createdAt)}
//               </p>
//             </div> */}

//                 {item.text !== "" && (
//                   <div>
//                     <div
//                       className={`w-max p-2 rounded ${
//                         item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
//                       } text-[#fff] h-min`}
//                     >
//                       <p>{item.text}</p>
//                     </div>

//                     <p className="text-[12px] text-[#000000d3] pt-1">
//                       {format(item.createdAt)}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//       </div>

//       {/* send message input */}

//       <form
//         aria-required={true}
//         className="p-3 mb-3 relative w-full flex justify-between items-center"
//         onSubmit={sendMessageHandler}
//       >
//         <div className="w-[3%]">
//           <TfiGallery className="cursor-pointer" size={20} />
//         </div>
//         <div className="w-full">
//           <input
//             type="text"
//             required
//             placeholder="Enter your message..."
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             className={`${styles.input}`}
//           />
//           <input type="submit" value="Send" className="hidden" id="send" />
//           <label htmlFor="send">
//             <AiOutlineSend
//               size={20}
//               className="absolute right-4 top-5 cursor-pointer"
//             />
//           </label>
//         </div>
//       </form>
//     </div>
//   );
// };

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      {/* message header*/}

      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            // src={`${backend_url}${userData?.avatar}`}
            src={`${userData?.avatar?.url}`}
            alt=""
            className="w-[60px] h-[60px] rounded-full"
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
            <h1>{activeStatus ? "Active Now" : ""}</h1>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* mesages */}
      <div className="px-3 h-[65vh] py-3 overflow-auto">
        {messages &&
          messages.map((item, index) => {
            return (
              <div
                className={`flex w-full my-2 ${
                  item.sender === sellerId ? "justify-end" : "justify-start"
                }`}
              >
                {item.sender !== sellerId && (
                  <img
                    src="http://localhost:8000/uploads/raza1-1722281617940-139387770.png"
                    alt=""
                    className="w-[40px] h-[40px] rounded-full mr-3"
                  />
                )}

                {item.text !== "" && (
                  <div>
                    <div
                      className={`w-max p-2 rounded ${
                        item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
                      } text-[#fff] h-min`}
                    >
                      <p>{item.text}</p>
                    </div>

                    <p className="text-[12px] text-[#000000d3] pt-1">
                      {format(item.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* send message input */}

      <form
        aria-required={true}
        className="p-3 mb-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[3%]">
          <TfiGallery className="cursor-pointer" size={20} />
        </div>
        <div className="w-[97%]">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <input type="submit" value="Send" className="hidden" id="send" />
          <label htmlFor="send">
            <AiOutlineSend
              size={20}
              className="absolute right-4 top-5 cursor-pointer"
            />
          </label>
        </div>
      </form>
    </div>
  );
};


export default UserInbox;
