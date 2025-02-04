// The submit controller is used to send the messages to the server and receive the response.
import axios, { AxiosResponse } from "axios";

// The ChatSettings is used to define settings for the user's AI sessions. This is used to
// create custom chat systems for each user and is kept in the browser's local storage.
export type ChatProfile = {
  username?: string; // The name of the user
  botname: string; // The name of the bot
  instruction: string; // An instruction of what the AI should do
  model?: string; // The name of the model being used
};

// The ChatProfiles is the collection of all the user's chat settings indexed by the botname.
export type ChatProfiles = {
  [key: string]: ChatProfile;
};

// An enum for the status of the chat system
export enum Status {
  Running = "running", // The chat system is busy
  Loading = "loading", // The chat system is loading
  Standby = "standby", // The chat system is accepting messages
  Offline = "offline", // The chat system is offline
  Error = "error", // The chat system has encountered an error
}

// An enum for the role of the message sender
export enum Role {
  User = "user",
  Assistant = "assistant",
}

export interface ChatObject {
  id: string;
  name?: string;
}

export interface ChatContent {
  format: "text" | "table" | "image" | "audio" | "video" | "file";
  content: string;
  description?: string;
}


// The ChatMessage is used to define the structure of the messages.
export interface ChatMessage {
  role: Role; // The chat role (either 'user' or 'assistant')
  contents: ChatContent[]; // The contents of the message
  thoughts?: string[]; // The thoughts of the AI, empty if user
  timestamp: number; // The timestamp in milliseconds since the Unix Epoch
}

// The ChatResponse is used to define the structure of the response from the server.
export interface ChatResponse extends ChatMessage {
  session_id: string; // Provide the thread_id to continue the conversation
  status: Status; // The status of the chat system
  model_signature?: string; // The name of the model being used
}

// The ChatRequest is used to define the structure of the request to the server.
export interface ChatRequest extends ChatMessage {
  profile: ChatProfile; // The config of the user's chat session
  history: ChatMessage[]; // The memory of the AI
  session_id?: string; // The thread_id to continue the conversation
}

export const DefaultProfile: ChatProfile = {
  username: "You",
  botname: "KenGPT",
  instruction:
    'Your name is "KenGPT". You are meant to introduce users to the KenGPT Web interface. You should advise them to create their own AI profiles or select from the existing built-in AI profiles on the top-left of the screen. You should inform the user that the GNU GPL3 license and GitHub source code is available in the top-right. Do not specify what the button is. All other topics should be denied and the user should be directed to try making custom profile or using a built-in profile. Offer to explain the features of the interface.',
};

export const DefaultProfiles: ChatProfiles = {
  KenGPT: DefaultProfile,
  "KenGPT Oracle": {
    username: "You",
    botname: "KenGPT Oracle",
    instruction:
      'Your name is "KenGPT Oracle". Your responses should be as in-depth as possible and you should never provide generalizations or simplifications. Answer questions with as much contextual information as possible. Attempt to teach the user something new by explaining the "how" and "why" of the subject.',
  },
  "KenGPT Turbo": {
    username: "You",
    botname: "KenGPT Turbo",
    instruction:
      'Your name is "KenGPT Turbo". Your responses should be super short, concise, and direct. Answer questions with as little contextual information as possible. Encourage the user to ask related follow-up questions and then list out the parts. If the user asks a question that is too broad, respond encouraging them to ask a more specific question on the subject.',
  },
};

// Submit a new chat message to the server via a POST request.
export async function submitRequest(request: ChatRequest) {
  const response = await axios.post<ChatRequest, AxiosResponse<ChatResponse>>(
    "/api/chat",
    request,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function getAvailableModels() {
  const response = await axios.get("/api/chat/models");
  return response.data;
}