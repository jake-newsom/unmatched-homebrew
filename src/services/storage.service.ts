import { Drivers, Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';


const StorageService = {
    localStorage: new Storage({
        name: '__mydb',
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),

    init() {
        this.localStorage.create();
    },

    async get(index: string){
        return await this.localStorage.get(index);
    },

    async set(index: string, value: any){
        return await this.localStorage.set(index,value);
    },

    async remove(index: string){
        return await this.localStorage.remove(index);
    }
}


export default StorageService;