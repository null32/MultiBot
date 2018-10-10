import fetch from "node-fetch";
import mime from "mime";
import { execFileSync, execFile, spawnSync } from "child_process";
/**
  * Converts ms to human readable format
  * eg: 1 year, 4 monthes, 5 minutes
  * @param val Milliseconds amount
  */
function TimeSpan(val: number): string {
    let temp = 0;
    if ((temp = parseInt(`${val / 1000}`)) < 5) {
        return 'a few seconds';
    }
    if ((val = parseInt(`${temp / 60}`)) < 1) {
        return `${temp} second${temp > 1 ? 's' : ''}`;
    }
    if ((temp = parseInt(`${val / 60}`)) < 1) {
        return `${val} minute${val > 1 ? 's' : ''}`;
    }
    if ((val = parseInt(`${temp / 24}`)) < 1) {
        return `${temp} hour${temp > 1 ? 's' : ''}`;
    }
    if ((temp = parseInt(`${val / 30}`)) < 1) {
        return `${val} day${val > 1 ? 's' : ''}`;
    }
    if ((val = parseInt(`${temp / 12}`)) < 1) {
        return `${temp} month${temp > 1 ? 'es' : ''}`;
    }
    return `${val} year${val > 1 ? 's' : ''}`;
}

/**
 * Get the difference between two Dates
 * eg: 1 year, 4 monthes, 5 minutes
 * @param date Date to convert
 */
function DateSub(date: Date): string {
    return TimeSpan(new Date().getTime() - date.getTime());
}

/**
 * Convert bytes to human readable
 * @param sz Amount of bytes
 */
function BytesToHuman(sz: number): string {
    let temp = 0;
    if ((temp = sz / 1024) < 1) {
        return `${sz.toFixed(2)} B`;
    }
    if ((sz = temp / 1024) < 1) {
        return `${temp.toFixed(2)} KB`;
    }
    if ((temp = sz / 1024) < 1) {
        return `${sz.toFixed(2)} MB`;
    }
    if ((sz = temp / 1024) < 1) {
        return `${temp.toFixed(2)} GB`;
    }
    return `${sz.toFixed(2)} TB`;
}

/**
 * Converts seconds to human readable format
 * @param secs Amount of seconds
 */
function SecsToHuman(secs: number): string {
    if (secs < 3600) {
        return `${parseInt(`${secs / 60}`).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
    }
    return `${parseInt(`${secs / 3600}`)}:${SecsToHuman(secs % 3600)}`;
}

/**
 * Gets mime, size and extention of file via URL
 * @param url Url of the file
 */
async function GetWebFileInfo(url: string): Promise<FileInfo> {
    return fetch(url, {
        method: 'HEAD'
    }).then(resp => {
        let m = resp.headers.get('Content-Type')!;
        let ext = mime.getExtension(m);
        let sz = parseInt(resp.headers.get('Content-Size')!);
        return {
            mime: m,
            ext: ext,
            size: sz,
        }
    });
}

let ffmpegCmd: string | undefined = undefined;

/**
 * Gets Artist, Title and Duration of local audio file
 * @param path Audio file path
 */
async function GetAudioInfo(path: string): Promise<AudioInfo> {
    if (!ffmpegCmd) {
        for (const command of ['ffmpeg', 'avconv', './ffmpeg', './avconv', 'ffmpeg.exe', './ffmpeg.exe']) {
            if (!spawnSync(command, ['-h']).error) ffmpegCmd = command;
        }
        if (!ffmpegCmd) {
            throw new Error('ffmpeg binary not found')
        }
    }

    return new Promise<AudioInfo>((resolve, reject) => {
        execFile(ffmpegCmd!, ['-i', path], (err, stdout, stderr) => {
            //ffmpeg throws error bcos no output specified
            //so error are ignored
            //probably should be refactored
            let durRaw = /Duration: [0-9\:]{8}/.exec(stderr);
            let duration = 0;
            if (durRaw) {
                let tokens = durRaw[0].split(' ')[1].split(':');
                for (const item of tokens) {
                    duration *= 60;
                    duration += parseInt(item);
                }
            }
            let artistRaw = /ARTIST[^\n]*/.exec(stderr);
            let artist = 'Unknown';
            if (artistRaw) {
                artist = artistRaw![0].split(':').slice(1).join(':').trim();
            }
            let titleRaw = /TITLE[^\n]*/.exec(stderr);
            let title = 'Unknown'
            if (titleRaw) {
                title = titleRaw![0].split(':').slice(1).join(':').trim();
            }

            resolve({
                duration: duration,
                artist: artist,
                title: title
            });
        });
    })
}

type FileInfo = {
    ext: string | null,
    mime: string,
    size: number
}

type AudioInfo = {
    duration: number,
    artist: string,
    title: string,
}

export {
    FileInfo,
    AudioInfo,

    TimeSpan,
    DateSub,
    BytesToHuman,
    SecsToHuman,
    GetWebFileInfo,
    GetAudioInfo
}
