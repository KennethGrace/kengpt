import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useChat } from "../contexts/ChatProvider";

interface ModelAutompleteProps {
    value: string;
    onChange: (value: string) => void;
}

const ModelAutocomplete: React.FC<ModelAutompleteProps> = ({
    value,
    onChange
}) => {
  const { remoteState: {
    availableModels,
  } } = useChat();

  return (
    <Autocomplete
      freeSolo
      options={availableModels}
      value={value}
      onInputChange={(event, newInputValue) => {
        onChange(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Select or Type" variant="outlined" />
      )}
    />
  );
};

export default ModelAutocomplete;