import axios, {AxiosRequestConfig} from "axios";
import DownloadService from "@/services/download.service";

const proxy = "https://api.codetabs.com/v1/proxy";
const host = "https://unmatched.cards/api/";

const CardApiService = {
    cardImagesBaseURL(id: string, cache?: number){
        let url = "https://unmatched.cards/api/card_img/" + id + "?width=400&columns=1&duplicates=false&characters=true&rules=true&cardback=true";
        if(cache != undefined){
            url += "&cache=" + cache;
        }

        return url;
    },

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

    async getDeck(id: string){
        const response: any = await this.get("decks/" + id);
        const deck = response.data;
        console.log("Parse data: ", deck);

        /** start downloading card images */
        this.downloadCardImages(id);

        const character = {
            id: deck.version_id,
            name: deck.deck_data.hero.name,
            health: deck.deck_data.hero.hp,
            isRanged: deck.deck_data.hero.isRanged,
            move: deck.deck_data.hero.move,
            special: deck.deck_data.hero.specialAbility,
            color: deck.deck_data.appearance.highlightColour,
            cardback: deck.deck_data.appearance.cardbackUrl,
            extraCharacters: [] as any,
            sidekick: {} as any,
            cards: [] as any,
            ruleCards: [] as any,
            dateAdded: Date.parse(deck.updated_on)
        };

        
        for(const e in deck.deck_data.extraCharacters){
            const char = {} as any;
            char.name = deck.deck_data.extraCharacters[e].hero.name;
            char.health = deck.deck_data.extraCharacters[e].hero.hp;
            character.extraCharacters.push(char);
        }

        
        if(deck.deck_data.sidekick.quantity > 0){
            character.sidekick = {
                name: deck.deck_data.sidekick.name,
                health: deck.deck_data.sidekick.hp || 1,
                quantity: deck.deck_data.sidekick.quantity,
                isRanged: deck.deck_data.sidekick.isRanged || false
            };
        }

        
        if(deck.deck_data.ruleCards != undefined && deck.deck_data.ruleCards.length > 0){
            character.ruleCards = deck.deck_data.ruleCards;
        }

        character.cards = deck.deck_data.cards;  



        return character;
    },

    async downloadCardImages(id: string){
        const url = this.cardImagesBaseURL(id);
        console.log("Download images from " + url);
        DownloadService.startDownload(url, id + ".png");
    }


}

export default CardApiService;