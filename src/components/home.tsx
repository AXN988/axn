'use client'

import { useEffect } from "react";
import DateSelector from "./dateSelector";
import Navbar from "./navbar";
import TableSection from "./tableSection";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
    const router = useRouter();
    useEffect(() => {
        const isLogin = localStorage.getItem('login');
        if (!(isLogin == 'done')) {
            router.replace('/');
        }
    }, [])
    return <div className="">
        <Navbar />
        <DateSelector />
        <TableSection />
    </div>
}

export default HomePage;
