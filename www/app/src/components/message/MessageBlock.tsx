import React, { useMemo } from "react";
import { MarkdownText, MarkdownCode } from "./components/Markdown";
import { Box, Paper, useTheme } from "@mui/material";
import { useNotifications } from "../contexts/NotificationProvider";
import { MessageUtility } from "./components/Utilities";
import { useChat } from "../contexts/ChatProvider";

interface MessageBlockProps {
    isUser: boolean;
    type: "text" | "code";
    content: string;
    timestamp: number;
}

const MessageBlock: React.FC<MessageBlockProps> = ({ isUser, type, content, timestamp }) => {
    const theme = useTheme();
    const { addNotification } = useNotifications();
    const { deleteMemory } = useChat();
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
        } else if (type === "code") {
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

    const handleDelete = () => {
        // Delete the message and all the following messages from that time on.
        deleteMemory(timestamp);
    }

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
            <MessageUtility
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onCopy={handleCopy}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default MessageBlock;