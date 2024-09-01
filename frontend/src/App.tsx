import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { backend } from 'declarations/backend';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ChairIcon from '@mui/icons-material/Chair';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import PersonIcon from '@mui/icons-material/Person';

const GameCanvas = styled('canvas')``;

const ControlPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: theme.shape.borderRadius,
}));

const DirectionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

type Position = { x: bigint; y: bigint };
type ElementType = 'wall' | 'floor' | 'desk' | 'chair' | 'plant' | 'computer';
type Element = { id: string; elementType: ElementType; position: Position };
type OfficeState = { layout: ElementType[][]; elements: Element[]; characterPosition: Position };

const App: React.FC = () => {
  const [officeState, setOfficeState] = useState<OfficeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeOffice();
  }, []);

  const initializeOffice = async () => {
    try {
      await backend.initializeOffice();
      await updateOfficeState();
    } catch (err) {
      setError('Failed to initialize office');
      setLoading(false);
    }
  };

  const updateOfficeState = async () => {
    try {
      const state = await backend.getOfficeState();
      setOfficeState(state);
      setLoading(false);
    } catch (err) {
      setError('Failed to get office state');
      setLoading(false);
    }
  };

  const moveCharacter = async (dx: number, dy: number) => {
    if (!officeState) return;

    const newX = Number(officeState.characterPosition.x) + dx;
    const newY = Number(officeState.characterPosition.y) + dy;

    try {
      setLoading(true);
      await backend.moveCharacter(BigInt(newX), BigInt(newY));
      await updateOfficeState();
    } catch (err) {
      setError('Failed to move character');
    } finally {
      setLoading(false);
    }
  };

  const renderOffice = () => {
    if (!officeState) return null;

    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const tileSize = 60;
    canvas.width = Number(officeState.layout[0].length) * tileSize;
    canvas.height = Number(officeState.layout.length) * tileSize;

    const floorPattern = ctx.createPattern(createFloorTexture(), 'repeat');
    const wallPattern = ctx.createPattern(createWallTexture(), 'repeat');

    officeState.layout.forEach((row, y) => {
      row.forEach((tile, x) => {
        ctx.fillStyle = tile === 'wall' ? wallPattern! : floorPattern!;
        ctx.fillRect(Number(x) * tileSize, Number(y) * tileSize, tileSize, tileSize);
      });
    });

    officeState.elements.forEach((element) => {
      const x = Number(element.position.x) * tileSize;
      const y = Number(element.position.y) * tileSize;
      switch (element.elementType) {
        case 'desk':
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x + 5, y + 5, tileSize - 10, tileSize - 10);
          break;
        case 'chair':
          ctx.fillStyle = '#A52A2A';
          ctx.beginPath();
          ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 3, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case 'plant':
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.moveTo(x + tileSize / 2, y);
          ctx.lineTo(x + tileSize, y + tileSize);
          ctx.lineTo(x, y + tileSize);
          ctx.closePath();
          ctx.fill();
          break;
      }
    });

    // Draw character
    const charX = Number(officeState.characterPosition.x) * tileSize;
    const charY = Number(officeState.characterPosition.y) * tileSize;
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.arc(charX + tileSize / 2, charY + tileSize / 2, tileSize / 3, 0, 2 * Math.PI);
    ctx.fill();
  };

  const createFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#F0E68C';
      ctx.fillRect(0, 0, 50, 50);
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 50);
      ctx.moveTo(50, 0);
      ctx.lineTo(0, 50);
      ctx.stroke();
    }
    return canvas;
  };

  const createWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#D3D3D3';
      ctx.fillRect(0, 0, 50, 50);
      ctx.strokeStyle = '#A9A9A9';
      ctx.lineWidth = 2;
      for (let i = 0; i < 50; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 50);
        ctx.moveTo(0, i);
        ctx.lineTo(50, i);
        ctx.stroke();
      }
    }
    return canvas;
  };

  useEffect(() => {
    if (officeState) {
      renderOffice();
    }
  }, [officeState]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameCanvas id="gameCanvas" />
      <ControlPanel>
        <DirectionButton onClick={() => moveCharacter(0, -1)}>Up</DirectionButton>
        <Box sx={{ display: 'flex' }}>
          <DirectionButton onClick={() => moveCharacter(-1, 0)}>Left</DirectionButton>
          <DirectionButton onClick={() => moveCharacter(1, 0)}>Right</DirectionButton>
        </Box>
        <DirectionButton onClick={() => moveCharacter(0, 1)}>Down</DirectionButton>
      </ControlPanel>
    </Box>
  );
};

export default App;
