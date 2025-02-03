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
  Divider,
  MenuItem,
  useTheme,
} from "@mui/material";
import { Add, Save } from "@mui/icons-material";

import { TransitionProps } from "@mui/material/transitions";
import { ChatProfile } from "../controllers/chat";
import { useChat } from "./contexts/ChatProvider";
import { useNotifications } from "./contexts/NotificationProvider";
import ModelAutocomplete from "./setting/ModelAutocomplete";

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

const BlankSettings = { botname: "New Bot", username: "You", instruction: "You are an AI Assistant." }

const SettingsDialog: FC<SettingsDialogProps> = ({ open, setOpen }) => {
  const theme = useTheme();
  const { localState: {
    activeProfile,
    profiles,
    setActiveProfile
  } } = useChat();
  const { addNotification } = useNotifications();
  const [selected, setSelected] = useState<string | null>(activeProfile ? activeProfile.botname : null);
  const [viewProfile, setViewProfile] = useState<ChatProfile>(activeProfile);

  const handleClose = () => {
    if (!viewProfile) {
      setOpen(false);
      return;
    }
    if (!validSettings) {
      addNotification({
        message: "Failed to Save Profile.",
        severity: "warning",
      });
    } else {
      setActiveProfile(viewProfile);
    }
    setOpen(false);
  };

  const validSettings = useMemo(() => {
    if (!viewProfile) return false;
    return viewProfile.botname !== "" && viewProfile.instruction !== "";
  }, [viewProfile]);

  return (
    <Dialog
      open={open}
      fullWidth
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
        <Stack direction={"column"} spacing={2}>
          <TextField
            id="profile-select"
            label="Profile"
            aria-label="profile"
            select
            variant="filled"
            value={selected}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (!profiles[event.target.value]) {
                console.log(`Profile ${event.target.value} not found`);
                return;
              }
              setSelected(event.target.value);
              setViewProfile(profiles[event.target.value]);
            }}
          >
            {profiles && Object.keys(profiles)
              .map((profile) => (
                <MenuItem key={profile} value={profile}>
                  {profile}
                </MenuItem>
              ))
              .concat([
                <MenuItem
                  key="custom"
                  value="custom"
                  onClick={() => {
                    setSelected("custom");
                    setViewProfile(BlankSettings);
                  }}
                >
                  Add a new Custom Profile
                </MenuItem>,
              ])}
          </TextField>
          <Divider />
          <TextField
            id="botname"
            label="Botname"
            aria-label="botname"
            placeholder="Enter your botname"
            variant="filled"
            size="small"
            fullWidth
            disabled={viewProfile ? viewProfile.botname.includes("KenGPT") : false}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setViewProfile({
                ...viewProfile || BlankSettings,
                botname: event.target.value,
              })
            }}
            value={viewProfile ? viewProfile.botname : ""}
            error={viewProfile ? viewProfile.botname === "" : true}
          />
          <TextField
            id="instruction"
            label="Instruction"
            aria-label="instruction"
            placeholder="Enter a Custom Instruction"
            variant="filled"
            size="small"
            fullWidth
            multiline
            rows={8}
            disabled={viewProfile ? viewProfile.botname.includes("KenGPT") : false}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setViewProfile({
                ...viewProfile || BlankSettings,
                instruction: event.target.value,
              })
            }}
            value={viewProfile ? viewProfile.instruction : ""}
          />
          <ModelAutocomplete
            value={viewProfile.model || ""}
            onChange={(value: string) => {
              setViewProfile({
                ...viewProfile || BlankSettings,
                model: value === "" ? undefined : value,
              })
            }}
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
