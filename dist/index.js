"use strict";
/* eslint-disable  @typescript-eslint/no-shadowed-variable */
/* eslint-disable  @typescript-eslint/no-console */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = __importStar(require("puppeteer-core"));
const fs = __importStar(require("fs"));
function getAllSummaries(elements) {
    const summaries = [];
    for (const node of elements) {
        summaries.push(node.innerText);
    }
    return summaries;
}
function getExtraInformation(elements) {
    const information = [];
    for (const node of elements) {
        information.push(node.innerText);
    }
    return information;
}
function extractItems() {
    const extractedElements = document.querySelectorAll('div.SRListing > div.SRCard');
    const items = [];
    for (const element of extractedElements) {
        const cardItem = {
            photo: element.querySelector('.m-photo__img').src,
            postedTime: element.querySelector('div.m-srp__post-date').innerText,
            price: element.querySelector('div.m-srp-card__price').innerText,
            title: element.querySelector('div.m-srp-card__title').innerText,
            society: element.querySelector('div.m-srp-card__society').innerText,
            usp: element.querySelector('div.m-srp-card__usp').innerText,
            description: element.querySelector('div.m-srp-card__description').innerText,
            summary: getAllSummaries(element.querySelectorAll('div.m-srp-card__summary__item')),
            extraInformation: getExtraInformation(element.querySelectorAll('div.m-srp-card__tuple__item'))
        };
        items.push(cardItem);
    }
    return items;
}
function scrapeItems(page, extractItems, itemCount = 11621, scrollDelay = 800) {
    return __awaiter(this, void 0, void 0, function* () {
        let items = [];
        try {
            let previousHeight;
            while (items.length < itemCount) {
                items = yield page.evaluate(extractItems);
                previousHeight = yield page.evaluate('document.body.scrollHeight');
                yield page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                yield page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
                yield page.waitForTimeout(scrollDelay);
            }
        }
        catch (e) {
            console.log(e);
        }
        return items;
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Set up Chromium browser and page.
    const browser = yield puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    const page = yield browser.newPage();
    page.setViewport({ width: 1280, height: 926 });
    // Navigate to the example page.
    yield page.goto('https://www.magicbricks.com/property-for-rent/residential-real-estate?bedroom=2&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Service-Apartment&cityName=Mumbai');
    // Auto-scroll and extract desired items from the page. Currently set to extract ten items.
    const items = yield scrapeItems(page, extractItems, 10);
    // Save extracted items to a new file.
    // fs.writeFileSync('./items.txt', items.join('\n') + '\n');
    fs.writeFileSync('./items.json', JSON.stringify(items, null, 2), (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Saved Successfully!');
        }
    });
    // Close the browser.
    yield browser.close();
}))();
//# sourceMappingURL=index.js.map