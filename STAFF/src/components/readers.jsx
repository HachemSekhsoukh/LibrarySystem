import React, { useState } from 'react';
import { Dialog, Paper, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Readers = () => {
  const { t } = useTranslation();
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
      <DialogTitle>{t("reader_details")}</DialogTitle>
      {/* Dialog content */}
    </Dialog>
  );
};

export default Readers;