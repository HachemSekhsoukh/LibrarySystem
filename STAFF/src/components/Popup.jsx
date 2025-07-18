import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import "../CSS/components/popup.css";

export default function Popup(props) {
    const { title, children, openPopup, setOpenPopup, className = '' } = props;

    return (
        <Dialog open={openPopup} fullWidth maxWidth="lg" PaperProps={{className: "dialog-paper" }}>
            <DialogTitle>
                <div className="dialog-title">
                    <Typography variant="h6" component="div" className="dialog-title-text">
                        {title}
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
        </Dialog>
    );
}
