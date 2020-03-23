import GalleryDriver from '../../drivers/pptrDriver';
import {toMatchImageSnapshot} from '../../drivers/matchers';
import GALLERY_CONSTS from '../../../src/common/constants';

jest.setTimeout(30000);

expect.extend({ toMatchImageSnapshot });

describe('textBoxHeight - e2e', () => {
  let driver;

  beforeEach(async () => {
    driver = new GalleryDriver();
    await driver.launchBrowser();
  });

  afterEach(() => {
    driver.closeBrowser();
  });
  it('should set manual textBoxHeight', async () => {
    await driver.openPage({
      galleryLayout:  GALLERY_CONSTS.LAYOUTS.GRID,
      titlePlacement: GALLERY_CONSTS.PLACEMENTS.SHOW_BELOW,
      allowTitle: true,
      calculateTextBoxHeightMode: GALLERY_CONSTS.TEXT_BOX_HEIGHT_CALCULATION_OPTIONS.MANUAL,
      textBoxHeight: 300,
    });
    await driver.waitFor.hookToBeVisible('item-container');
    await driver.waitFor.timer(200);
    const page = await driver.grab.elemScreenshot('#pro-gallery-container');
    expect(page).toMatchImageSnapshot();
  });
  it('should set automatic textBoxHeight', async () => {
    await driver.openPage({
      galleryLayout:  GALLERY_CONSTS.LAYOUTS.GRID,
      titlePlacement: GALLERY_CONSTS.PLACEMENTS.SHOW_BELOW,
      allowTitle: true,
      calculateTextBoxHeightMode: GALLERY_CONSTS.TEXT_BOX_HEIGHT_CALCULATION_OPTIONS.AUTOMATIC,
      textBoxHeight: 250,
    });
    await driver.waitFor.hookToBeVisible('item-container');
    await driver.waitFor.timer(200);
    const page = await driver.grab.elemScreenshot('#pro-gallery-container');
    expect(page).toMatchImageSnapshot();
  });
});
