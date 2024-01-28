import React, { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import {
  Button,
  Slide,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Stack,
} from "@mui/material";
import { Save } from "@mui/icons-material";

import { TransitionProps } from "@mui/material/transitions";
import { ChatSettings } from "../controllers/chat";
import { useChat } from "./shared/ChatProvider";
import { useNotifications } from "./shared/NotificationProvider";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SettingsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SettingsDialog: FC<SettingsDialogProps> = ({ open, setOpen }) => {
  const { settings, setSettings } = useChat();
  const { addNotification } = useNotifications();
  const [draftSettings, setDraftSettings] = useState<ChatSettings>(settings);

  const handleClose = () => {
    if (!validSettings) {
      addNotification({
        message: "Your Settings are Invalid",
        severity: "error",
      });
      return;
    } else if (draftSettings !== settings) {
      setSettings(draftSettings);
      addNotification({
        message: "Your Settings have been Updated",
        severity: "success",
      });
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  const validSettings = useMemo(() => {
    return draftSettings.username !== "" && draftSettings.botname !== "";
  }, [draftSettings]);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={handleClose}
      sx={{
        "& .MuiDialog-paper": {
          minWidth: "500px",
        },
      }}
    >
      <DialogTitle textAlign={"center"}>Settings</DialogTitle>
      <DialogContent>
        <Stack direction={"column"} spacing={1}>
          <TextField
            id="username"
            label="Username"
            placeholder="Enter your username"
            variant="filled"
            size="small"
            fullWidth
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraftSettings({
                ...draftSettings,
                username: event.target.value,
              })
            }
            value={draftSettings.username}
            error={draftSettings.username === ""}
          />
          <TextField
            id="botname"
            label="Botname"
            placeholder="Enter a Name for the Bot"
            variant="filled"
            size="small"
            fullWidth
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraftSettings({
                ...draftSettings,
                botname: event.target.value,
              })
            }
            value={draftSettings.botname}
            error={draftSettings.botname === ""}
          />
          <TextField
            id="instruction"
            label="Instruction"
            placeholder="Enter a Custom Instruction"
            variant="filled"
            size="small"
            fullWidth
            multiline
            rows={4}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraftSettings({
                ...draftSettings,
                instruction: event.target.value,
              })
            }
            value={draftSettings.instruction}
          />
          <TextField
            id="acknowledgement"
            label="Acknowledgement"
            placeholder="Provide an Example of the AI Acknowledging your Instruction"
            variant="filled"
            size="small"
            fullWidth
            multiline
            maxRows={4}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraftSettings({
                ...draftSettings,
                acknowledge: event.target.value,
              })
            }
            value={draftSettings.acknowledge}
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "12px",
        }}
      >
        <Button
          aria-label="save"
          disabled={!validSettings}
          onClick={handleClose}
          startIcon={<Save />}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
