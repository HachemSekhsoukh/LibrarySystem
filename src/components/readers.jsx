import React, { useState } from 'react';
import { Dialog, Paper, DialogTitle } from '@mui/material';

const Readers = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minWidth: '800px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>Reader Details</DialogTitle>
      {/* Dialog content */}
    </Dialog>
  );
};

export default Readers; 