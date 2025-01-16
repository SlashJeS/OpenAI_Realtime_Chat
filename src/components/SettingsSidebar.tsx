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

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSidebar({ isOpen, onClose }: SettingsSidebarProps) {
  // Состояния для выбора модели, голоса, Prompt
  const [model, setModel] = useState('4O');
  const [voice, setVoice] = useState('alloy');
  const [prompt, setPrompt] = useState('');

  // Список моделей
  const modelOptions = ['4O', '4O-mini', 'O1', 'O1-mini'];
  // Список голосов
  const voiceOptions = [
    'alloy',
    'ash',
    'coral',
    'echo',
    'fable',
    'onyx',
    'nova',
    'sage',
    'shimmer',
  ];

  const handleSubmit = () => {
    console.log('Settings submitted:');
    console.log('Model:', model);
    console.log('Voice:', voice);
    console.log('Prompt:', prompt);
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Основная часть (прокрутка) */}
      <Box sx={{ width: 300, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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

        <Box sx={{ textAlign: 'right' }}>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
