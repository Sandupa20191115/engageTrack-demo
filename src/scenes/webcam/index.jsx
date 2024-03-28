import {Alert, Box, Snackbar, Typography, useTheme} from "@mui/material";
import {tokens} from "../../theme";
import Header from "../../components/Header";
// import GeographyChart from "../../components/GeographyChart";
// import BarChart from "../../components/BarChart";
import CustomButton from "../../components/Button";
import Webcam from "react-webcam";
import React from "react";
import axios from "axios";
import LineChartCustom from "../../components/LineChartCustom";

const WebcamView = () => {

    //webcam stuff
    const [capturing, setCapturing] = React.useState(false);
    const [recordedChunks, setRecordedChunks] = React.useState([]);

    //snackbars
    const [open, setOpen] = React.useState(false);
    const [snackMsg, setSnackMsg] = React.useState("");
    const [severity, setSeverity] = React.useState("success");

    //evaluation
    const [evalArr, setEvalArr] = React.useState(null);
    const [evalValue, setEvalValue] = React.useState(-1);
    const [loading, setLoading] = React.useState(false); // State for API call loading

    //Allows straight download without button click
    const isInitialMount = React.useRef(true);
    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (!capturing) {
                // console.log('running handleDownload')
                handleDownload();
            }
        }
    }, [recordedChunks])

    //theme
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    //webcam
    const webcamRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);

    const handleStartCaptureClick = React.useCallback(() => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
            mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [webcamRef, setCapturing, mediaRecorderRef]);

    const handleDataAvailable = React.useCallback(
        ({data}) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        [setRecordedChunks]
    );

    const handleStopCaptureClick = React.useCallback(() => {
        // setShowWebcam(false);
        mediaRecorderRef.current.stop();
        setCapturing(false);

    }, [mediaRecorderRef, webcamRef, setCapturing]);

    const handleDownload = React.useCallback(async () => {

        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            console.log("-------------")
            console.log(URL.createObjectURL(blob))
            console.log("-------------")
            // setSrc(url);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "capture-" + 534 + ".avi";
            a.click();
            window.URL.revokeObjectURL(url);
            setRecordedChunks([]);

            //API call
            // Make API call to fetch evaluation data
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/evaluateOK/5`, {
                    onDownloadProgress: progressEvent => {
                        // Calculate progress percentage
                        const progress = (progressEvent.loaded / progressEvent.total) * 100;
                        console.log(progress);
                    }
                });
                setLoading(false); // Stop loading                console.log(response.data);

                if (response.data.Success) {
                    const data = response.data;
                    openSnack("Video Successfully Evaluated", "success");
                    setEvalArr(data.data);
                    setEvalValue(data.value);
                } else {
                    openSnack(response.data.Error + ", Please try again", "warning");
                }
            } catch (error) {
                console.log(error);
                openSnack("API Call Failed" + ", Please try again", "error");
            }

        }

    }, [recordedChunks]);

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
    }

    return (
        <Box m="20px">
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Evaluate Webcam Captures"
                        subtitle={"Use this page to evaluate focus levels using a video captured from your webcam"}/>
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
                    gridColumn="span 6"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gridRow="span 3"
                >
                    {/*<div>*/}
                    <Webcam audio={false} ref={webcamRef} height={"100%"}/>
                    {/*</div>*/}
                </Box>
                <Box
                    gridColumn="span 6"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gridRow="span 3"
                >

                    <Box display="flex"
                         alignItems="center"
                         justifyContent="center">
                        <CustomButton title={"Start Capturing"}
                                      onClick={() => handleStartCaptureClick()}/>

                        <CustomButton title={"Stop Capturing and Evaluate"}
                                      onClick={() => handleStopCaptureClick()}/>
                    </Box>
                </Box>


                {/* ROW 2 */}
                <Box
                    gridColumn="span 12"
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
                    {evalArr == null
                        ? <Box display="flex"
                               alignItems="center"
                               justifyContent="center">
                            <Typography
                                variant="h4"
                                color={colors.grey[500]}
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

export default WebcamView;