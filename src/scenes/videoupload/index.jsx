import {Alert, Box, Snackbar, Typography, useTheme} from "@mui/material";
import {tokens} from "../../theme";
import Header from "../../components/Header";
// import GeographyChart from "../../components/GeographyChart";
// import BarChart from "../../components/BarChart";
import CustomButton from "../../components/Button";
import React from "react";
import axios from "axios";
import LineChartCustom from "../../components/LineChartCustom";

const VideoUpload = () => {

    //video
    const [src, setSrc] = React.useState("");
    const [currentVideoName, setCurrentVideoName] = React.useState("");

    //snackbars
    const [open, setOpen] = React.useState(false);
    const [snackMsg, setSnackMsg] = React.useState("");
    const [severity, setSeverity] = React.useState("success");

    //evaluation
    const [evalArr, setEvalArr] = React.useState(null);
    const [evalValue, setEvalValue] = React.useState(-1);
    const [loading, setLoading] = React.useState(false); // State for API call loading

    //theme
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const openSnack = (msg, severity) => {
        setSnackMsg(msg)
        setOpen(true);
        setSeverity(severity);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const clearResults = () => {
        setEvalValue(-1);
        setEvalArr(null);
        setSrc("");
    }

    let uploadInput = React.createRef();

    const handleChange = (event) => {
        try {
            // Get the uploaded file
            const file = event.target.files[0];
            const fileName = event.target.files[0].name;
            setCurrentVideoName(fileName)
            setSrc(URL.createObjectURL(file));
        } catch (error) {
            console.error(error);
        }
    };

    const handleUploadFile = async (ev) => {
        // ev.preventDefault();

        // setisUploading(true);
        const data = new FormData();
        // Append the file to the request body
        for (let i = 0; i < uploadInput.files.length; i++) {
            data.append("file", uploadInput.files[i], uploadInput.files[i].name);
        }

        console.log("HERE");
        try {
            const response = await axios.post(
                "http://localhost:5000/upload",
                data
            );
            if (response.data.Success) {
                const data = response.data;
                openSnack("Video Successfully Evaluated", "success");
                setEvalArr(data.data);
                console.log(data.data);
                setEvalValue(data.value);
            } else {
                openSnack(response.data.Error + ", Please try again", "warning");
            }
        } catch (error) {
            openSnack("Unknown Error Occured" + " Please try again", "error")
        }
    };

    return (
        <Box m="20px">
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Evaluate Uploaded Videos"
                        subtitle={"Use this page to evaluate focus levels using an uploaded video"}/>
            </Box>

            {/* GRID & CHARTS */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="140px"
                gap="20px"
            >
                {/* ROW 1 */}
                <Box
                    gridColumn="span 9"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    // gridRow="span 3"
                >

                    <form
                        onSubmit={handleUploadFile}
                        style={{display: "flex", flexDirection: "column", width: "100%"}}>


                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            gap: "10px",
                            justifyContent: "center"
                        }}>

                            <label htmlFor="file"
                                   style={{
                                       display: 'inline-block',
                                       // border: '2px solid #007bff',
                                       // borderRadius: '5px',
                                       padding: '35px',
                                       textAlign: 'center',
                                       lineHeight: '30px',
                                       cursor: 'pointer',
                                       width: '95%',
                                       // height: '100px',
                                       // display: 'flex',
                                       justifyContent: 'center',
                                       alignItems: 'center',
                                       borderStyle: "dashed"
                                   }}>
                        <span>
                            <Typography
                                variant="h5"
                                fontWeight="400"
                                color={colors.grey[400]}
                            >
                                {src ? currentVideoName : "Click to select Video"}
                            </Typography>
                        </span>
                                <input
                                    id="file"
                                    type="file"
                                    multiple
                                    ref={(ref) => {
                                        uploadInput = ref;
                                    }}
                                    onChange={handleChange}
                                    style={{display: 'none'}}
                                />
                            </label>

                        </div>

                    </form>

                </Box>

                <Box
                    gridColumn="span 3"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    // gridRow="span 3"
                >

                    <Box display="flex"
                         alignItems="center"
                         justifyContent="center">

                        <CustomButton
                            title={"Evaluate"}
                            onClick={() => handleUploadFile()}/>

                        <CustomButton title={"Clear"}
                             onClick={() => {
                                 setSrc("");
                             }}/>
                    </Box>
                </Box>


                {/* ROW 2 */}

                <Box
                    gridColumn="span 4"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gridRow="span 2"
                >

                    {src !== "" ? <video src={src} controls width={"85%"}>
                        Sorry, your browser doesn't support embedded videos.
                    </video> : <Typography
                        variant="h5"
                        fontWeight="400"
                        color={colors.grey[400]}
                    >
                        Video preview
                    </Typography>}
                </Box>
                <Box
                    gridColumn="span 8"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                >
                    <Box
                        mt="25px"
                        p="0 30px"
                        display="flex "
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="h3"
                            fontWeight="600"
                            color={colors.grey[100]}
                        >
                            Evaluation for the captured video
                        </Typography>

                        {
                            evalValue === -1 ?
                                <></> :
                                <Box display="flex"
                                     alignItems="center"
                                     justifyContent="center">
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color={colors.greenAccent[500]}
                                    >
                                        {evalValue === 1 ? "Engaged" : "Disengaged"}
                                    </Typography>
                                    <CustomButton title={"Clear"} onClick={() => clearResults()}/>
                                </Box>
                        }

                    </Box>
                    {evalArr === null
                        ? <Box display="flex"
                               alignItems="center"
                               justifyContent="center">
                            <Typography
                                variant="h4"
                                color={colors.grey[500]}
                                sx={{paddingTop: 5}}
                            >
                                Evaluation graph will appear here
                            </Typography>
                        </Box>
                        : <Box height="250px" m="-20px 0 0 0">
                            {/*<LineChart isDashboard={true}/>*/}
                            <LineChartCustom
                                isCustomLineColors={true}
                                data={evalArr}/>
                        </Box>
                    }
                </Box>


            </Box>

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                >
                    <Typography
                        variant="h6"
                        fontWeight="600"
                        color={colors.grey[100]}
                    >
                        {snackMsg}
                    </Typography>
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default VideoUpload;