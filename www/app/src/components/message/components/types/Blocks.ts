


interface ContentBlock {
    type: "text" | "code";
    language?: string;
    content: string;
}

interface MessageBlock extends ContentBlock {
    isUser: boolean;
}