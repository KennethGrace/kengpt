import React, { useMemo } from "react";
import {
    Box,
    Button,
    ClickAwayListener,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps
} from "@mui/material";
import { ContentCopy, Delete } from "@mui/icons-material";

/** The MessageUtilityProps Menu interface defines the properties that can be passed to the `MessageUtility` component. */
interface MessageUtilityProps {
    onCopy: () => void;
    onDelete: () => void;
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchorEl: HTMLElement | null) => void;
}

/** The MessageUtility Menu component will display when the user clicks on a message. It will allow the user to delete or edit the message. */
export const MessageUtility: React.FC<MessageUtilityProps> = ({
    onCopy,
    onDelete,
    anchorEl,
    setAnchorEl,
}) => {
    return (
        <Menu
            id="message-action-menu"
            open={anchorEl !== null}
            onClose={() => setAnchorEl(null)}
            anchorEl={anchorEl}
        >
            <MenuItem
                onClick={() => {
                    onCopy();
                    setAnchorEl(null);
                }}
            >
                <ListItemIcon>
                    <ContentCopy />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
            </MenuItem>
            <MenuItem
                onClick={() => {
                    onDelete();
                    setAnchorEl(null);
                }}
            >
                <ListItemIcon>
                    <Delete />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
            </MenuItem>
        </Menu>
    );
};


const FullWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        margin: "5%",
        maxWidth: "80%",
        fontSize: "0.8rem",
    },
});

export const ThoughtUtility: React.FC<{ thoughts?: string[] }> = ({ thoughts }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const is_thought = useMemo(() => {
        if (thoughts === undefined) return false;
        if (thoughts === null) return false;
        if (thoughts.length === 0) return false;
        return true;
    }, [thoughts]);
    return (
        <Box
            sx={{
                alignSelf: "left",
            }}
        >
            {is_thought ? (
                <ClickAwayListener
                    onClickAway={() => setOpen(false)}>
                    <div>
                        <FullWidthTooltip
                            title={
                                thoughts?.join("\n") || "No Thought"
                            }
                            arrow
                            open={open}
                            onClose={() => setOpen(false)}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                        >
                            <Button
                                onClick={() => setOpen(!open)}
                            >
                                View Thoughts
                            </Button>
                        </FullWidthTooltip>
                    </div>
                </ClickAwayListener>
            ) : (
                <Button
                    disabled
                >
                    No Thoughts
                </Button>
            )}
        </Box>
    );
};