import { Button, useTheme } from "@mui/material";
import { tokens } from "../theme";
import React from "react";

const CustomButton = ({ title, onClick , icon , disable=false,style}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const handleClick = () => {
        if (onClick) { // Check if onClick function is provided
            onClick(); // Call the onClick function when the button is clicked
        }
    };

    return (
        <Button
            onClick={handleClick} // Attach handleClick function to the onClick event of the Button
            sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                margin: "10px",
                ...style
            }}
            disabled={disable}
        >
            {icon && React.cloneElement(icon, { sx: { mr: "10px" } })}
            {title}
        </Button>
    );
};

export default CustomButton;
