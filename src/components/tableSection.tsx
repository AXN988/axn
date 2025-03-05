'use client'
import React, { useState, useEffect } from 'react';
import { AmountData, DayData, MenuItem } from '@/model/menuItems';
import { toast, ToastContainer } from 'react-toastify';
import { FirebaseServices } from '@/services/firebase-services';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TableSectionProps {
    menu: MenuItem[];
    firebaseAmountData: AmountData;
    addedMenu: MenuItem[];
    addedExpectedIncome: number;
    addedTotalIncome: number;
}

const TableSection: React.FC<TableSectionProps> = ({ menu, firebaseAmountData, addedMenu, addedExpectedIncome, addedTotalIncome }) => {
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [expectedIncome, setExpectedIncome] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalDiff, setTotalDiff] = useState<number>(0);

    useEffect(() => {
        console.log(addedMenu, "addedMenu");

        setMenuData(addedMenu && addedMenu.length > 0 ? addedMenu : menu);
        setExpectedIncome(addedExpectedIncome);
        setTotalIncome(addedTotalIncome);
    }, [menu, addedMenu, addedExpectedIncome, addedTotalIncome]);

    // Calculate the total expected income based on menu data
    const calculateExpectedIncome = () => {
        const total = menuData.reduce((acc, item) => {
            return acc + (item.totalAmount ?? 0); // Safely sum totalAmount (handle null with nullish coalescing)
        }, 0);
        setExpectedIncome(total);
    };

    // Handle input change for Kg/Unit
    const handleInputChange = (id: number, value: number) => {
        // Create a new menuData array with the updated value
        const updatedMenuData = menuData.map((item) => {
            if (item.id === id) {
                const updatedItem = {
                    ...item,
                    kg: value || null, // Set kg to null if value is 0 or invalid
                    totalAmount: value ? value * item.price : null, // Set totalAmount to null if kg is null or 0
                };
                return updatedItem;
            }
            return item;
        });

        // Set the updated menuData
        setMenuData(updatedMenuData);
    };

    // Handle Total Income change
    const handleTotalIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setTotalIncome(value);
    };

    // Recalculate expected income and totalDiff whenever menuData or totalIncome changes
    useEffect(() => {
        calculateExpectedIncome();
        if (totalIncome !== 0 && expectedIncome !== 0) {
            setTotalDiff(totalIncome - expectedIncome);
        } else {
            setTotalDiff(0);
        }
    }, [menuData, totalIncome]);

    // Clear All button handler
    const handleClearAll = () => {
        // Reset menu data or clear input fields as needed
        const resetMenuData = menuData.map((item) => ({
            ...item,
            kg: null, // Reset kg to null
            totalAmount: null, // Reset totalAmount to null
        }));

        setMenuData(resetMenuData);
        setTotalIncome(0); // Reset totalIncome
    };

    const handleSave = () => {
        // Use the current state of amountData to determine the year, month, and day
        const currentYear = Object.keys(firebaseAmountData)[0]; // Using the first available year
        const currentMonth = Object.keys(firebaseAmountData[currentYear])[0]; // Using the first available month
        const currentDay = Object.keys(firebaseAmountData[currentYear][currentMonth])[0]; // Using the first available day

        // Create a DayData object with the current menuData, expectedIncome, and totalIncome
        const dayData: DayData = {
            menuList: menuData, // Save the current menu data
            expectedIncome: expectedIncome, // Save expected income
            totalIncome: totalIncome, // Save total income
        };

        // Ensure that the year, month, and day exist in the structure, and update or add the data
        if (!firebaseAmountData[currentYear]) {
            firebaseAmountData[currentYear] = {};
        }
        if (!firebaseAmountData[currentYear][currentMonth]) {
            firebaseAmountData[currentYear][currentMonth] = {};
        }

        // Update the data for the current day (use the existing data if present, otherwise update with new data)
        firebaseAmountData[currentYear][currentMonth][currentDay] = {
            ...firebaseAmountData[currentYear][currentMonth][currentDay], // Preserve existing data
            ...dayData, // Update with the current data
        };

        // Call the setAmountData function from FirebaseServices
        FirebaseServices.shared.setAmountData(currentYear, currentMonth, currentDay, firebaseAmountData[currentYear][currentMonth][currentDay], (status) => {
            if (status === "done") {
                toast.success('Data successfully added', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error('Error adding data', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        });
    };

    // Function to load the .ttf font and convert it to Base64
    const convertFontToBase64 = async () => {
        // Fetch the font file
        const response = await fetch('/fonts/NotoSansTamil-VariableFont_wdth,wght.ttf');
        const arrayBuffer = await response.arrayBuffer();
        const base64Font = arrayBufferToBase64(arrayBuffer);
        return base64Font;
    };

    // Helper function to convert arrayBuffer to Base64
    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const length = bytes.byteLength;
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary); // Converts the binary string to Base64
    };

    const handleDownloadPdf = async () => {
        const doc = new jsPDF();

        // Convert font to Base64
        const currentYear = Object.keys(firebaseAmountData)[0]; // Using the first available year
        const currentMonth = Object.keys(firebaseAmountData[currentYear])[0]; // Using the first available month
        const currentDay = Object.keys(firebaseAmountData[currentYear][currentMonth])[0]; // Using the first available day

        const fontBase64 = await convertFontToBase64();
        doc.addFileToVFS('NotoSansTamil-VariableFont.ttf', fontBase64);
        doc.addFont('NotoSansTamil-VariableFont.ttf', 'NotoSansTamil', 'normal');

        // Set font to Tamil for the title
        doc.setFont("NotoSansTamil", "normal");
        doc.text(`Date: ${currentDay} ${currentMonth} ${currentYear} `, doc.internal.pageSize.width / 2, 10, { align: "center" }); // Center the title

        // Add the table using autoTable
        const tableData = menuData.map(item => [item.name, item.kg?.toString() || '']); // Map menu data to table rows
        const columns = ["Item Name", "Kg"]; // Column headers

        // Set up the table
        autoTable(doc, {
            startY: 20, // Start Y position for the table
            margin: { left: 34 }, // Margin from the top of the page
            head: [columns], // Header row
            body: tableData, // Body rows
            theme: 'grid', // Optional: theme for the table (you can also try 'striped', 'plain')
            styles: {
                font: 'NotoSansTamil', // Apply the Tamil font to the table
                fontSize: 12,
                halign: 'center', // Horizontally center-align the content in cells
                valign: 'middle', // Vertically center-align the content in cells
            },
            columnStyles: {
                0: { cellWidth: 90 }, // Adjust column width for item names
                1: { cellWidth: 50 }, // Adjust column width for kg
            },
            headStyles: {
                halign: 'center', // Center-align header
                fillColor: [0, 0, 0], // Set background color to black (RGB)
                textColor: [255, 255, 255], // Set text color to white
            },
            didDrawPage: (data) => {
                // Add expected income, total income, and total diff at the end of the page
                const finalY = data.cursor ? data.cursor.y : 0; // Get the Y position of the last drawn content

                doc.setFont("helvetica", "bold");
                doc.text(`Expected Income: ${expectedIncome}`, 96, finalY + 10, { align: "right" });
                doc.text(`Total Income: ${totalIncome}`, 85, finalY + 20, { align: "right" });
                doc.text(`Total Difference: ${totalDiff >= 0 ? `+${totalDiff}` : totalDiff}`, 87, finalY + 30, { align: "right" });
            },
        });

        // Save the PDF
        doc.save("menu-list.pdf");
    };



    return (
        <div className="p-4 min-h-screen">
            <ToastContainer />
            {/* Table 1: Items and Kg/Unit */}
            <div className="flex flex-col lg:flex-row lg:space-x-8 pb-16">
                <div className="w-full lg:w-[70%] mb-6">
                    <table className="w-full table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="text-start px-4 py-2 border border-gray-300">Item</th>
                                <th className="text-end px-10 py-2 border border-gray-300">Kg/Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuData.map((row: MenuItem, index: number) => (
                                <tr key={index}>
                                    <td className="text-start px-4 py-2 border border-gray-300">{row.name}</td>
                                    <td className="text-end px-4 py-2 border border-gray-300">
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 bg-transparent text-right focus:outline-none font-bold"
                                            value={row.kg || ''} // Bind input value to the kg field
                                            onChange={(e) => handleInputChange(row.id, parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tbody>
                            <tr className="text-black">
                                <th className="text-start px-4 py-2 border border-gray-300">Expected Income Amount</th>
                                <th className="text-end px-4 py-2 border border-gray-300">{expectedIncome}</th>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="w-full lg:w-[30%]">
                    {/* Table 2: Income Received Via and Amount */}
                    <div className="w-full pb-6">
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-start px-4 py-2 border border-gray-300">Income Received Via</th>
                                    <th className="text-end px-6 py-2 border border-gray-300">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-black">
                                    <th className="text-start px-4 py-2 border border-gray-300">Total Income Received</th>
                                    <th className="text-end py-2 border border-gray-300">
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 bg-transparent text-right focus:outline-none font-bold"
                                            value={totalIncome || ''} // Bind input value to the kg field
                                            onChange={handleTotalIncomeChange}
                                        />
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Table 3: Account Summary and Amount */}
                    <div className="w-full pb-8">
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th className="text-start px-4 py-2 border border-primary">Accounts</th>
                                    <th className="text-end px-4 py-2 border border-primary"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-start px-4 py-2 border border-gray-300">Expected Income Amount</td>
                                    <td className="text-end px-4 py-2 border border-gray-300">{expectedIncome}</td>
                                </tr>
                                <tr>
                                    <td className="text-start px-4 py-2 border border-gray-300">Total Income Received</td>
                                    <td className="text-end px-4 py-2 border border-gray-300">{totalIncome}</td>
                                </tr>
                                <tr className="text-black">
                                    <th className="text-start px-4 py-2 border border-gray-300">Total Income Diff</th>
                                    <th className="text-end px-4 py-2 border border-gray-300">{totalDiff >= 0 ? `+${totalDiff}` : totalDiff}</th>
                                </tr>
                            </tbody>
                        </table>
                        <div className="border border-primary rounded p-4 mt-4 flex justify-between items-center cursor-pointer" onClick={handleDownloadPdf}>
                            <div className="text-primary font-bold">Download Pdf</div>
                            <DownloadIcon sx={{ color: 'red' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-white py-4 px-8 flex justify-end space-x-4 items-center" style={{ boxShadow: "0px 0px 8px gray" }}>
                <button
                    onClick={handleClearAll}
                    className="px-4 py-2 border border-primary text-primary rounded-md focus:outline-none"
                >
                    Clear All
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 border border-primary bg-primary text-white rounded-md focus:outline-none"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default TableSection;
