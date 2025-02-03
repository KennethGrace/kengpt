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

import { useChat } from "./contexts/ChatProvider";
import Message from "./Message";

const InputField = lazy(() => import("./InputField"));

const Viewport: FC = () => {
  const { localState, remoteState } = useChat();

  const Loading = useMemo(() => {
    if (!localState.activeProfile) return (
      <Typography
        variant="subtitle1"
        color={"text.secondary"}
        sx={{
          textAlign: "center",
        }}
      >
        Loading...
      </Typography>
    )
    if (remoteState.status === "running") {
      return (
        <Fade in={remoteState.status === "running"} timeout={1500}>
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
              Contacting {localState.activeProfile.botname}...
            </Typography>
          </Stack>
        </Fade>
      );
    } else if (remoteState.status === "standby") {
      return (
        <Typography
          variant="subtitle1"
          color={"text.secondary"}
          sx={{
            textAlign: "center",
          }}
        >
          You are chatting with {localState.activeProfile.botname}.
        </Typography>
      );
    }
    return null;
  }, [remoteState.status, localState.activeProfile]);

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
          <Stack direction={"column"} spacing={1}
            sx={{
              overflow: "clip",
            }}
          >
            {localState.memory && localState.memory.map((message, i) => (
              <Message
                key={message.timestamp || i}
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
