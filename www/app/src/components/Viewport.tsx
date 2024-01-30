import React, { FC, lazy, useMemo } from "react";

import {
  Box,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  Fade,
} from "@mui/material";

import { useChat } from "./shared/ChatProvider";
import MessageBox from "./common/MessageBox";

const InputField = lazy(() => import("./InputField"));

const Viewport: FC = () => {
  const { memory, status, settings } = useChat();

  const Loading = useMemo(() => {
    if (status === "running") {
      return (
        <Fade in={status === "running"} timeout={1500}>
          <Stack direction={"column"} spacing={1}>
            <LinearProgress
              variant="indeterminate"
              color="secondary"
              sx={{ width: "100%", height: "8px" }}
            />
            <Typography
              variant="subtitle1"
              color={"text.secondary"}
              sx={{
                textAlign: "center",
              }}
            >
              Contacting {settings.botname}...
            </Typography>
          </Stack>
        </Fade>
      );
    } else if (status === "standby") {
      return (
        <Typography
          variant="subtitle1"
          color={"text.secondary"}
          sx={{
            textAlign: "center",
          }}
        >
          You are chatting with {settings.botname}.
        </Typography>
      );
    }
    return null;
  }, [status, settings]);

  return (
    <Container
      maxWidth="xl"
      sx={{
        width: "100%",
        height: "100%",
        padding: "12px",
        overflow: "hidden",
      }}
    >
      <Stack direction={"column"} spacing={1} height={"100%"}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            padding: "8px",
            overflow: "auto",
          }}
        >
          <Stack direction={"column"} spacing={1}>
            {memory.map((message, i) => (
              <MessageBox
                key={message.timestamp}
                message={message}
                position={i}
              />
            ))}
            {Loading}
          </Stack>
        </Box>
        <Divider />
        <InputField />
      </Stack>
    </Container>
  );
};

export default Viewport;
