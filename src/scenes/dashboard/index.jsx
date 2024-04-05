import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
// import GeographyChart from "../../components/GeographyChart";
// import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import CustomButton from "../../components/Button";
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const handleClick = (route) => {
        navigate(route);
    };

    return (
        <Box m="20px">
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Student Focus Evaluation System"
                        subtitle="Welcome" />
            </Box>

            {/* GRID & CHARTS */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="140px"
                gap="20px"
            >

                {/* ROW 3 */}
                <Box
                    gridColumn="span 6"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography variant="h3" fontWeight="600">
                        Problem
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="column"
                        // alignItems="center"
                        mt="15px"
                    >
                        <Typography variant="h4"  color={colors.primary[100]} align={"justify"}>
                            The main issue identified in a virtual classroom is the teachers inability to accurately evaluate student focus level.
                            This problem has converted online classrooms into a feeble place. This is very easy in a physical classroom and is very tedious or impossible in a virtual classroom due to the number
                            of students that are shown in a single screen or teachers sharing through slides and not being able to see the students at all.
                        </Typography>
                    </Box>
                </Box>

                <Box
                    gridColumn="span 6"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography variant="h3" fontWeight="600">
                        Solution
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="column"
                        // alignItems="center"
                        mt="15px"
                    >
                        <Typography variant="h4"  color={colors.primary[100]} align={"justify"}>
                            This system uses Computer Vision techniques to evaluate focus levels of a student
                            from a video. Goal is to test the performance and accuracy of a focus evaluation model and use the model
                            in an integrable tool for a virtual classroom platform.
                            By showing focus evaluations to a teacher in classroom, the teacher can dynamically shift the teaching process to keep more students engaged just like a real classoom.
                        </Typography>
                    </Box>
                </Box>

                <Box
                    gridColumn="span 12"
                    gridRow="span 3"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography variant="h3" fontWeight="600">
                        How it works
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent={"center"}
                        mt="15px"
                    >
                        <Box
                            component="img"
                            sx={{
                                // height: "25%",
                                width: "50%",
                                // maxHeight: { xs: 233, md: 167 },
                                // maxWidth: { xs: 350, md: 250 },
                            }}
                            alt="The house from the offer."
                            src="./assets/flow.png"
                        />
                        <Typography variant="h4" ml={5}  color={colors.primary[100]} align={"justify"}>
                            System uses a hybrid model,
                                <li>A Spatio Temporal Convolutional Autoencoder</li>
                                <li>Pose evaluator</li>
                        </Typography>
                    </Box>
                </Box>

                <Box
                    gridColumn="span 12"
                    gridRow="span 1"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography variant="h3" fontWeight="600">
                        Try it out
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent={"center"}
                        // mt="15px"
                    >
                        <CustomButton title={"Evaluate using Webcam Capture"} onClick={() => handleClick("/webcam")}/>
                        <CustomButton title={"Evaluate using Upload Video"} onClick={() => handleClick("/videoUpload")}/>
                    </Box>
                </Box>

            </Box>
        </Box>
    );
};

export default Dashboard;