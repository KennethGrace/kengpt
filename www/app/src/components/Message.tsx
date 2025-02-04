// The MessageBox component is used to display a message either sent from or received by the user. Messages sent by the
// user are displayed on the right side of the screen, while messages received by the user are displayed on the left
// side of the screen.

import React, { FC, useEffect, useMemo } from "react";
import {
  Slide,
  Typography,
  useTheme,
  Stack,
} from "@mui/material";

import { ChatMessage, ChatResponse, Role } from "../controllers/chat";
import { useChat } from "./contexts/ChatProvider";
import MessageBlock from "./message/MessageBlock";
import { ThoughtUtility } from "./message/components/Utilities";
import { getMarkdownBlocks } from "./message/components/Markdown";


// The MessageProps interface defines the properties that can be passed to the Message component.
interface MessageProps {
  message: ChatMessage;
  position: number;
}

// The MessageBox component is a functional component that displays a message either sent from or received by the user.
const Message: FC<MessageProps> = ({ message, position }) => {
  const theme = useTheme();
  const { localState: {
    activeProfile,
  }, deleteMemory } = useChat();
  const [show, setShow] = React.useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setShow(true), Math.min(position * 50, 250));
  });

  const [isUser, response] = useMemo(() => {
    // If the message is from the user, then isUser is true. Else, isUser is false.
    // If the message is from the assistant, then we cast the message to a ChatResponse. Else, response is undefined.
    return [
      message.role === Role.User,
      message.role === Role.Assistant ? (message as ChatResponse) : undefined,
    ]
  }, [message.role]);

  const ContentBlocks = useMemo(() => {
    const blocks: ContentBlock[] = [];
    for (const content of message.contents) {
      if (content.format === "text") {
        getMarkdownBlocks(content.content).forEach((block) => {
          blocks.push(block);
        });
      }
    }
    return blocks.map((block, index) => {
      return (
        <MessageBlock
          key={index}
          isUser={isUser}
          type={block.type}
          content={block.content}
          timestamp={message.timestamp}
        />
      );
    });
  }, [message, isUser]);

  // The message is displayed in a Paper component.
  return (
    <Slide
      in={show}
      direction={isUser ? "left" : "right"}
      mountOnEnter
      unmountOnExit
    >
      <Stack direction="column" spacing={0}>
        <Typography
          variant="body1"
          fontWeight={"bold"}
          textAlign={isUser ? "right" : "left"}
        >
          {activeProfile ? (isUser ? activeProfile.username : activeProfile.botname) : "Unknown"}
        </Typography>
        {ContentBlocks}
        {response && (
          <ThoughtUtility thoughts={response.thoughts} />
        )}
      </Stack>
    </Slide>
  );
};

export default Message;
