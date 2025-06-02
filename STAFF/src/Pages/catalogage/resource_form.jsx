import { Grid, TextField, MenuItem } from "@mui/material";
import "../../CSS/catalogage/resource_form.css";
import { useTranslation } from "react-i18next";

const AddResourceForm = ({ bookData, handleChange, resourceTypes }) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={2}>
            {/* Inventory Number */}
            <Grid item xs={6}>
                <TextField
                    className="custom-textfield"
                    label={t("inventory_number")}
                    name="inventoryNum"
                    value={bookData.inventoryNum}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* RFID */}
            <Grid item xs={6}>
                <TextField
                    className="custom-textfield"
                    label={t("rfid")}
                    name="rfid"
                    value={bookData.rfid}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Document Type */}
            <Grid item xs={6}>
                <TextField
                    className="custom-textfield"
                    select
                    label={t("document_type")}
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
                    className="custom-textfield"
                    label={t("title")}
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
                    className="custom-textfield"
                    label={t("author")}
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
                    className="custom-textfield"
                    label={t("editor")}
                    name="editor"
                    value={bookData.editor}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            
            <Grid item xs={12} sm={6}>
                <TextField
                    label={t("edition_year")}
                    name="edition"
                    type="number"
                    inputProps={{ min: 1000, max: 9999 }}
                    value={bookData.edition}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* ISBN */}
            <Grid item xs={6}>
                <TextField
                    className="custom-textfield"
                    label={t("isbn")}
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
                    className="custom-textfield"
                    label={t("price")}
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
                    className="custom-textfield"
                    label={t("cote")}
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
                    className="custom-textfield"
                    label={t("receiving_date")}
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
                    className="custom-textfield"
                    select
                    label={t("status")}
                    name="status"
                    value={bookData.status}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                >
                    <MenuItem value={1}>{t("available")}</MenuItem>
                    <MenuItem value={0}>{t("unavailable")}</MenuItem>
                </TextField>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
                <TextField
                    className="custom-textfield"
                    label={t("description")}
                    name="description"
                    value={bookData.description}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            {/* Observation */}
            <Grid item xs={12}>
                <TextField
                    className="custom-textfield"
                    label={t("observation")}
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
            <Grid item xs={12}>
                <TextField
                    label={t("resume")}
                    name="resume"
                    value={bookData.resume}
                    onChange={handleChange}
                    multiline
                    variant="outlined"
                    fullWidth
                    rows={3}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </Grid>
    );
};

export default AddResourceForm;
