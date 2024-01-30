import React, { FC, useState, useEffect } from "react";

import {
  ChatSettings,
  ChatSystem,
  Role,
  Status,
  submitRequest,
  getCurrentSystem,
  ChatMessage,
  ChatProfiles,
} from "../../controllers/chat";
import { DefaultSettings, DefaultProfiles } from "../../controllers/chat";

interface ChatState extends ChatSystem {
  settings: ChatSettings;
  profiles: ChatProfiles;
  memory: ChatMessage[];
  fileContent: string;
  sendRequest: (message: string) => Promise<void>;
  setSettings: (settings: ChatSettings) => void;
  setFileContent: (fileContent: string) => void;
  clearMemory: () => void;
  deleteMemory: (timestamp: number) => void;
}

const ChatContext = React.createContext<ChatState>({
  settings: DefaultSettings,
  profiles: DefaultProfiles,
  memory: [],
  fileContent: "",
  status: Status.Standby,
  sendRequest: async () => {},
  setSettings: () => {},
  setFileContent: () => {},
  clearMemory: () => {},
  deleteMemory: () => {},
});

export const useChat = () => React.useContext<ChatState>(ChatContext);

export const ChatProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [settings, setSettings] = useState<ChatSettings>(DefaultSettings);
  const [profiles, setProfiles] = useState<ChatProfiles>(DefaultProfiles);
  const [memory, setMemory] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string>();
  const [fileContent, setFileContent] = useState<string>("");
  const [system, setSystem] = useState<ChatSystem>({
    status: Status.Standby,
    model: "unknown",
  });

  const pollSystem = async () => {
    try {
      let system = await getCurrentSystem();
      setSystem(system);
    } catch (error) {
      console.log(error);
    }
  };

  const saveSettings = () => {
    setProfiles((profiles) => ({
      ...profiles,
      [settings.botname]: settings,
    }));
    window.localStorage.setItem("settings", JSON.stringify(settings));
    window.localStorage.setItem("profiles", JSON.stringify(profiles));
  };

  useEffect(() => {
    // On memory change.
    if (hasLoaded) {
      window.localStorage.setItem(
        "memory",
        JSON.stringify({
          threadId: threadId,
          memory: memory,
        })
      );
    }
  }, [memory, threadId]);

  useEffect(() => {
    // On settings change.
    const s = window.localStorage.getItem("settings");
    const p = window.localStorage.getItem("profiles");
    if (!s || !p) saveSettings();
    if (s || p) saveSettings();
  }, [settings]);

  useEffect(() => {
    // On load.
    setTimeout(() => {
      let data = window.localStorage.getItem("memory");
      if (data) {
        const d = JSON.parse(data) as {
          threadId: string;
          memory: ChatMessage[];
        };
        setMemory(d.memory);
        setThreadId(d.threadId);
      }
      setHasLoaded(true);
    }, 100);

    // pollSystem();
    // const interval = setInterval(pollSystem, 10000);
    // return () => clearInterval(interval);
  }, []);

  const sendRequest = async (content: string) => {
    let payload = {
      role: Role.User,
      content,
      fileContent,
      memory,
      settings,
      timestamp: new Date().getTime(),
      thread_id: threadId,
    };
    setSystem((system) => ({ ...system, status: Status.Running }));
    try {
      let response = await submitRequest(payload);
      setMemory([...memory, payload, response]);
      setThreadId(response.thread_id);
    } catch (error) {
      setSystem((system) => ({ ...system, status: Status.Standby }));
      throw error;
    }
    setSystem((system) => ({ ...system, status: Status.Standby }));
  };

  const clearMemory = () => {
    setMemory([]);
    setThreadId(undefined);
  };

  const deleteMemory = (timestamp: number) => {
    setMemory((memory) =>
      memory.filter((message) => message.timestamp !== timestamp)
    );
  };

  return (
    <ChatContext.Provider
      value={{
        settings,
        memory,
        fileContent,
        profiles,
        status: system.status,
        model: system.model,
        sendRequest,
        setSettings,
        setFileContent,
        clearMemory,
        deleteMemory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
