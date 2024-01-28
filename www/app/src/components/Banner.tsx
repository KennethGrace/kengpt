import React, { FC, lazy, useEffect, useState } from "react";

import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import { Balance, GitHub, History, Settings } from "@mui/icons-material";
import { getManifest, ManifestFile } from "../controllers/appManifest";
import { useChat } from "./shared/ChatProvider";

const SettingsDialog = lazy(() => import("./SettingsDialog"));
const ConfirmationDialog = lazy(() => import("./ConfirmationDialog"));

interface BannerProps {}

const Banner: FC<BannerProps> = () => {
  const { clearMemory } = useChat();
  const [manifest, setManifest] = useState<Partial<ManifestFile>>();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  useEffect(() => {
    getManifest().then((manifest) => setManifest(manifest));
  }, []);

  const handleClearMemory = () => {
    clearMemory();
    setConfirmationOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        flexDirection: "row",
        alignItems: "center",
        height: "fit-content",
      }}
      color={"inherit"}
    >
      <SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
      <ConfirmationDialog
        open={confirmationOpen}
        message="Are you sure you want to clear your chat history?"
        onConfirm={handleClearMemory}
        onDeny={() => setConfirmationOpen(false)}
      />
      <Toolbar
        sx={{
          justifyContent: "flex-start",
        }}
      >
        <Tooltip title="Settings">
          <IconButton
            size="medium"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear History">
          <IconButton
            size="medium"
            aria-label="Clear History"
            onClick={() => setConfirmationOpen(true)}
          >
            <History />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Toolbar
        sx={{
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <Typography variant="h5" fontWeight={"bold"} noWrap>
          {manifest?.name ?? "KenGPT"}
        </Typography>
      </Toolbar>

      <Toolbar
        sx={{
          justifyContent: "flex-end",
        }}
      >
        <Tooltip title="License">
          <IconButton
            size="medium"
            aria-label="License"
            onClick={() => window.open(manifest?.license_url, "_blank")}
          >
            <Balance />
          </IconButton>
        </Tooltip>
        <Tooltip title="GitHub">
          <IconButton
            size="medium"
            aria-label="GitHub"
            onClick={() => window.open(manifest?.github_url, "_blank")}
          >
            <GitHub />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Banner;
