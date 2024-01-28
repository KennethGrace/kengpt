// The MessageBox component is used to display a message either sent from or received by the user. Messages sent by the
// user are displayed on the right side of the screen, while messages received by the user are displayed on the left
// side of the screen.

import React, { FC, useEffect, useMemo } from "react";
import {
  Paper,
  Slide,
  Menu,
  MenuList,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
  Box,
  CssBaseline,
  Stack,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

import { ChatMessage, Role } from "../../controllers/chat";
import { useChat } from "../shared/ChatProvider";
import { useNotifications } from "../shared/NotificationProvider";

// MarkdownText will convert a Markdown string to an HTML string. This function uses regular expressions to replace
// Markdown tags with HTML tags. To prevent XSS attacks, the Markdown string will be sanitized before being converted
// to an HTML string.
//  1. Bold text will be replaced with a <b> component.
//  2. Italic text will be replaced with a <i> component.
//  3. Strikethrough text will be replaced with a <s> component.
//  4. Links will be replaced with an <a> component.
//  5. Code snippets will be replaced with a <code> component.
const MarkdownText: FC<{ text: string; color: string }> = ({ text, color }) => {
  const sanitizedText = useMemo(() => {
    let escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return escapedText
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
      .replace(/\*(.*?)\*/g, "<i>$1</i>") // Italic
      .replace(/~~(.*?)~~/g, "<s>$1</s>") // Strikethrough
      .replace(/`(.*?)`/g, "<code>$1</code>") // Code
      .replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
        if (/^(https?:|mailto:)/i.test(url)) {
          return `<a href="${url}">${text}</a>`;
        } else {
          return text;
        }
      });
  }, [text]);
  return (
    <Typography
      variant="body2"
      whiteSpace="pre-wrap"
      color={color}
      component="span"
      sx={{
        "& code": {
          font: "small-caption",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
          padding: "2px",
        },
      }}
    >
      <span
        dangerouslySetInnerHTML={{
          __html: sanitizedText,
        }}
      />
    </Typography>
  );
};

// The MarkdownCode component will display a code block. The code block will be highlighted using the highlight.js
// library. The language of the code block will be determined by the language property. To release MUI's hold on the
// styles of the <code> component, the MarkdownCode component will be wrapped in a <div> component with the CSS
// baseline applied.
const MarkdownCode: FC<{ id: string; language: string; code: string }> = ({
  id,
  language,
  code,
}) => {
  // Use an effect to highlight the code block after the component has been rendered.
  useEffect(() => {
    const codeBlock = document.getElementById(id);
    if (codeBlock) {
      hljs.highlightElement(codeBlock);
    }
  }, [id]);
  return (
    <pre
      style={{
        margin: 0,
      }}
    >
      <code id={id} className={language}>
        {code}
      </code>
    </pre>
  );
};

interface ContentBlock {
  type: "text" | string;
  content: string;
}

// The getMarkdownBlocks function will break a Markdown string into an array of ContentBlock objects. Each ContentBlock
// object will contain a type and content property. The type property will be either "text" or "code". The content
// property will be the text contained in the ContentBlock. The Markdown string will be broken into ContentBlocks
// by the following rules:
//  1. If the Markdown string contains a code block, the code block will be converted to a ContentBlock with a type
//     of "code".
//  2. All other Markdown text will be converted to ContentBlocks with a type of "text".
function getMarkdownBlocks(str: string): ContentBlock[] {
  let blocks: ContentBlock[] = [];
  // Get the code blocks from the Markdown string.
  let code_blocks = str.match(/```[^`]*```/g);
  // Split the Markdown string at the code blocks.
  let text_blocks = str.split(/```[^`]*```/g);
  // The first text block will always be a text block.
  blocks.push({ type: "text", content: text_blocks[0].trim() });
  // The remaining text blocks will alternate between text blocks and code blocks.
  for (let i = 1; i < text_blocks.length; i++) {
    const language = code_blocks![i - 1].match(/```(.*)\n/) || null;
    const code = code_blocks![i - 1]
      .replace(/```.*\n/, "")
      .replace(/```/g, "")
      .trimEnd();
    blocks.push({
      type: language === null ? "text" : language[1],
      content: code,
    });
    blocks.push({ type: "text", content: text_blocks[i].trim() });
  }
  return blocks;
}

// The MessageActionMenuProps interface defines the properties that can be passed to the MessageActionMenu component.
interface MessageActionMenuProps {
  onCopy: () => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
}

// The MessageActionMenu component will display when the user clicks on a message. It will allow the user to delete or edit the message.
const MessageActionMenu: FC<MessageActionMenuProps> = ({
  onCopy,
  anchorEl,
  setAnchorEl,
}) => {
  return (
    <Menu
      id="message-action-menu"
      open={anchorEl !== null}
      onClose={() => setAnchorEl(null)}
      anchorEl={anchorEl}
    >
      <MenuItem
        onClick={() => {
          onCopy();
          setAnchorEl(null);
        }}
      >
        <ListItemIcon>
          <ContentCopy />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>
    </Menu>
  );
};

interface MessageBlockProps extends ContentBlock {
  isUser: boolean;
}

const MessageBlock: FC<MessageBlockProps> = ({ isUser, type, content }) => {
  const theme = useTheme();
  const { addNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const color = useMemo(() => {
    if (type === "text") {
      if (anchorEl !== null)
        return isUser
          ? theme.palette.primary.dark
          : theme.palette.secondary.dark;
      return isUser ? theme.palette.primary.main : theme.palette.secondary.main;
    } else {
      return anchorEl !== null
        ? theme.palette.code.dark
        : theme.palette.code.main;
    }
  }, [anchorEl, isUser, theme]);

  const Content = useMemo(() => {
    if (type === "text") {
      return (
        <MarkdownText
          text={content}
          color={
            isUser
              ? theme.palette.primary.contrastText
              : theme.palette.secondary.contrastText
          }
        />
      );
    } else {
      const id = Math.random().toString(36).substring(7);
      return <MarkdownCode id={id} language={type} code={content} />;
    }
  }, [content, type, isUser, theme]);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(content);
    } catch (error) {
      addNotification({
        message: "Could not copy message to clipboard.",
        severity: "error",
      });
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        elevation={anchorEl !== null ? 6 : 3}
        sx={{
          padding: "8px",
          margin: "8px",
          maxWidth: "75%",
          width: type === "text" ? "fit-content" : "100%",
          backgroundColor: color,
          overflow: type === "text" ? "hidden" : "auto",
        }}
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
        }}
      >
        {Content}
      </Paper>
      <MessageActionMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        onCopy={handleCopy}
      />
    </Box>
  );
};

// The MessageBoxProps interface defines the properties that can be passed to the MessageBox component.
interface MessageBoxProps {
  message: ChatMessage;
  position: number;
}

// The MessageBox component is a functional component that displays a message either sent from or received by the user.
const MessageBox: FC<MessageBoxProps> = ({ message, position }) => {
  const theme = useTheme();
  const { settings, deleteMemory } = useChat();
  const [show, setShow] = React.useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setShow(true), Math.min(position * 50, 250));
  });

  const isUser = useMemo(() => {
    return message.role === Role.User;
  }, [message.role]);

  const ContentBlocks = useMemo(() => {
    return getMarkdownBlocks(message.content).map((block, index) => {
      return (
        <MessageBlock
          key={index}
          isUser={isUser}
          type={block.type}
          content={block.content}
        />
      );
    });
  }, [message.content, isUser]);

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
          {isUser ? settings.username : settings.botname}
        </Typography>
        {ContentBlocks}
      </Stack>
    </Slide>
  );
};

export default MessageBox;
