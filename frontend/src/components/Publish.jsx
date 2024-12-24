import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import PropTypes from "prop-types";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid2";
import { useCreateSchedule } from "../hooks/Calendar/useCreateSchedule";

function Publish({ open, handleClose }) {
  const [errorState, setErrorState] = useState({
    role_name: { error: false, message: "" },
  });
  const setError = (field, error, message) => {
    setErrorState((prevState) => ({
      ...prevState,
      [field]: { error, message },
    }));
  };

  const validateInputs = () => {
    const role_name = document.getElementById("role_name");
    let isValid = true;
    // if (!role_name.value || role_name.value.length < 1) {
    //   setError("role_name", true, "Role name is required.");
    //   isValid = false;
    // } else {
    //   setError("role_name", false, "");
    // }
    return isValid;
  };
  const { createSchedule, error, isLoading } = useCreateSchedule();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateInputs();
    if (!isValid) {
      return;
    }
    // const role_name = document.getElementById("role_name").value;
    const outlet_name = document.getElementById("outlet_name").value;
    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;
    const start_time = document.getElementById("start_time").value;
    const end_time = document.getElementById("end_time").value;
    const vacancy = document.getElementById("vacancy").value;
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const amt = endDateObj - startDateObj;
    const diffInDays = amt / (1000 * 60 * 60 * 24);
    const schedulePromisesArr = [];
    for (let i = 0; i <= diffInDays; i++) {
      const date = new Date(start_date);
      date.setDate(date.getDate() + i);
      const formatted_date = date.toISOString().split("T")[0];
      const schedulePromise = createSchedule(
        outlet_name,
        formatted_date + " " + start_time,
        formatted_date + " " + end_time,
        vacancy
      );
      schedulePromisesArr.push(schedulePromise);
    }
    try {
      await Promise.all(schedulePromisesArr);
    } catch (error) {
      console.error("Error creating schedules:", error);
    }
    handleClose();
  };
  const formFieldsLeft = [
    {
      id: "outlet_name",
      label: "Outlet",
      error: errorState.role_name.error,
      helperText: errorState.role_name.message,
    },
    {
      id: "start_date",
      label: "Start",
      type: "date",
      error: errorState.role_name.error,
      helperText: errorState.role_name.message,
    },
    {
      id: "start_time",
      label: "Start",
      type: "time",
      error: errorState.role_name.error,
      helperText: errorState.role_name.message,
    },
  ];
  const formFieldsRight = [
    {
      id: "vacancy",
      label: "Vacancy",
      placeholder: "1",
      error: errorState.role_name.error,
      helperText: errorState.role_name.message,
    },
    {
      id: "end_date",
      label: "End",
      type: "date",
      error: errorState.role_name.error,
      helperText: errorState.role_name.message,
    },
    {
      id: "end_time",
      label: "End",
      type: "time",
      error: errorState.role_name.error,
      helperText: errorState.role_name.message,
    },
  ];
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="create-role-dialog-title"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: { backgroundImage: "none" },
      }}
    >
      <DialogTitle id="create-role-dialog-title">Create Schedule</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 6 }}>
            {formFieldsLeft.map((field) => (
              <FormControl key={field.id} fullWidth sx={{ marginBottom: 2 }}>
                <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                {field.type == "select" ? (
                  <TextField
                    required
                    id={field.id}
                    name={field.id}
                    select
                    value={field.value}
                    onChange={(e) => setSex(e.target.value)}
                    fullWidth
                  >
                    {field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    autoComplete={field.id}
                    name={field.id}
                    id={field.id}
                    fullWidth
                    variant="outlined"
                    defaultValue={field.defaultValue}
                    type={field.type}
                    placeholder={field.placeholder}
                    error={field.error}
                    helperText={field.helperText}
                    color={field.error ? "error" : "primary"}
                  />
                )}
              </FormControl>
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {formFieldsRight.map((field) => (
              <FormControl key={field.id} fullWidth sx={{ marginBottom: 2 }}>
                <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                <TextField
                  autoComplete={field.id}
                  name={field.id}
                  fullWidth
                  defaultValue={field.defaultValue}
                  options={field.options}
                  type={field.type}
                  id={field.id}
                  placeholder={field.placeholder}
                  error={field.error}
                  helperText={field.helperText}
                  color={field.error ? "error" : "primary"}
                />
              </FormControl>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" type="submit">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Publish.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default Publish;