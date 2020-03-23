import GalleryDriver from '../../drivers/pptrDriver';
import {toMatchImageSnapshot} from '../../drivers/matchers';
import GALLERY_CONSTS from '../../../src/common/constants';

jest.setTimeout(30000);

expect.extend({ toMatchImageSnapshot });

describe('gridStyle - e2e', () => {
  let driver;

  beforeEach(async () => {
    driver = new GalleryDriver();
    await driver.launchBrowser();
  });

  afterEach(() => {
    driver.closeBrowser();
  });
  it('should set number of columns according to container size (not numberOfImagesPerRow)', async () => {
    await driver.openPage({
      galleryLayout: GALLERY_CONSTS.LAYOUTS.GRID,
      gridStyle: GALLERY_CONSTS.GRID_STYLE.FIT_TO_SCREEN,
      numberOfImagesPerRow:2,
    });
    await driver.waitFor.hookToBeVisible('item-container');
    const page = await driver.grab.elemScreenshot('.pro-gallery');
    expect(page).toMatchImageSnapshot();
  });
  it('should set fixed number of columns (numberOfImagesPerRow)', async () => {
    await driver.openPage({
      galleryLayout: GALLERY_CONSTS.LAYOUTS.GRID,
      gridStyle: GALLERY_CONSTS.GRID_STYLE.SET_ITEMS_PER_ROW,
      numberOfImagesPerRow:2,
    });
    await driver.waitFor.hookToBeVisible('item-container');
    const page = await driver.grab.elemScreenshot('.pro-gallery');
    expect(page).toMatchImageSnapshot();
  });
});
