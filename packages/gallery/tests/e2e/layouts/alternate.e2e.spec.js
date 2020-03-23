import GalleryDriver from '../../drivers/pptrDriver';
import {toMatchImageSnapshot} from '../../drivers/matchers';
import GALLERY_CONSTS from '../../../src/common/constants';

jest.setTimeout(30000);

expect.extend({ toMatchImageSnapshot });

describe('alternate - e2e', () => {
  let driver;

  beforeEach(async () => {
    driver = new GalleryDriver();
    await driver.launchBrowser();
  });

  afterEach(() => {
    driver.closeBrowser();
  });
  it('alternate layout - scrollDirection = vertical', async () => {
    await driver.openPage({
      galleryLayout: GALLERY_CONSTS.LAYOUTS.ALTERNATE,
      scrollDirection: GALLERY_CONSTS.SCROLL_DIRECTION.VERTICAL
    });
    await driver.waitFor.hookToBeVisible('item-container');
    await driver.waitFor.timer(200);
    const page = await driver.grab.elemScreenshot('#pro-gallery-container');
    expect(page).toMatchImageSnapshot();
  });
  it('alternate layout - scrollDirection = horizontal', async () => {
    await driver.openPage({
      galleryLayout: GALLERY_CONSTS.LAYOUTS.ALTERNATE,
      scrollDirection: GALLERY_CONSTS.SCROLL_DIRECTION.HORIZONTAL
    });
    await driver.waitFor.hookToBeVisible('item-container');
    await driver.waitFor.timer(200);
    const page = await driver.grab.elemScreenshot('#pro-gallery-container');
    expect(page).toMatchImageSnapshot();
  });
});
