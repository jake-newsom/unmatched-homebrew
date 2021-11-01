import axios, {AxiosRequestConfig} from "axios";

const proxy = "https://api.codetabs.com/v1/proxy";
const host = "https://unmatched.cards/api/";

const CardApiService = {

    // init(baseURL: string | undefined) {
    //     axios.defaults.baseURL = host;
    // },

    // setHeader(key: string) {
    //     axios.defaults.headers.common["Authorization"] = "Basic " + btoa(":" + key);
    // }, 

    // removeHeader() {
    //     axios.defaults.headers.common = {};
    // },

    init() {
        axios.defaults.baseURL = proxy + "?quest=" + host;
    },

    get(resource: string) {
        return axios.get(resource);
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

    getDeck(id: string){
        return axios.get("decks/" + id);
    }
}

export default CardApiService;