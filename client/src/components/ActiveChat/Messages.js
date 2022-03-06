import React from "react";
import { Box, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SenderBubble, OtherUserBubble } from ".";
import moment from "moment";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  avatar: {
    height: 20,
    width: 20,
    marginTop: 6,
    marginBottom: 5,
  },
}));

const Messages = (props) => {
  const { messages, otherUser, userId, latestReadMessage } = props;
  const classes = useStyles();

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <React.Fragment key={message.id + "-fragment"}>
            <SenderBubble key={message.id} text={message.text} time={time} />
            {latestReadMessage && message.id === latestReadMessage.id && (
              <Box
                className={classes.root}
                key={message.id + "-box-" + otherUser.username}
              >
                <Avatar
                  key={message.id + "-avatar-" + otherUser.username}
                  alt={otherUser.username}
                  src={otherUser.photoUrl}
                  className={classes.avatar}
                />
              </Box>
            )}
          </React.Fragment>
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
