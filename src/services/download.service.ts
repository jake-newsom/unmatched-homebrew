import { Http, HttpDownloadFileResult } from "@capacitor-community/http";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem"
import CardApiService from "./cardapi.service";

/**
 * Really only necessary for Android. 
 * 
 * iOS user's are more familiar with using the "share" option and choosing "Save to Files" from that 
 * action sheet, so whereever we provide the download icon we'll switch it with the share capability 
 * on iOS. 
 * 
 * For that reason, the download service just triggers the Android Download Manager package
 */
const DownloadService = {

    async fileExists(filename: string): Promise<boolean>{
        try {
            const ret = await Filesystem.readdir({
                path: "/",
                directory: Directory.Data
            });

            return ret.files.includes(filename);
        }
        catch(err){
            console.log("unable to read dir: ", err);
        }

        return false;
    },

    async loadCardImages(id: string): Promise<string>{
        if(!Capacitor.isNativePlatform()){
            return CardApiService.cardImagesBaseURL(id);
        }
        try {
            const ret = await Filesystem.getUri({
                path:"/" + id + ".png",
                directory: Directory.Data
            });
            return ret.uri;
        }
        catch(err){
            console.log("unable to read file", err);
        }
        return "";
    },

    async startDownload(url: string, filename?: string): Promise<HttpDownloadFileResult>{
        if(!Capacitor.isNativePlatform()){
            Promise.resolve();
        }
        /**
         * If no filename was provided, parse it from the URL.
         */
        if(filename === undefined){
            filename = this.getFileNameFromUrl(url);
        }

        
        const options = {
            url: url,
            filePath: filename,
            fileDirectory: Directory.Data,
            method: 'GET'
        };

        
        const dl = await Http.downloadFile(options);
        return dl;
    },

    /**
     * Takes a URL and gets the character following the last '/' then 
     * removes any potential query string and returns just the filename. 
     * 
     * @param url 
     * @returns 
     */
    getFileNameFromUrl(url: string): string{
        const f = url.substring(url.lastIndexOf("/")+1);
        return f.split("?")[0];
    },

}


export default DownloadService;