import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import Button from "./Button"; // Adjust the path if needed

export default function Popup(props) {
    const { title, children, openPopup, setOpenPopup } = props;

    return (
        <Dialog open={openPopup} maxWidth="md">
            <DialogTitle>
                <div style={{ display: 'flex' }}>
                    <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    <Button
                        color="secondary"
                        onClick={() => setOpenPopup(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
        </Dialog>
    );
}
