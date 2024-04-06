import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import {tokens} from "../../theme";
import Header from "../../components/Header";
import React, {useEffect, useState} from "react";
import CustomButton from "../../components/Button";
import LineChartCustom from "../../components/LineChartCustom";
import Modal from "@mui/material/Modal";
import CloseIcon from '@mui/icons-material/Close';

const Team = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [data, setData] = useState([]);
    const [evalArr, setEvalArr] = React.useState(
        [
            1.0,
            0.997280825307936,
            0.8234506969098445,
            0.8234506969098442345,
            0.538234506969098445,
            0.538234506969098445,
            0.78234506969098445,
            0.78234506969098445,
            0.7128234506969098445,
            0.127578715391127908
        ]
    );
    const [openModal, setOpenModal] = useState(false); // State for managing modal open state
    const [open, setOpen] = React.useState(false);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/getEvaluations");
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await response.json();
                setData(jsonData.users); // Set the "users" array to the data state
                // console.log(jsonData.users); // Set the "users" array to the data state
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures useEffect runs only once on mount


    const handleClose = () => setOpen(false);

    const columns = [
        {
            field: "id",
            headerName: "ID"
        },
        {
            field: "type",
            headerName: "Type",
            flex: 1,
        },
        {
            field: "scores",
            headerName: "Options",
            flex: 1,
            renderCell: ({row}) => (
                <Box>
                    <CustomButton title={"Show Graph"} onClick={() => {
                        setEvalArr(row.scores);
                        setOpen(true);
                    }}/>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Previous Evaluations"
                    subtitle="View previously evaluated focus levels"/>

            <TableContainer component={Paper} style={{maxHeight: 600}}>
                <Table stickyHeader aria-label="simple table">
                    <TableHead style={{backgroundColor: "teal"}}>
                        <TableRow>
                            <TableCell style={{backgroundColor: "teal"}}>
                                <Typography
                                    variant="h4"
                                    fontWeight="600"
                                    color={colors.grey[100]}>
                                    ID
                                </Typography>
                            </TableCell>
                            <TableCell style={{backgroundColor: "teal"}}>
                                <Typography
                                    variant="h4"
                                    fontWeight="600"
                                    color={colors.grey[100]}
                                >
                                    Type
                                </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{pr: 7}} style={{backgroundColor: "teal"}}>
                                <Typography
                                    variant="h4"
                                    fontWeight="600"
                                    color={colors.grey[100]}
                                >
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    <Typography variant="h5">{row.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h5">{row.type}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <CustomButton
                                        title={"Show Graph"}
                                        onClick={() => {
                                            setEvalArr(row.scores);
                                            setOpen(true);
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={open}
                onClose={handleClose}
            >

                <Box style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "60%",
                    // height: "300px",
                    padding: "10px",
                }} backgroundColor={colors.primary[400]}
                >
                    <Box
                        display={"flex"}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                    >
                        <Typography
                            variant="h3"
                            fontWeight="600"
                            color={colors.grey[100]}
                            sx={{ml: 2, mt: 2}}
                        >
                            Evaluation for the selected video
                        </Typography>
                        <IconButton onClick={() => handleClose()} sx={{mr: 2, mt: 2}}>
                            <CloseIcon fontSize={"large"}/>
                        </IconButton>
                    </Box>
                    <Box height="350px" sx={{pl: 2, pt: -1}}>
                        {/*<LineChart isDashboard={true}/>*/}
                        <LineChartCustom
                            isCustomLineColors={true}
                            data={evalArr}/>
                    </Box>

                    {/*<Box height="250px" m="-20px 0 0 0">*/}
                    {/*    <LineChartCustom*/}
                    {/*        isCustomLineColors={true}*/}
                    {/*        data={evalArr}/>*/}
                    {/*</Box>*/}
                </Box>
            </Modal>

        </Box>
    );
};

export default Team;
