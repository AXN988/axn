'use client'
import React, { useState, useEffect } from 'react';
import itemsData from '../data.json';
import { AmountData, DayData, MenuItem } from '@/model/menuItems';
import { toast, ToastContainer } from 'react-toastify';

const TableSection: React.FC = () => {
    const [menuData, setMenuData] = useState<MenuItem[]>(itemsData.data);
    const [expectedIncome, setExpectedIncome] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalDiff, setTotalDiff] = useState<number>(0);
    const [amountData, setAmountData] = useState<AmountData>({});
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
        setTotalDiff(totalIncome - expectedIncome);
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
        // Retrieve existing amountData from localStorage if it exists
        const storedAmountData = localStorage.getItem('amountData');
        let updatedAmountData: AmountData = storedAmountData ? JSON.parse(storedAmountData) : {};

        // Assuming the current data corresponds to today (you could also provide custom date logic)
        // Use the current state of amountData to determine the year, month, and day
        const currentYear = Object.keys(updatedAmountData)[0]; // Using the first available year
        const currentMonth = Object.keys(updatedAmountData[currentYear])[0]; // Using the first available month
        const currentDay = Object.keys(updatedAmountData[currentYear][currentMonth])[0]; // Using the first available day

        // Create a DayData object with the current menuData, expectedIncome, and totalIncome
        const dayData: DayData = {
            menuList: menuData, // Save the current menu data
            expectedIncome: expectedIncome, // Save expected income
            totalIncome: totalIncome, // Save total income
        };

        // Ensure that the year, month, and day exist in the structure, and update or add the data
        if (!updatedAmountData[currentYear]) {
            updatedAmountData[currentYear] = {};
        }
        if (!updatedAmountData[currentYear][currentMonth]) {
            updatedAmountData[currentYear][currentMonth] = {};
        }

        // Update the data for the current day (use the existing data if present, otherwise update with new data)
        updatedAmountData[currentYear][currentMonth][currentDay] = {
            ...updatedAmountData[currentYear][currentMonth][currentDay], // Preserve existing data
            ...dayData, // Update with the current data
        };

        // Update the state with the new amountData
        setAmountData(updatedAmountData);

        // Save the updated amountData to localStorage
        localStorage.setItem('amountData', JSON.stringify(updatedAmountData));
        toast.success('Data successfully added', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
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
                            {menuData.map((row: any, index: any) => (
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
                                    <th className="text-start px-4 py-2 border border-primary">Account Name</th>
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
                                    <th className="text-end px-4 py-2 border border-gray-300">{totalDiff}</th>
                                </tr>
                            </tbody>
                        </table>
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
