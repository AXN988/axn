'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Box, MenuItem, Select, FormControl, SelectChangeEvent } from '@mui/material';
import { AmountData } from '@/model/menuItems';

interface DateSelectorProps {
    amountData: AmountData;
    onSetAmountData: (year: string, month: string, date: string) => void;
    onSetNullAmountData: (year: string, month: string, date: string,data: any) => void;
}
const DateSelector: React.FC<DateSelectorProps> = ({ amountData, onSetAmountData,onSetNullAmountData }) => {
    const currentDate = new Date(); // Get the current date

    const currentYear = currentDate.getFullYear(); // Get the current year
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current date (day of the month)
    const pastYears = Array.from({ length: 6 }, (_, i) => currentYear - i); // List current year and 5 previous years

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]; // Full month names

    const [year, setYear] = useState<number>(currentYear); // Default to current year
    const [month, setMonth] = useState<number>(currentMonth + 1); // Default to current month (1-based)
    const [date, setDate] = useState<number>(currentDay); // Default to current day

    const daysContainerRef = useRef<HTMLDivElement | null>(null); // Ref for days container

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setYear(event.target.value as number);
        const monthKey = months[month - 1];
        onSetNullAmountData(event.target.value.toString(), monthKey, date.toString(),{});
    };

    const handleMonthChange = (event: SelectChangeEvent<number>) => {
        setMonth(event.target.value as number);
        setDate(1); // Reset date to 1 when month changes
        const monthKey = months[(event.target.value as number) - 1];
        onSetNullAmountData(year.toString(), monthKey, date.toString(),{});
    };

    const handleDayClick = (day: number) => {
        setDate(day); // Update selected date when a day is clicked
        const monthKey = months[month - 1];
        onSetNullAmountData(year.toString(), monthKey, day.toString(),{});
    };

    const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the selected month

    // Generate a list of days and their corresponding weekdays for the current month
    const daysWithWeekdays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, month - 1, day);
        const weekday = dateObj.toLocaleString('en-us', { weekday: 'short' }); // Get the abbreviated weekday (3-letter)
        return { day, weekday };
    });

    // Scroll to the current date when the component is mounted
    useEffect(() => {
        if (daysContainerRef.current) {
            const currentDayElement = daysContainerRef.current.querySelector(
                `.day-${currentDay}`
            ) as HTMLElement;

            if (currentDayElement) {
                currentDayElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center', // Scroll to the center of the container
                });
            }
        }
    }, [year, month]); // Trigger the effect when the year or month changes

    useEffect(() => {
        const updatedAmountData = { ...amountData };

        // Ensure Year, Month, and Day data exists in AmountData
        const yearKey = year.toString();
        if (!updatedAmountData[yearKey]) {
            updatedAmountData[yearKey] = {};
        }

        const monthKey = months[month - 1]; // Get the full month name
        if (!updatedAmountData[yearKey][monthKey]) {
            updatedAmountData[yearKey][monthKey] = {};
        }

        // Add data for each day in the month
        const dayKey = date.toString(); // Use day as string for the key
        updatedAmountData[yearKey][monthKey][dayKey] = {
            menuList: [], // Initialize an empty list for the menu items
            expectedIncome: 0, // Set a default expected income (you can modify it based on your logic)
            totalIncome: 0, // Set a default total income (you can modify it based on your logic)
        };

        onSetAmountData(year.toString(), monthKey, date.toString()); // Update the state with the new amountData
    }, [year, month, date]); // Trigger the effect when year, month, or date changes

    return (
        <Box className="px-4 lg:px-4 shadow-md rounded-b-lg">
            <Box className="flex flex-col lg:flex-row overflow-x-auto justify-evenly">
                <div className="flex space-x-4 py-4">
                    {/* Month Dropdown */}
                    <FormControl variant="outlined" className="w-[180px] focus:outline-none focus:ring-2 focus:ring-primary">
                        <Select value={month} onChange={handleMonthChange}>
                            {months.map((monthName, index) => (
                                <MenuItem key={monthName} value={index + 1}>
                                    {monthName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Year Dropdown */}
                    <FormControl variant="outlined" className="w-[100px] focus:outline-none focus:ring-2 focus:ring-primary">
                        <Select value={year} onChange={handleYearChange}>
                            {pastYears.map((yearOption) => (
                                <MenuItem key={yearOption} value={yearOption}>
                                    {yearOption}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                {/* Divider */}
                <div className="bg-gray-200 lg:ml-6 w-1 h-24 hidden lg:block"></div>

                {/* Scrollable Date and Day List */}
                <div className="overflow-x-auto lg:ml-6 py-4" ref={daysContainerRef}>
                    <div className="flex items-center space-x-4">
                        {daysWithWeekdays.map(({ day, weekday }) => (
                            <div
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`day-${day} flex flex-col items-center px-6 py-[7px] m-1 rounded ${day === date ? 'bg-primary text-white' : 'bg-white'}`}
                                style={{ boxShadow: "0px 0px 6px gray" }}
                            >
                                <div className="text-base font-semibold">{day}</div>
                                <div className="text-xs">{weekday}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Box>
        </Box>
    );
};

export default DateSelector;
