import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SidebarContainer } from "../components/Sidebar";
import { ActiveChat } from "../components/ActiveChat";
import { SocketContext } from "../context/socket";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [...conversations];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post("/api/messages", body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit("new-message", {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    const data = await saveMessage(body);
    try {
      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback(
    (recipientId, message) => {
      let newConversations = [...conversations];
      newConversations.forEach((convo) => {
        if (convo.otherUser.id === recipientId) {
          convo.messages = [...convo.messages, message];
          convo.latestMessageText = message.text;
          convo.id = message.conversationId;
          convo.readStatus = {
            isRead: true,
            unreadMessagesCount: 0,
          };
        }
      });
      setConversations(newConversations);
    },
    [setConversations, conversations]
  );

  const addMessageToConversation = useCallback(
    (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender = null, recipientId } = data;
      let newConversations = [...conversations];
      if (sender !== null) {
        const newConvo = {
          id: message.conversationId,
          otherUser: sender,
          messages: [message],
          readStatus: {
            isRead: false,
            unreadMessagesCount: 1,
          },
        };
        newConvo.latestMessageText = message.text;
        console.log(recipientId);
        if (recipientId === user.id || message.senderId === user.id) {
          newConversations = [newConvo, ...newConversations];
        }
      }
      newConversations.forEach((convo) => {
        if (convo.id === message.conversationId) {
          convo.latestMessageText = message.text;
          // This is the sender's conversation
          if (message.senderId === user.id) {
            console.log("a");
            convo.readStatus.isRead = true;
            convo.readStatus.unreadMessagesCount = 0;
          } else if (
            // The otherUser's conversation, and not being activeConversation
            recipientId === user.id &&
            activeConversation !== convo.otherUser.username
          ) {
            console.log("b");
            if (!convo.hasOwnProperty("readStatus")) {
              convo.readStatus = {};
            }
            convo.readStatus.isRead = false;
            convo.readStatus.unreadMessagesCount
              ? (convo.readStatus.unreadMessagesCount += 1)
              : (convo.readStatus.unreadMessagesCount = 1);
          } else if (
            recipientId === user.id &&
            activeConversation === convo.otherUser.username
          ) {
            console.log("c");
            convo.readStatus.isRead = true;
            convo.readStatus.unreadMessagesCount = 0;
            message.isRead = true;
            const putMessage = async () => {
              await axios.put("/api/messages", {
                conversationId: message.conversationId,
                messageId: message.id,
                isRead: true,
              });
            };
            try {
              putMessage();
              socket.emit("seen-message", message.conversationId);
            } catch (error) {
              console.error(error);
            }
          }
          console.log(convo);
          convo.messages = [...convo.messages, message];
        }
      });
      setConversations(newConversations);
    },
    [setConversations, conversations, activeConversation, socket, user]
  );

  const setActiveChat = async (username) => {
    let newConversations = [...conversations];
    let lastMessageOfActiveConvo = null;
    let activeConvoId = null;
    let isLatestMessageUnread = false;
    newConversations.forEach((convo) => {
      if (convo.otherUser.username === username) {
        if (convo.messages.length) {
          if (
            !convo.messages[convo.messages.length - 1].isRead &&
            convo.messages[convo.messages.length - 1].senderId !== user.id
          )
            isLatestMessageUnread = true;
          convo.readStatus.isRead = true;
          convo.readStatus.unreadMessagesCount = 0;
          lastMessageOfActiveConvo = convo.messages[convo.messages.length - 1];
          activeConvoId = convo.id;
        }
      }
    });
    setConversations(newConversations);
    setActiveConversation(username);
    // Only PUT if the latest message is unread
    if (isLatestMessageUnread) {
      await axios.put("/api/messages", {
        conversationId: activeConvoId,
        messageId: lastMessageOfActiveConvo.id,
        isRead: true,
      });
      socket.emit("seen-message", activeConvoId);
    }
  };

  const seenMessage = useCallback(
    (conversationId) => {
      let newConversations = [...conversations];
      newConversations.forEach((convo) => {
        if (convo.id === conversationId) {
          let newConvoMessages = [...convo.messages];
          newConvoMessages.forEach((message) => {
            message.isRead = true;
          });
          convo.messages = newConvoMessages;
          convo.readStatus.isRead = true;
          convo.readStatus.unreadMessagesCount = 0;
        }
      });
      setConversations(newConversations);
    },
    [setConversations, conversations]
  );

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get("/api/conversations");
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on("add-online-user", addOnlineUser);
    socket.on("remove-offline-user", removeOfflineUser);
    socket.on("new-message", addMessageToConversation);
    socket.on("seen-message", seenMessage);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("add-online-user", addOnlineUser);
      socket.off("remove-offline-user", removeOfflineUser);
      socket.off("new-message", addMessageToConversation);
      socket.off("seen-message", seenMessage);
    };
  }, [
    addMessageToConversation,
    addOnlineUser,
    seenMessage,
    removeOfflineUser,
    socket,
  ]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push("/login");
      else history.push("/register");
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
        />
      </Grid>
    </>
  );
};

export default Home;
