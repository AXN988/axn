import { ref, onValue as getFirebaseData, Query, Unsubscribe, set } from "firebase/database";
import { database } from "../utils/firebase";
import { AmountData } from "@/model/menuItems";

export class FirebaseServices {
    static shared: FirebaseServices = new FirebaseServices();

    getMenu(callBack: Function): Unsubscribe {
        const completedTasksRef: Query = ref(database, `menu`);
        return getFirebaseData(completedTasksRef, (snapshot) => {
            if (snapshot.exists()) {
                callBack(snapshot.val());
            } else {
                callBack(null);
            }
        }, (error) => {
            console.error("Error fetching data: ", error);
            callBack(null);
        });
    }

    async setAmountData(data: AmountData, callback?: (ele: string) => void) {
        const updateMenu = await ref(database, `amountData`);
        await set(updateMenu, JSON.parse(JSON.stringify(data))).then(() => {
            callback && callback("done")
        }).catch((error) => {
            console.error(error);
            callback && callback("error")
        });
    }

    getAmountData(year: string, month: string, date: string, callBack: Function): Unsubscribe {
        const completedTasksRef: Query = ref(database, `amountData/${year}/${month}/${date}`);
        return getFirebaseData(completedTasksRef, (snapshot) => {
            if (snapshot.exists()) {
                callBack(snapshot.val());
            } else {
                callBack(null);
            }
        }, (error) => {
            console.error("Error fetching data: ", error);
            callBack(null);
        });
    }
}