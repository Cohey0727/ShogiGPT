import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
});

export const logoContainer = style({
  display: 'flex',
  gap: '2rem',
  marginBottom: '2rem',
});

export const logo = style({
  width: '6rem',
  height: '6rem',
  transition: 'transform 0.3s ease',
  ':hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
});

export const title = style({
  fontSize: '3rem',
  fontWeight: 'bold',
  color: 'white',
  margin: '1rem 0',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
});

export const card = style({
  padding: '2rem',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '1rem',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  margin: '2rem 0',
});

export const button = style({
  padding: '0.75rem 2rem',
  fontSize: '1.125rem',
  fontWeight: '600',
  color: 'white',
  backgroundColor: '#667eea',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.4)',
  ':hover': {
    backgroundColor: '#5568d3',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(102, 126, 234, 0.6)',
  },
  ':active': {
    transform: 'translateY(0)',
  },
});

export const description = style({
  color: '#555',
  marginTop: '1rem',
  lineHeight: '1.6',
});

export const footer = style({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.875rem',
  marginTop: '2rem',
});
