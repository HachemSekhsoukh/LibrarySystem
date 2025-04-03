import { Grid, TextField, MenuItem } from "@mui/material";

const AddResourceForm = ({ bookData, handleChange, resourceTypes }) => {
    return (
        
        <Grid container spacing={2}>
            {/* Inventory Number */}
            <Grid item xs={6}>
                <TextField
                    label="Inventory Number"
                    name="inventoryNum"
                    value={bookData.inventoryNum}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Document Type */}
            <Grid item xs={6}>
                <TextField
                    select
                    label="Document Type"
                    name="type"
                    value={bookData.type}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                >
                    {resourceTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                            {type.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
                <TextField
                    label="Title"
                    name="title"
                    value={bookData.title}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Author */}
            <Grid item xs={6}>
                <TextField
                    label="Author"
                    name="author"
                    value={bookData.author}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Editor */}
            <Grid item xs={6}>
                <TextField
                    label="Editor"
                    name="editor"
                    value={bookData.editor}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* ISBN */}
            <Grid item xs={6}>
                <TextField
                    label="ISBN"
                    name="isbn"
                    value={bookData.isbn}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Price */}
            <Grid item xs={6}>
                <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={bookData.price}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Cote */}
            <Grid item xs={6}>
                <TextField
                    label="Cote"
                    name="cote"
                    value={bookData.cote}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Receiving Date */}
            <Grid item xs={6}>
                <TextField
                    label="Receiving Date"
                    name="receivingDate"
                    type="date"
                    value={bookData.receivingDate}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Status */}
            <Grid item xs={6}>
                <TextField
                    select
                    label="Status"
                    name="status"
                    value={bookData.status}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                >
                    <MenuItem value={1}>Available</MenuItem>
                    <MenuItem value={0}>Unavailable</MenuItem>
                </TextField>
            </Grid>

            {/* Observation */}
            <Grid item xs={12}>
                <TextField
                    label="Observation"
                    name="observation"
                    value={bookData.observation}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </Grid>
    );
};

export default AddResourceForm;
