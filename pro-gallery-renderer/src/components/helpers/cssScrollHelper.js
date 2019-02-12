import Consts from 'photography-client-lib/dist/src/utils/consts';
import utils from '../../utils/index.js';
import window from 'photography-client-lib/dist/src/sdk/windowWrapper';
import experiments from 'photography-client-lib/dist/src/sdk/experimentsWrapper';

/*
    TODO:
    - handle horizontal scroll
    - check Layout creation and do not recreate exisiting layouts
*/


class CssScrollHelper {

  constructor() {
    this.pgScrollSteps = [10240, 5120, 2560, 1280, 640, 320, 160, 80, 40, 20, 10];
    this.pgScrollClassName = 'pgscl';

    this.screenSize = Math.max(window.screen.width, window.screen.height);

    this.scrollCss = [];
    this.scrollCssProps = [];
    this.calcScrollPaddings(false);
  }

  calcScrollPaddings(allowPreloading = true) {

    //padding: [belowScreen, aboveScreen]
    //padding: [above images, below image]
    this.allPagePadding = () => [Infinity, Infinity];
    this.inScreenPadding = () => [0, 0];
    this.aboveScreenPadding = () => [0, Infinity];
    this.justBelowScreenPadding = itemHeight => [5120, -1 * (itemHeight + this.screenSize)];
    this.justBelowAndInScreenPadding = () => [5120, 0];
    this.belowScreenPadding = () => [Infinity, 0];

    let highResPadding;
    let lowResPadding;
    const scrollPreloading = experiments('specs.pro-gallery.scrollPreloading');

    switch (scrollPreloading) {
      case '0':
        highResPadding = [0, 0];
        lowResPadding = [0, 0];
        break;
      case '20':
        highResPadding = [640, 2560];
        lowResPadding = [1280, 2560];
        break;
      case '40':
        highResPadding = [1280, 5120];
        lowResPadding = [2560, 5120];
        break;
      case '60':
        highResPadding = [2560, 10240];
        lowResPadding = [5120, 10240];
        break;
      default:
      case '80':
        highResPadding = [5120, Infinity];
        lowResPadding = [10240, Infinity];
        break;
      case '100':
        highResPadding = [Infinity, Infinity];
        lowResPadding = [Infinity, Infinity];
        break;
    }

    this.highResPadding = () => allowPreloading ? (highResPadding || [5120, Infinity]) : [0, 0];
    this.lowResPadding = () => allowPreloading ? (lowResPadding || [10240, Infinity]) : [0, 0];

  }

  getDomId({id}) {
    const shortId = String(id).replace(/[\W]+/g, '');
    return `pgi${shortId}`;
  }

  buildScrollClassName(galleryDomId, idx, val) {
    const shortId = String(galleryDomId).replace(/[\W]+/g, '').slice(-8);
    return `${this.pgScrollClassName}_${shortId}_${val}-${this.pgScrollSteps[idx] + Number(val)}`;
  }

  calcScrollClasses(galleryDomId, scrollTop) {
    return `${this.pgScrollClassName}-${scrollTop} ` + this.pgScrollSteps.map((step, idx) => this.buildScrollClassName(galleryDomId, idx, (Math.floor(scrollTop / step) * step))).join(' ');
  }

  calcScrollCss({galleryDomId, items, styleParams, allowPreloading}) {
    if (!(items && items.length)) {
      return '';
    }
    this.screenSize = styleParams.oneRow ? Math.min(window.innerWidth, window.screen.width) : Math.min(window.innerHeight, window.screen.height);
    this.calcScrollPaddings(allowPreloading);

    const [lastItem] = items.slice(-1);
    const {top, right} = lastItem.offset;
    const maxStep = this.pgScrollSteps[0];
    this.minHeight = 0 - maxStep;
    this.maxHeight = (Math.ceil(((styleParams.oneRow ? right : top) + this.screenSize) / maxStep) + 1) * maxStep;
    return items.map(item => this.calcScrollCssForItem({galleryDomId, item, styleParams})).join(`\n`);
  }

  shouldCalcScrollCss({id, idx, top, left, width, resizeWidth, maxWidth, height, resizeHeight, maxHeight, resized_url, type}, styleParams) {
    if (type === 'video' || type === 'text') {
      return false;
    }
    return true;
    // if (!this.scrollCss[idx]) {
    //   return true; //recalc as long as no css was created
    // }
    // const scrollCssProps = JSON.stringify({id, idx, top, left, width, resizeWidth, maxWidth, height, resizeHeight, maxHeight, resized_url, oneRow: styleParams.oneRow, loadingMode: styleParams.imageLoadingMode, isSSR: window.isSSR});
    // if (scrollCssProps === this.scrollCssProps[idx]) {
    //   return false;
    // }
    // this.scrollCssProps[idx] = scrollCssProps;
    // return true;
  }

  createScrollSelectorsFunction({galleryDomId, item, styleParams}) {
    const imageTop = styleParams.oneRow ? (item.offset.left - this.screenSize) : (item.offset.top - this.screenSize);
    const imageBottom = styleParams.oneRow ? (item.offset.left + item.width) : (item.offset.top + item.height);
    const minStep = this.pgScrollSteps[this.pgScrollSteps.length - 1];
    const ceil = (num, step) => Math.ceil(Math.min(this.maxHeight, num) / step) * step;
    const floor = (num, step) => Math.floor(Math.max(this.minHeight, num) / step) * step;
    const domId = this.getDomId(item);
    return (padding, suffix) => {
      const [before, after] = padding;
      if (before === Infinity && after === Infinity) {
        return `#${domId} ${suffix}`;
      }
      let from = floor(imageTop - before, minStep);
      const to = ceil(imageBottom + after, minStep);
      if (utils.isVerbose()) {
        console.log(`CSS SCROLL - item #${item.idx} display range is: (${from} - ${to})`);
      }
      const scrollClasses = [];
      while (from < to) {
        const largestDividerIdx = this.pgScrollSteps.findIndex(step => (from % step === 0 && from + step <= to)); //eslint-disable-line
        if (largestDividerIdx === -1) {
          console.error('largestDividerIdx is -1. Couldn\'t find index in pgScrollSteps array.\nfrom =', from, '\nto =', to, '\npadding[0] =', padding[0], '\npadding[1] =', padding[1]);
          break;
        }
        scrollClasses.push(`.${this.buildScrollClassName(galleryDomId, largestDividerIdx, from)} ~ div #${domId} ${suffix}`);
        from += this.pgScrollSteps[largestDividerIdx];
        // console.count('pgScroll class created');
      }
      return scrollClasses.join(', ');
    };
  }

  calcScrollCssForItem({galleryDomId, item, styleParams}) {

    const {resized_url, idx} = item;

    if (!this.shouldCalcScrollCss(item, styleParams)) {
      if (utils.isVerbose()) {
        console.log('CSS SCROLL - skipping css calc for item #' + idx, item, this.scrollCss[idx]);
      }
      return this.scrollCss[idx];
    }

    let scrollCss = '';

    const createScrollSelectors = this.createScrollSelectorsFunction({galleryDomId, item, styleParams});

    //load hi-res image + loading transition
    if (!window.isSSR && !item.isDimensionless) {
      scrollCss += createScrollSelectors(this.highResPadding(), `.image-item>canvas`) + `{opacity: 1; transition: opacity .4s linear; background-image: url(${resized_url.img})}`;
    }

    //add the blurry image
    if (!utils.deviceHasMemoryIssues() && styleParams.imageLoadingMode !== Consts.loadingMode.COLOR && (!item.isTransparent || window.isSSR) && !item.isDimensionless) {
      scrollCss += createScrollSelectors(this.lowResPadding(), `.image-item`) + `{background-image: url(${resized_url.thumb})}`;
    }

    //scrollAnimation [DEMO]
    scrollCss += this.createScrollAnimationsIfNeeded({idx, item, styleParams, createScrollSelectors});

    if (utils.isVerbose()) {
      console.log('CSS SCROLL - css calc for item #' + idx, item, this.scrollCss[idx]);
    }

    this.scrollCss[idx] = scrollCss || this.scrollCss[idx];

    return this.scrollCss[idx];
    // console.count('pgScroll item created');
  }

  createScrollAnimationsIfNeeded({idx, item, styleParams, createScrollSelectors}) {
    const scrollAnimation = styleParams.scrollAnimation;

    if ((!scrollAnimation) || scrollAnimation === Consts.scrollAnimations.NO_EFFECT) {
      return '';
    }

    const _animationTiming = (((idx % 3) + 1) * 100); //100 - 300

    const animationActivePadding = this.aboveScreenPadding();

    const animationProps = (animationName, animationDuration, animationProgression, animationTiming) => `${animationName} ${animationDuration}s ${animationProgression} ${animationTiming}ms 1 normal backwards running;`;

    let scrollAnimationCss = '';

    if (scrollAnimation === Consts.scrollAnimations.FADE_IN) {
      scrollAnimationCss += createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + `{animation: ${animationProps('scroll-animation-fade-in', 0.8, 'ease-in', _animationTiming)}}`;
    }

    if (scrollAnimation === Consts.scrollAnimations.GRAYSCALE) {
      scrollAnimationCss += createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + `{animation: ${animationProps('scroll-animation-grayscale', 0.6, 'ease-in', _animationTiming + 200)}}`;
    }

    if (scrollAnimation === Consts.scrollAnimations.SLIDE_UP) {
      scrollAnimationCss += createScrollSelectors(animationActivePadding, '') + `{animation: ${animationProps('scroll-animation-slide-up', 0.8, 'cubic-bezier(.13,.78,.53,.92)', 0)}}`;
    }

    if (scrollAnimation === Consts.scrollAnimations.EXPAND) {
      scrollAnimationCss += createScrollSelectors(animationActivePadding, '') + `{animation: ${animationProps('scroll-animation-expand', 0.8, 'cubic-bezier(.13,.78,.53,.92)', 0)}}`;
    }

    if (scrollAnimation === Consts.scrollAnimations.SHRINK) {

      scrollAnimationCss += createScrollSelectors(animationActivePadding, '') + `{animation: ${animationProps('scroll-animation-shrink', 0.8, 'cubic-bezier(.13,.78,.53,.92)', 0)}}`;
    }


    if (scrollAnimation === Consts.scrollAnimations.ZOOM_OUT) {
      scrollAnimationCss += createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + `{animation: ${animationProps('scroll-animation-zoom-out', 0.8, 'cubic-bezier(.13,.78,.53,.92)', 0)}}`;
    }

    if (scrollAnimation === Consts.scrollAnimations.ONE_COLOR) {
      const oneColorAnimationColor = styleParams.oneColorAnimationColor && styleParams.oneColorAnimationColor.value ? styleParams.oneColorAnimationColor.value : 'transparent';

      scrollAnimationCss += createScrollSelectors(animationActivePadding, '') + `{background-color: ${oneColorAnimationColor};}`;
      scrollAnimationCss += createScrollSelectors(animationActivePadding, ' .gallery-item-wrapper') + `{animation: ${animationProps('scroll-animation-fade-in', 0.6, 'ease-in', _animationTiming)}}`;
    }

    return scrollAnimationCss;
  }
}

export const cssScrollHelper = new CssScrollHelper();


  // Testing the best combination of scroll steps (goal is to reduce the number of classe sper item to minimum)
  // ----------------------------------------------------------------------------------------------------------
  // pgScrollSteps = [1000, 100, 10]; -> 6759 / 354 = 19 classes per item
  // pgScrollSteps = [2500, 500, 100, 20]; -> 4137 / 354 = 11.6 classes per item
  // pgScrollSteps = [2560, 1280, 640, 320, 160, 80, 40, 20]; -> 2502 / 354 = 7 classes per item
  // pgScrollSteps = [5120, 2560, 1280, 640, 320, 160, 80, 40, 20]; -> 2502 / 354 = 7 classes per item
  // pgScrollSteps = [5120, 2560, 1280, 640, 320, 160, 80, 40, 20, 10]; -> 2772 / 354 = 7.8 classes per item