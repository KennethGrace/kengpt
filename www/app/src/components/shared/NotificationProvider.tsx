import React, { FC, ReactNode } from "react";

import {
  Alert,
  AlertTitle,
  List,
  ListItem,
  Slide,
  SlideProps,
  Snackbar,
} from "@mui/material";

const severityTitles = {
  success: "Success",
  info: "Info",
  warning: "Warning",
  error: "Error",
};

export interface Notification {
  icon?: ReactNode;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

interface NotificationData extends Notification {
  open: boolean;
  uuid: string;
}

interface Notifications {
  notifications: NotificationData[];
  addNotification: (notification: Notification) => void;
  removeNotification: (message: string) => void;
}

export const NotificationContext = React.createContext<Notifications>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export const useNotifications = () => React.useContext(NotificationContext);

export const NotificationsProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = React.useState<NotificationData[]>(
    []
  );

  const addNotification = (notification: Notification) => {
    // Assign a UUID to the notification, so we can remove it later.
    let uuid = Math.random().toString(36).substring(7);
    console.debug("Adding notification: ", uuid);
    setNotifications((notifications) => [
      ...notifications,
      { ...notification, uuid, open: true },
    ]);
  };

  const removeNotification = (uuid: string) => {
    console.debug("Removing notification: ", uuid);
    // Use a timeout to remove the notification from the list after first setting it to closed.
    setNotifications((notifications) =>
      notifications.map((notification) => {
        if (notification.uuid === uuid) {
          notification.open = false;
          setTimeout(() => {
            setNotifications((notifications) =>
              notifications.filter((notification) => notification.uuid !== uuid)
            );
          }, 900);
        }
        return notification;
      })
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      <NotificationStack />
      {children}
    </NotificationContext.Provider>
  );
};

function TransitionLeft(props: Omit<SlideProps, "direction">) {
  return (
    <Slide
      {...props}
      direction={"left"}
      timeout={600}
      children={props.children}
    />
  );
}

const NotificationStack: FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const handleClose = (uuid: string, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    removeNotification(uuid);
  };
  return (
    <List
      sx={{
        position: "fixed",
        top: "0px",
        right: "0px",
        zIndex: 9999,
      }}
    >
      {notifications.map((notification, i) => (
        <ListItem key={notification.uuid}>
          <Snackbar
            open={notification.open}
            autoHideDuration={5000}
            TransitionComponent={TransitionLeft}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ height: "80px", marginTop: `${i * 90}px` }}
            onClose={(_, reason) => handleClose(notification.uuid, reason)}
          >
            <Alert icon={notification.icon} severity={notification.severity}>
              <AlertTitle>{severityTitles[notification.severity]}</AlertTitle>
              {notification.message}
            </Alert>
          </Snackbar>
        </ListItem>
      ))}
    </List>
  );
};

export default NotificationsProvider;
