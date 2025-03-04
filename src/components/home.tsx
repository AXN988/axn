'use client'

import { useEffect, useState } from "react";
import DateSelector from "./dateSelector";
import Navbar from "./navbar";
import TableSection from "./tableSection";
import { useRouter } from "next/navigation";
import { AmountData, DayData, MenuItem } from "@/model/menuItems";
import { FirebaseServices } from "@/services/firebase-services";

const HomePage: React.FC = () => {
    const router = useRouter();
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [amountData, setAmountData] = useState<AmountData>({});
    const [dayData, setDayData] = useState<DayData>();
    useEffect(() => {
        const isLogin = localStorage.getItem('login');
        if (!(isLogin == 'done')) {
            router.replace('/');
        }
    }, [])

    const apiCallBack = (year: string, month: string, date: string) => {
        FirebaseServices.shared.getAmountData(year, month, date, (dateData: any) => {
            setDayData(dateData);
            setAmountData((prevAmountData) => ({
                ...prevAmountData,
                [year]: {
                    ...prevAmountData[year],
                    [month]: {
                        ...prevAmountData[year]?.[month],
                        [date]: dateData,
                    },
                },
            }));
        });
        if (menu.length == 0) {
            FirebaseServices.shared.getMenu(setMenu);
        }
    }

    return <div className="">
        <Navbar />
        <DateSelector amountData={amountData} onSetAmountData={(year, month, date) => { apiCallBack(year, month, date); }} onSetNullAmountData={(year, month, date, data: any) => {
            setAmountData(data);
            apiCallBack(year, month, date);
        }} />
        <TableSection menu={menu} firebaseAmountData={amountData} addedMenu={dayData?.menuList ?? []} addedExpectedIncome={dayData?.expectedIncome ?? 0} addedTotalIncome={dayData?.totalIncome ?? 0} />
    </div>
}

export default HomePage;
