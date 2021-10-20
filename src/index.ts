/* eslint-disable  @typescript-eslint/no-shadowed-variable */
/* eslint-disable  @typescript-eslint/no-console */

import puppeteer from 'puppeteer-core'
import * as fs from 'fs'

interface ItemInterface {
    photo: string,
    postedTime: string,
    price: string,
    title: string,
    society: string[],
    summary: string[],
    usp: string[],
    description: string,
    extraInformation : string[]
}

function extractItems():ItemInterface[] {
 
  function getCollectionElements(elements: NodeListOf<HTMLDivElement>):string[]{
    const collection: string[] = []
    for(const node of elements){
      collection.push(node.innerText)
    }
    return collection
  }

      const extractedElements  = document.querySelectorAll('div.SRCard');
      const items : ItemInterface[] = [];
      for (const element of extractedElements) {
        const cardItem: ItemInterface = {
          photo: (element.querySelector('.m-photo__img') as HTMLImageElement).src,
          postedTime: (element.querySelector('.pull-right') as HTMLDivElement).innerText,
          price: (element.querySelector('.m-srp-card__price') as HTMLDivElement).innerText,
          title:(element.querySelector('.m-srp-card__title') as HTMLDivElement).innerText,
          society: getCollectionElements(element.querySelectorAll('.m-srp-card__society')),
          usp: getCollectionElements(element.querySelectorAll('.m-srp-card__usp')),
          description: (element.querySelector('.m-srp-card__description') as HTMLDivElement).innerText,
          summary : getCollectionElements(element.querySelectorAll('.m-srp-card__summary__item')),
          extraInformation : getCollectionElements(element.querySelectorAll('.m-srp-card__tuple__item'))
        }
        items.push(cardItem);
      }
      return items;
    }

    async function scrapeItems(
      page: puppeteer.Page,
      extractItems : () => ItemInterface[],
      itemCount : Number,
      scrollDelay = 800,
    ) {
      let items : ItemInterface[] = [];
      try {
        let previousHeight;
        while (items.length < itemCount) {
          items = await page.evaluate(extractItems);
          previousHeight = await page.evaluate('document.body.scrollHeight');
          await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
          await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
          await page.waitForTimeout(scrollDelay);
        }
      } catch(e) { console.log(e) }
      return items;
    }


    (async () => {
      // Set up Chromium browser and page.
      const browser =  await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
      const page = await browser.newPage();
      page.setViewport({ width: 1280, height: 926 });

      await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36')
      
      // Navigate to the example page.
      await page.goto('https://www.magicbricks.com/property-for-rent/residential-real-estate?bedroom=2&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Service-Apartment&cityName=Mumbai',{"waitUntil" : "networkidle0"});

      const items: ItemInterface[] = await scrapeItems(page, extractItems, 50);

      fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err)=>{
        if(err){console.log(err)}
        else{console.log('Saved Successfully!')}
      })

      // Close the browser.
      await browser.close();
    })();