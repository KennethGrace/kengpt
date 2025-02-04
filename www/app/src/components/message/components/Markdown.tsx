import React, { useEffect, useMemo } from "react";
import { Typography } from "@mui/material";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

// MarkdownText will convert a Markdown string to an HTML string. This function uses regular expressions to replace
// Markdown tags with HTML tags. To prevent XSS attacks, the Markdown string will be sanitized before being converted
// to an HTML string.
//  1. Bold text will be replaced with a <b> component.
//  2. Italic text will be replaced with a <i> component.
//  3. Strikethrough text will be replaced with a <s> component.
//  4. Links will be replaced with an <a> component.
//  5. Code snippets will be replaced with a <code> component.
export const MarkdownText: React.FC<{ text: string; color: string }> = ({ text, color }) => {
    const sanitizedText = useMemo(() => {
        let escapedText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        return escapedText
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
            .replace(/\*(.*?)\*/g, "<i>$1</i>") // Italic
            .replace(/~~(.*?)~~/g, "<s>$1</s>") // Strikethrough
            .replace(/`(.*?)`/g, "<code>$1</code>") // Code
            .replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
                if (/^(https?:|mailto:)/i.test(url)) {
                    return `<a href="${url}">${text}</a>`;
                } else {
                    return text;
                }
            });
    }, [text]);
    return (
        <Typography
            variant="body2"
            whiteSpace="pre-wrap"
            color={color}
            component="span"
            sx={{
                "& code": {
                    font: "small-caption",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    borderRadius: "4px",
                    padding: "2px",
                },
            }}
        >
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizedText,
                }}
            />
        </Typography>
    );
};

// The MarkdownCode component will display a code block. The code block will be highlighted using the highlight.js
// library. The language of the code block will be determined by the language property. To release MUI's hold on the
// styles of the <code> component, the MarkdownCode component will be wrapped in a <div> component with the CSS
// baseline applied.
export const MarkdownCode: React.FC<{ id: string; language: string; code: string }> = ({
    id,
    language,
    code,
}) => {
    // Use an effect to highlight the code block after the component has been rendered.
    useEffect(() => {
        const codeBlock = document.getElementById(id);
        if (codeBlock) {
            hljs.highlightElement(codeBlock);
        }
    }, [id]);
    return (
        <pre
            style={{
                margin: 0,
            }}
        >
            <code id={id} className={language}>
                {code}
            </code>
        </pre>
    );
};

// The getMarkdownBlocks function will break a Markdown string into an array of ContentBlock objects. Each ContentBlock
// object will contain a type and content property. The type property will be either "text" or "code". The content
// property will be the text contained in the ContentBlock. The Markdown string will be broken into ContentBlocks
// by the following rules:
//  1. If the Markdown string contains a code block, the code block will be converted to a ContentBlock with a type
//     of "code".
//  2. All other Markdown text will be converted to ContentBlocks with a type of "text".
export function getMarkdownBlocks(str: string): ContentBlock[] {
    let blocks: ContentBlock[] = [];
    // Get the code blocks from the Markdown string.
    let code_blocks = str.match(/```[^`]*```/g);
    // Split the Markdown string at the code blocks.
    let text_blocks = str.split(/```[^`]*```/g);
    // The first text block will always be a text block.
    blocks.push({ type: "text", content: text_blocks[0].trim() });
    // The remaining text blocks will alternate between text blocks and code blocks.
    for (let i = 1; i < text_blocks.length; i++) {
        const language = code_blocks![i - 1].match(/```(.*)\n/) || null;
        const code = code_blocks![i - 1]
            .replace(/```.*\n/, "")
            .replace(/```/g, "")
            .trimEnd();
        blocks.push({
            type: "code",
            language: language === null ? undefined : language[1],
            content: code,
        });
        blocks.push({ type: "text", content: text_blocks[i].trim() });
    }
    return blocks;
}