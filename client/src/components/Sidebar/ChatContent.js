import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  previewTextUnread: {
    fontSize: 12,
    letterSpacing: -0.17,
    fontWeight: "bold",
  },
  notification: {
    display: "flex",
    justifyContent: 'space-between'
  },
  end: {
    marginLeft: "auto"
  }
}));

const ChatContent = ({ conversation }) => {
  const classes = useStyles();
  const { otherUser } = conversation;
  const latestMessageText = conversation.id && conversation.latestMessageText;
  const isRead = (conversation.id && conversation.readStatus.isRead);

  return (

    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        {isRead
          ? <Typography className={classes.previewText}>{latestMessageText}</Typography>
          : <Typography className={classes.previewTextUnread}>
                  {latestMessageText}
            </Typography>
        }
      </Box>
    </Box>
  );
};

export default ChatContent;
