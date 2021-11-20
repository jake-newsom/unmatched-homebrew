import axios, {AxiosRequestConfig} from "axios";
import DownloadService from "@/services/download.service";
import { Capacitor } from "@capacitor/core";

const proxy = "https://aws.mykcm.com/p.php";
const host = "https://unmatched.cards/api/";

const CardApiService = {
    version() { 
        return 1;
    },

    cardImagesBaseURL(id: string, cache?: number){
        let url = "https://unmatched.cards/api/card_img/" + id + "?width=400&columns=1&duplicates=false&characters=true&rules=true&cardback=true";
        if(cache != undefined){
            url += "&cache=" + cache;
        }

        return url;
    },

    init() {
        axios.defaults.baseURL = proxy + "?url=" + host;
    },

    get(resource: string) {

        console.log(axios.defaults.baseURL + encodeURIComponent(resource));
        return axios.get(encodeURIComponent(resource));
    },

    post(resource: string, data: any) {
        return axios.post(resource, data);
    },

    put(resource: string, data: any) {
        return axios.put(resource, data);
    },

    delete(resource: string) {
        return axios.delete(resource);
    },

    customRequest(data: AxiosRequestConfig) {
        return axios(data);
    },

    async getDeck(id: string){
        const response: any = await this.get("decks/" + id);
        const deck = response.data;

        if(Capacitor.isNativePlatform()){
            await this.downloadCardImages(id);
        }

        const character = {
            id: deck.version_id,
            version: this.version(),
            ...deck.deck_data
        };

        return character;
    },


    async searchDecks(query: string){
        const response: any = await this.get("decks?sortBy=likes&sortDesc=true&perPage=30&currentPage=1&filter=" + query);
        return response.data.decks;
    },


    async downloadCardImages(id: string){
        const url = this.cardImagesBaseURL(id);
        console.log("start downloading cards for " + id);
        const data = await DownloadService.startDownload(url, id + ".png");
        console.log("finished downloading cards for " + id);
    }


}

export default CardApiService;