export interface MenuItem {
    id: number;
    name: string;
    price: number;
    kg: number | null;
    totalAmount: number | null;
}

export interface DayData {
    menuList: MenuItem[] | null;
    expectedIncome: number | null;
    totalIncome: number | null;
}

export interface MonthData {
    [day: string]: DayData;
}

export interface YearData {
    [month: string]: MonthData;
}

export interface AmountData {
    [year: string]: YearData;
}
