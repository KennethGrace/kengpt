import React, { FC } from "react";

import {
  Slide,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ConfirmationDialogProps {
  open: boolean;
  message: string;
  onDeny: () => void;
  onConfirm: () => void;
  title?: string;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  message,
  onDeny,
  onConfirm,
  title = "Confirm Action",
}) => {
  return (
    <Dialog open={open} TransitionComponent={Transition}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button
          aria-label="Cancel"
          color="error"
          onClick={onDeny}
          endIcon={<Cancel />}
        >
          Cancel
        </Button>
        <Button
          aria-label="Confirm"
          color="success"
          onClick={onConfirm}
          endIcon={<CheckCircle />}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
