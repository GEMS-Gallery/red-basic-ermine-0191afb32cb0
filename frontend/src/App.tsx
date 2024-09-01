import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { backend } from 'declarations/backend';

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
type Element = { id: string; name: string; position: Position };
type OfficeState = { layout: bigint[][]; elements: Element[]; characterPosition: Position };

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

    const tileSize = 50;
    canvas.width = Number(officeState.layout[0].length) * tileSize;
    canvas.height = Number(officeState.layout.length) * tileSize;

    officeState.layout.forEach((row, y) => {
      row.forEach((tile, x) => {
        ctx.fillStyle = Number(tile) === 1 ? '#000' : '#fff';
        ctx.fillRect(Number(x) * tileSize, Number(y) * tileSize, tileSize, tileSize);
      });
    });

    officeState.elements.forEach((element) => {
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(Number(element.position.x) * tileSize, Number(element.position.y) * tileSize, tileSize, tileSize);
    });

    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(
      Number(officeState.characterPosition.x) * tileSize,
      Number(officeState.characterPosition.y) * tileSize,
      tileSize,
      tileSize
    );
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
