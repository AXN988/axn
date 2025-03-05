import { ref, onValue as getFirebaseData, Query, Unsubscribe, set } from "firebase/database";
import { database } from "../utils/firebase";
import { DayData, MenuItem } from "@/model/menuItems";

type CallbackFunction<T> = (data: T | null) => void;

export class FirebaseServices {
    static shared: FirebaseServices = new FirebaseServices();

    getMenu(callBack: CallbackFunction<MenuItem[]>): Unsubscribe {
        const completedTasksRef: Query = ref(database, `menu`);
        return getFirebaseData(completedTasksRef, (snapshot) => {
            if (snapshot.exists()) {
                callBack(snapshot.val() as MenuItem[]);
            } else {
                callBack(null);
            }
        }, (error) => {
            console.error("Error fetching data: ", error);
            callBack(null);
        });
    }

    async setAmountData(year: string, month: string, date: string,data: DayData, callback?: (status: string) => void): Promise<void> {
        const updateMenu = ref(database, `amountData/${year}/${month}/${date}`);
        try {
            await set(updateMenu, JSON.parse(JSON.stringify(data)));
            if (callback) callback("done");
        } catch (error) {
            console.error(error);
            if (callback) callback("error");
        }
    }

    getAmountData(year: string, month: string, date: string, callBack: CallbackFunction<DayData>): Unsubscribe {
        const completedTasksRef: Query = ref(database, `amountData/${year}/${month}/${date}`);
        return getFirebaseData(completedTasksRef, (snapshot) => {
            if (snapshot.exists()) {
                callBack(snapshot.val() as DayData);
            } else {
                callBack(null);
            }
        }, (error) => {
            console.error("Error fetching data: ", error);
            callBack(null);
        });
    }
}