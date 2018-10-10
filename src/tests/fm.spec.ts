import 'mocha';
import FileManager from '../fileManager';
import { CACHE_PATH, CACHE_URL } from '../constants';
import { expect } from 'chai';
import CachedFile from '../cachedFile';

describe('File manager', async () => {
    const testFile = 'https://skycolor.space/lol.png';
    const fm = new FileManager(CACHE_PATH, CACHE_URL);
    let dbSize: number;
    let cached: CachedFile;

    it('Should delete file if exists', async () => {
        let temp = await fm.FindFile(testFile);
        if (temp) {
            await fm.RemoveFile(temp);
        }
    });

    it('Should get db size', async () => {
        dbSize = (await fm.DBGetFiles()).length;
    });

    it('Should cache a file', async () => {
        cached = await fm.DownloadFile(testFile, 'png', 360);
        let file = (await fm.FindFile(cached.OriginalUrl))!;
        expect(file).to.deep.equal(cached);
    });

    it('Should increase db size', async () => {
        let temp = (await fm.DBGetFiles()).length;
        expect(temp).to.equal(dbSize + 1);
    });

    it('Shouldn\'t cache it again', async () => {
        let temp = await fm.DownloadFile(testFile, 'png', 360);
        expect(temp).to.deep.equal(cached);
        let sz = (await fm.DBGetFiles()).length;
        expect(sz).to.equal(dbSize + 1);
    });

    it('Should remove file from cache', async () => {
        await fm.RemoveFile(cached);
        let sz = (await fm.DBGetFiles()).length;
        expect(sz).to.equal(dbSize);
        let temp = await fm.FindFile(testFile);
        expect(temp).to.equal(null);
    });
    
});