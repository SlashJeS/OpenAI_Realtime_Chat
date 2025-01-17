// src/components/console/SettingsSidebar.tsx

import React, { useState } from 'react';
import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { instructions } from '../utils/conversation_config';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function SettingsSidebar({ isOpen, onClose, client }: SettingsSidebarProps) {

  const [model, setModel] = useState('gpt-4o-realtime-preview-2024-12-17');
  const [voice, setVoice] = useState('alloy');
  const [prompt, setPrompt] = useState('');


  const modelOptions = [
    'gpt-4o-realtime-preview-2024-12-17',
    'gpt-4o-mini-realtime-preview-2024-12-17' // not all works, need more checks
  ];

  const voiceOptions = [
    'alloy',
    'ash',
    'coral',
    'echo',
    'fable',
    'onyx',
    'nova',
    'sage',
    'shimmer', // not all works, need more checks
  ];

  const handleSubmit = () => {
    if (!client) {
      console.error('Client is not available!');
      return;
    }

    const combinedInstructions = `${instructions}\n\nUser Context:\n${prompt}`;

    client.updateSession({
      model,
      voice,
      instructions: combinedInstructions,
    });

    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      // variant="temporary" по умолчанию,

    >
      <AppBar position="relative" color="default" sx={{ boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: "'Roboto Mono', monospace", }}>
            Settings
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Основная часть (прокрутка) */}
      <Box sx={{ width: 300, height: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="model-label">GPT Model</InputLabel>
          <Select
            labelId="model-label"
            label="GPT Model"
            value={model}
            onChange={(e) => setModel(e.target.value as string)}
          >
            {modelOptions.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="voice-label">TTS Voice</InputLabel>
          <Select
            labelId="voice-label"
            label="TTS Voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value as string)}
          >
            {voiceOptions.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Prompt (Context)"
          multiline
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Box sx={{ textAlign: 'right', mt: 'auto', }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              width: '100%',
              fontFamily: "'Roboto Mono', monospace",
              fontWeight: 400,
              borderRadius:"1000px"
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
