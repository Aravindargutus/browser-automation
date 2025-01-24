import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await axios.post('http://localhost:3001/execute-prompt', {
        prompt
      });
      
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    if (results?.videoUrl) {
      setVideoDialogOpen(true);
    }
  };

  const getFullUrl = (path) => {
    return path.startsWith('http') ? path : `http://localhost:3001${path}`;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Browser Automation with LLM
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Enter your prompt (e.g., 'Go to Google and search for cats')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading || !prompt.trim()}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Execute'}
            </Button>
          </form>
        </Paper>

        {error && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {results && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            <Typography gutterBottom>
              {results.message}
            </Typography>

            {results.steps && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Executed Steps:
                </Typography>
                <List>
                  {results.steps.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Step ${index + 1}: ${step.action}`}
                        secondary={JSON.stringify(step.params)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Final Result {results.videoUrl && '(Click to play recording)'}
              </Typography>
              <Box 
                sx={{ 
                  cursor: results.videoUrl ? 'pointer' : 'default',
                  position: 'relative',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  overflow: 'hidden',
                  '&:hover': results.videoUrl ? {
                    '&::after': {
                      content: '"▶"',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '64px',
                      color: 'white',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      opacity: 0.8
                    }
                  } : {}
                }}
                onClick={handleImageClick}
              >
                <img 
                  src={getFullUrl(results.finalScreenshot)} 
                  alt="Final Screenshot" 
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }} 
                />
              </Box>
            </Box>
          </Paper>
        )}

        <Dialog
          open={videoDialogOpen}
          onClose={() => setVideoDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ position: 'relative', p: 0 }}>
            <IconButton
              sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
              onClick={() => setVideoDialogOpen(false)}
            >
              <CloseIcon />
            </IconButton>
            <video
              controls
              autoPlay
              style={{ width: '100%', height: 'auto' }}
              src={results?.videoUrl ? getFullUrl(results.videoUrl) : ''}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App; 