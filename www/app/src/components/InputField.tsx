import React, { ChangeEvent, FC, useState } from "react";

import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useChat } from "./contexts/ChatProvider";
import { VolumeOff, VolumeUp, Send } from "@mui/icons-material";
import { useNotifications } from "./contexts/NotificationProvider";

const InputField: FC = () => {
  const { addNotification } = useNotifications();
  const { sendRequest, setSpeakAloud, speakAloud } = useChat();
  const [draftMessage, setDraftMessage] = useState<string>("");

  const handleSendMessage = () => {
    sendRequest(draftMessage).catch((error) => {
      addNotification({
        message: error.message,
        severity: "error",
      });
    });
    setDraftMessage("");
  };

  return (
    <Paper
      elevation={9}
      sx={{
        width: "100%",
        padding: "8px",
      }}
    >
      <Stack direction={"row"} spacing={1} height={"100%"}>
        <TextField
          id="message"
          label="Message"
          placeholder="Compose a new message"
          variant="filled"
          size="small"
          fullWidth
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendMessage();
            }
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraftMessage(event.target.value)
          }
          value={draftMessage}
        />
        <Box
          sx={{
            alignSelf: "center",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Stack direction={"row"} spacing={1} height={"100%"}>
            <IconButton
              aria-label="speak-aloud"
              onClick={() => setSpeakAloud(!speakAloud)}
              size={"medium"}
            >
              {speakAloud ? <VolumeUp /> : <VolumeOff />}
            </IconButton>
            <Button
              aria-label="send"
              color="primary"
              onClick={handleSendMessage}
              size={"medium"}
              variant="contained"
              endIcon={<Send />}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default InputField;
