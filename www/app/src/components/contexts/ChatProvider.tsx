import React, { FC, useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  ChatProfile,
  Role,
  Status,
  submitRequest,
  getAvailableModels,
  ChatMessage,
  ChatProfiles,
  ChatRequest,
} from "../../controllers/chat";
import { DefaultProfile, DefaultProfiles } from "../../controllers/chat";
import { useNotifications } from "./NotificationProvider";

interface LocalState {
  activeProfile: ChatProfile;
  profiles: ChatProfiles;
  memory: ChatMessage[];
  setActiveProfile: (profile: ChatProfile) => void;
}

interface RemoteState {
  status: Status;
  availableModels: string[];
}

interface ChatContextProps {
  localState: LocalState;
  remoteState: RemoteState;
  speakAloud: boolean;
  sendRequest: (message: string) => Promise<void>;
  setSpeakAloud: (speakAloud: boolean) => void;
  clearMemory: () => void;
  deleteMemory: (timestamp: number) => void;
}

const ChatContext = React.createContext<ChatContextProps | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
      throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<Status>(Status.Standby);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [profile, setProfile] = useState<ChatProfile>(DefaultProfile);
  const [profiles, setProfiles] = useState<ChatProfiles>(DefaultProfiles);
  const [memory, setMemory] = useState<ChatMessage[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [speakAloud, setSpeakAloud] = useState<boolean>(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!hasLoaded) return;
    // On memory change.
    if (memory) {
      // Remove history from the memory before storing it in the local storage
      // This significantly reduces the memory size on the local storage
      memory.forEach((message) => {
        if (message.role === Role.User) {
          (message as ChatRequest).history = [];
        }
      });
      window.localStorage.setItem(
        "memory", JSON.stringify(memory)
      );
    }
  }, [memory]);

  useEffect(() => {
    // On profile change.
    if (!hasLoaded) return;
    // Update the profile if the profiles are loaded.
    if (profile && profiles) {
      setProfiles((profiles) => {
        let newProfiles = { ...profiles };
        newProfiles[profile.botname] = profile;
        return newProfiles;
      });
      // Update the profile in the local storage.
      window.localStorage.setItem("profile", JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    // On profiles change.
    if (!hasLoaded) return;
    if (profiles) {
      window.localStorage.setItem("profiles", JSON.stringify(profiles));
    }
  }, [profiles]);

  useEffect(() => {
    // On load.
    setTimeout(() => {
      // Load the memory from the local storage after 100ms
      let m = window.localStorage.getItem("memory");
      let loaded_memory = m ? JSON.parse(m) : [];
      setMemory(loaded_memory);
      let s = window.localStorage.getItem("profile");
      let loaded_profile = s ? JSON.parse(s) : DefaultProfile;
      setProfile(loaded_profile);
      let p = window.localStorage.getItem("profiles");
      let loaded_profiles = p ? JSON.parse(p) : DefaultProfiles;
      setProfiles(loaded_profiles);
      setHasLoaded(true);
    }, 100);
    // Load the available models from the FastAPI endpoint
    getAvailableModels().then((models) => {
      setAvailableModels(models);
    }).catch((error) => {
      addNotification({
        message: "Error fetching available models",
        severity: "error",
      });
    });
  }, []);

  const playAudio = async (text: string) => {
    text = text.replace(/[\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]/gu, "").replace(/[^a-zA-Z0-9\s]/g, "");
    try {
      // Send a POST request to the FastAPI endpoint with the text payload
      const response = await axios.post(
        "/api/speak",
        { text }, // Payload as JSON
        { responseType: "blob" } // Ensure the response is treated as binary data
      );

      // Get the audio data as a Blob
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });

      // Create a URL for the Blob
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio using the browser's Audio API
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error fetching and playing audio:", error);
    }
  };

  const sendRequest = async (content: string) => {
    let payload: ChatRequest = {
      role: Role.User,
      contents: [{ format: "text", content }],
      history: memory,
      profile: profile,
      timestamp: new Date().getTime(),
    };
    setStatus(Status.Running);
    try {
      let response = await submitRequest(payload);
      if (speakAloud) playAudio(response.contents[0].content);
      // Remove history from the payload before storing it in memory
      // This significantly reduces the memory size on the local storage
      payload.history = [];
      setMemory([...memory, payload, response]);
    } catch (error) {
      setStatus(Status.Error);
      throw error;
    }
    setStatus(Status.Standby);
  };

  const clearMemory = () => {
    setMemory([]);
  };

  /** Delete every memory message at and after the specified timestamp */
  const deleteMemory = (timestamp: number) => {
    if (!memory) {
      return;
    }
    let newMemory = memory.filter((message) => {
      if (message.timestamp && message.timestamp >= timestamp) {
        return false;
      }
      return true;
    });
    setMemory(newMemory);
  };

  return (
    <ChatContext.Provider
      value={{
        localState: {
          activeProfile: profile,
          profiles,
          memory,
          setActiveProfile: setProfile,
        },
        remoteState: {
          status,
          availableModels,
        },
        speakAloud,
        sendRequest,
        setSpeakAloud,
        clearMemory,
        deleteMemory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
